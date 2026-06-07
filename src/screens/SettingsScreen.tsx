import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Switch, Alert } from 'react-native';
import { Screen, Txt, Card, Button, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { TONES } from '../data/tones';
import { NotificationTone, Equipment, WorkRhythm } from '../types';
import { hapticSelect } from '../services/haptics';
import { rescheduleNudges, sendDemoNudge, isExpoGo } from '../services/notifications';
import { restore } from '../services/purchases';

const EQUIPMENT: { id: Equipment; label: string }[] = [
  { id: 'stressBall', label: 'Stress ball' },
  { id: 'massageRoller', label: 'Roller' },
  { id: 'ergoChair', label: 'Ergo chair' },
  { id: 'standingDesk', label: 'Standing desk' },
];

const RHYTHMS: { id: WorkRhythm; label: string }[] = [
  { id: 'nineToSix', label: '9–6' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'freelance', label: 'Freelance' },
  { id: 'nightShift', label: 'Night' },
];

export function SettingsScreen() {
  const go = useNav((s) => s.go);
  const store = useStore();
  const {
    tone,
    setTone,
    equipment,
    setEquipment,
    workRhythm,
    setWorkRhythm,
    nudgesEnabled,
    setNudgesEnabled,
    isPremium,
    setPremium,
  } = store;
  const [restoring, setRestoring] = useState(false);

  const pickTone = (t: NotificationTone, premium: boolean) => {
    if (premium && !isPremium) {
      go('paywall', { paywallSource: 'tone' });
      return;
    }
    hapticSelect();
    setTone(t);
    rescheduleNudges({ enabled: nudgesEnabled, tone: t, rhythm: workRhythm });
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
      Alert.alert('Restored', 'Your Premium subscription is active.');
    } else {
      Alert.alert('Nothing to restore', 'No active subscription was found for this account.');
    }
  };

  return (
    <Screen scroll>
      <Txt variant="title">Settings</Txt>

      {/* Premium status */}
      <Card style={[styles.premiumCard, isPremium && styles.premiumActive]}>
        <View style={{ flex: 1 }}>
          <Txt variant="h3" color={isPremium ? colors.primaryDark : colors.text}>
            {isPremium ? '🌟 Premium active' : 'DeskZen Free'}
          </Txt>
          <Txt variant="small" color={colors.textMuted}>
            {isPremium
              ? 'Thanks for supporting DeskZen.'
              : 'Unlock all voices, modes & insights.'}
          </Txt>
        </View>
        {!isPremium && (
          <Button title="Upgrade" onPress={() => go('paywall', { paywallSource: 'settings' })} />
        )}
      </Card>

      {/* Nudge voice */}
      <Txt variant="h3" style={styles.section}>
        Nudge voice
      </Txt>
      {TONES.map((t) => {
        const locked = t.premium && !isPremium;
        const active = tone === t.tone;
        return (
          <Pressable
            key={t.tone}
            onPress={() => pickTone(t.tone, t.premium)}
            style={[styles.toneRow, active && styles.toneRowActive]}
          >
            <Text style={{ fontSize: 24 }}>{t.emoji}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.toneTitle}>
                <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
                  {t.label}
                </Txt>
                {locked && <Tag text="Premium" color={colors.sun} />}
              </View>
              <Txt variant="small" color={colors.textMuted}>
                {t.sample}
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
            <Txt variant="bodyStrong">Daily reset reminders</Txt>
            <Txt variant="small" color={colors.textMuted}>
              Gentle nudges timed to your work rhythm.
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
                'Nudges need a dev build',
                'Reminders run in a development or App Store / Play build. Expo Go (SDK 53+) no longer supports them.',
              );
              return;
            }
            const ok = await sendDemoNudge(tone);
            if (!ok)
              Alert.alert(
                'Notifications off',
                'Enable notifications for DeskZen to preview a nudge.',
              );
          }}
          style={styles.demo}
        >
          <Txt variant="small" color={colors.primaryDark}>
            🔔 Preview a nudge (arrives in ~3s)
          </Txt>
        </Pressable>
      </Card>

      {/* Work rhythm */}
      <Txt variant="h3" style={styles.section}>
        Work rhythm
      </Txt>
      <View style={styles.chips}>
        {RHYTHMS.map((r) => (
          <Chip
            key={r.id}
            label={r.label}
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
        Desk equipment
      </Txt>
      <View style={styles.chips}>
        {EQUIPMENT.map((e) => (
          <Chip
            key={e.id}
            label={e.label}
            active={equipment.includes(e.id)}
            onPress={() => toggleEquipment(e.id)}
          />
        ))}
      </View>

      {/* Account */}
      <Txt variant="h3" style={styles.section}>
        Account
      </Txt>
      <Button title="Restore purchases" variant="secondary" loading={restoring} onPress={onRestore} />
      <Button
        title="Reset all data"
        variant="ghost"
        onPress={() =>
          Alert.alert('Reset all data?', 'This clears your garden, streak and history.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: () => store.resetAll() },
          ])
        }
      />

      <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
        DeskZen supports general wellbeing and healthy break habits. It is not a
        medical device and does not diagnose, treat, or prevent any condition.
        Breathing exercises are gentle by design — stop if you feel lightheaded.
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
