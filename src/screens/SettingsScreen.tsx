import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Switch, Alert } from 'react-native';
import { Screen, Txt, Card, Button, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { TONES } from '../data/tones';
import { NotificationTone, Equipment, WorkRhythm, Language } from '../types';
import { hapticSelect } from '../services/haptics';
import { rescheduleNudges, sendDemoNudge, isExpoGo } from '../services/notifications';
import { restore } from '../services/purchases';
import { useT, TKey } from '../i18n';

const EQUIPMENT: { id: Equipment; labelKey: TKey }[] = [
  { id: 'stressBall', labelKey: 'equipment.stressBall' },
  { id: 'massageRoller', labelKey: 'equipment.massageRoller' },
  { id: 'ergoChair', labelKey: 'equipment.ergoChair' },
  { id: 'standingDesk', labelKey: 'equipment.standingDesk' },
];

const RHYTHMS: { id: WorkRhythm; labelKey: TKey }[] = [
  { id: 'nineToSix', labelKey: 'rhythm.nineToSix' },
  { id: 'hybrid', labelKey: 'rhythm.hybrid' },
  { id: 'freelance', labelKey: 'rhythm.freelance' },
  { id: 'nightShift', labelKey: 'rhythm.nightShift' },
];

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'vi', label: 'Tiếng Việt' },
  { id: 'ja', label: '日本語' },
  { id: 'ko', label: '한국어' },
  { id: 'th', label: 'ไทย' },
  { id: 'es', label: 'Español' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
];

function toneLabelKey(tone: NotificationTone): TKey {
  return `tone.label.${tone}` as TKey;
}
function toneSampleKey(tone: NotificationTone): TKey {
  return `tone.sample.${tone}` as TKey;
}

export function SettingsScreen() {
  const go = useNav((s) => s.go);
  const t = useT();
  const store = useStore();
  const {
    tone,
    setTone,
    equipment,
    setEquipment,
    workRhythm,
    setWorkRhythm,
    language,
    setLanguage,
    nudgesEnabled,
    setNudgesEnabled,
    isPremium,
    setPremium,
  } = store;
  const [restoring, setRestoring] = useState(false);

  const pickTone = (toneId: NotificationTone, premium: boolean) => {
    if (premium && !isPremium) {
      go('paywall', { paywallSource: 'tone' });
      return;
    }
    hapticSelect();
    setTone(toneId);
    rescheduleNudges({ enabled: nudgesEnabled, tone: toneId, rhythm: workRhythm });
  };

  const toggleEquipment = (id: Equipment) => {
    hapticSelect();
    const has = equipment.includes(id);
    const next = has ? equipment.filter((e) => e !== id) : [...equipment.filter((e) => e !== 'none'), id];
    setEquipment(next);
  };

  const onNudges = (v: boolean) => {
    setNudgesEnabled(v);
    rescheduleNudges({ enabled: v, tone, rhythm: workRhythm });
  };

  const onRestore = async () => {
    setRestoring(true);
    const res = await restore();
    setRestoring(false);
    if (res.isPremium) {
      setPremium(true);
      Alert.alert(t('settings.alert.premiumActive.title'), t('settings.alert.premiumActive.body'));
    } else {
      Alert.alert(
        t('settings.alert.nothingRestore.title'),
        t('settings.alert.nothingRestore.body'),
      );
    }
  };

  return (
    <Screen scroll>
      <Txt variant="title">{t('settings.title')}</Txt>

      {/* Premium status */}
      <Card style={[styles.premiumCard, isPremium && styles.premiumActive]}>
        <View style={{ flex: 1 }}>
          <Txt variant="h3" color={isPremium ? colors.primaryDark : colors.text}>
            {isPremium ? t('settings.premiumActive') : t('settings.free')}
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            {isPremium ? t('settings.premiumActiveSub') : t('settings.freeSub')}
          </Txt>
        </View>
        {!isPremium && (
          <Button title={t('settings.upgrade')} onPress={() => go('paywall', { paywallSource: 'settings' })} />
        )}
      </Card>

      {/* Language */}
      <Txt variant="h3" style={styles.section}>
        {t('settings.section.language')}
      </Txt>
      <View style={styles.chips}>
        {LANGUAGES.map((l) => (
          <Chip
            key={l.id}
            label={l.label}
            active={language === l.id}
            onPress={() => {
              hapticSelect();
              setLanguage(l.id);
            }}
          />
        ))}
      </View>

      {/* Nudge voice */}
      <Txt variant="h3" style={styles.section}>
        {t('settings.section.nudgeVoice')}
      </Txt>
      {TONES.map((tn) => {
        const locked = tn.premium && !isPremium;
        const active = tone === tn.tone;
        return (
          <Pressable
            key={tn.tone}
            onPress={() => pickTone(tn.tone, tn.premium)}
            style={[styles.toneRow, active && styles.toneRowActive]}
          >
            <Text style={{ fontSize: 24 }}>{tn.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.toneTitle}>
                <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
                  {t(toneLabelKey(tn.tone))}
                </Txt>
                {locked && <Tag text={t('settings.premiumTag')} color={colors.sun} />}
              </View>
              <Txt variant="small" color={colors.textMuted}>
                {t(toneSampleKey(tn.tone))}
              </Txt>
            </View>
            {active && <Txt variant="h3" color={colors.primary}>✓</Txt>}
          </Pressable>
        );
      })}

      {/* Smart nudges */}
      <Txt variant="h3" style={styles.section}>
        Smart nudges
      </Txt>
      <Card>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong">{t('settings.nudges.title')}</Txt>
            <Txt variant="small" color={colors.textMuted}>
              {t('settings.nudges.body')}
            </Txt>
          </View>
          <Switch
            value={nudgesEnabled}
            onValueChange={onNudges}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>
        <Pressable
          onPress={async () => {
            if (isExpoGo) {
              Alert.alert(
                t('settings.alert.devBuild.title'),
                t('settings.alert.devBuild.body'),
              );
              return;
            }
            const ok = await sendDemoNudge(tone);
            if (!ok)
              Alert.alert(
                t('settings.alert.notifOff.title'),
                t('settings.alert.notifOff.body'),
              );
          }}
          style={styles.demo}
        >
          <Txt variant="small" color={colors.primaryDark}>
            {t('settings.nudges.preview')}
          </Txt>
        </Pressable>
      </Card>

      {/* Work rhythm */}
      <Txt variant="h3" style={styles.section}>
        {t('settings.section.workRhythm')}
      </Txt>
      <View style={styles.chips}>
        {RHYTHMS.map((r) => (
          <Chip
            key={r.id}
            label={t(r.labelKey)}
            active={workRhythm === r.id}
            onPress={() => {
              hapticSelect();
              setWorkRhythm(r.id);
              rescheduleNudges({ enabled: nudgesEnabled, tone, rhythm: r.id });
            }}
          />
        ))}
      </View>

      {/* Equipment */}
      <Txt variant="h3" style={styles.section}>
        {t('settings.section.equipment')}
      </Txt>
      <View style={styles.chips}>
        {EQUIPMENT.map((e) => (
          <Chip
            key={e.id}
            label={t(e.labelKey)}
            active={equipment.includes(e.id)}
            onPress={() => toggleEquipment(e.id)}
          />
        ))}
      </View>

      {/* Account */}
      <Txt variant="h3" style={styles.section}>
        {t('settings.section.account')}
      </Txt>
      <Button title={t('settings.restore')} variant="secondary" loading={restoring} onPress={onRestore} />
      <Button
        title={t('settings.resetData')}
        variant="ghost"
        onPress={() =>
          Alert.alert(t('settings.alert.resetData.title'), t('settings.alert.resetData.body'), [
            { text: t('settings.alert.cancel'), style: 'cancel' },
            { text: t('settings.alert.reset'), style: 'destructive', onPress: () => store.resetAll() },
          ])
        }
      />

      <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
        {t('settings.disclaimer')}
      </Txt>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Txt variant="small" color={active ? colors.onPrimary : colors.textMuted}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  premiumActive: { backgroundColor: colors.primarySoft },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toneRowActive: { borderColor: colors.primary },
  toneTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  demo: { paddingTop: spacing.md, marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: { backgroundColor: colors.primary },
  disclaimer: { marginTop: spacing.xxl, lineHeight: 16 },
});
