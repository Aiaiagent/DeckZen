import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Button } from '../components/ui';
import { colors, spacing, radius } from '../theme';
import { useStore } from '../store/useStore';
import { Equipment, NotificationTone, WorkRhythm } from '../types';
import { TONES } from '../data/tones';
import { hapticSelect } from '../services/haptics';
import { rescheduleNudges } from '../services/notifications';
import { useT, TKey } from '../i18n';

const RHYTHMS: { id: WorkRhythm; labelKey: TKey; emoji: string }[] = [
  { id: 'nineToSix', labelKey: 'rhythm.nineToSix', emoji: '🏢' },
  { id: 'hybrid', labelKey: 'rhythm.hybrid', emoji: '🏡' },
  { id: 'freelance', labelKey: 'rhythm.freelance', emoji: '🧑‍💻' },
  { id: 'nightShift', labelKey: 'rhythm.nightShift', emoji: '🌙' },
];

const EQUIPMENT: { id: Equipment; labelKey: TKey; emoji: string }[] = [
  { id: 'stressBall', labelKey: 'equipment.stressBall', emoji: '🔴' },
  { id: 'massageRoller', labelKey: 'equipment.massageRoller', emoji: '🧻' },
  { id: 'ergoChair', labelKey: 'equipment.ergoChair', emoji: '🪑' },
  { id: 'standingDesk', labelKey: 'equipment.standingDesk', emoji: '🧍' },
];

function toneLabelKey(tone: NotificationTone): TKey {
  return `tone.label.${tone}` as TKey;
}
function toneSampleKey(tone: NotificationTone): TKey {
  return `tone.sample.${tone}` as TKey;
}

const STEP_COUNT = 4;

export function OnboardingScreen() {
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const t = useT();
  const [step, setStep] = useState(0);
  const [rhythm, setRhythm] = useState<WorkRhythm>('nineToSix');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [tone, setTone] = useState<NotificationTone>('cute');

  const toggleEquipment = (id: Equipment) => {
    hapticSelect();
    setEquipment((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const finish = () => {
    const eq = equipment.length ? equipment : (['none'] as Equipment[]);
    completeOnboarding({ workRhythm: rhythm, equipment: eq, tone });
    rescheduleNudges({ enabled: true, tone, rhythm });
  };

  const ctaLabel =
    step === 0
      ? t('onboarding.cta.setup')
      : step === 3
        ? t('onboarding.cta.go')
        : t('onboarding.cta.continue');

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.progress}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.intro}>
          <View style={styles.heroVisual}>
            <View style={styles.heroGlowOuter} />
            <View style={styles.heroGlowInner} />
            <View style={styles.plantGroup}>
              <Text style={styles.plant}>🪴</Text>
              <View style={styles.potRim} />
              <View style={styles.potBody} />
            </View>
          </View>

          <Txt variant="hero" style={styles.heroTitle}>
            {t('onboarding.hero.title')}
          </Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.heroSub}>
            {t('onboarding.hero.sub')}
          </Txt>
          <Txt variant="small" color={colors.textFaint} style={styles.heroSupport}>
            {t('onboarding.hero.support')}
          </Txt>
        </View>
      )}

      {step === 1 && (
        <View style={styles.stepBody}>
          <Txt variant="title">{t('onboarding.rhythm.title')}</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            {t('onboarding.rhythm.sub')}
          </Txt>
          <View style={styles.grid}>
            {RHYTHMS.map((r) => (
              <Choice
                key={r.id}
                emoji={r.emoji}
                label={t(r.labelKey)}
                active={rhythm === r.id}
                onPress={() => {
                  hapticSelect();
                  setRhythm(r.id);
                }}
              />
            ))}
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepBody}>
          <Txt variant="title">{t('onboarding.equipment.title')}</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            {t('onboarding.equipment.sub')}
          </Txt>
          <View style={styles.grid}>
            {EQUIPMENT.map((e) => (
              <Choice
                key={e.id}
                emoji={e.emoji}
                label={t(e.labelKey)}
                active={equipment.includes(e.id)}
                onPress={() => toggleEquipment(e.id)}
              />
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepBody}>
          <Txt variant="title">{t('onboarding.tone.title')}</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            {t('onboarding.tone.sub')}
          </Txt>
          {TONES.filter((tn) => !tn.premium).map((tn) => (
            <ToneRow
              key={tn.tone}
              active={tone === tn.tone}
              emoji={tn.emoji}
              label={t(toneLabelKey(tn.tone))}
              sample={t(toneSampleKey(tn.tone))}
              onPress={() => {
                hapticSelect();
                setTone(tn.tone);
              }}
            />
          ))}
          <Txt variant="small" color={colors.textFaint} style={{ marginTop: spacing.sm }}>
            {t('onboarding.tone.premiumNote')}
          </Txt>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={ctaLabel}
          onPress={() => (step === 3 ? finish() : setStep((s) => s + 1))}
        />
        {step > 0 && (
          <Button title={t('onboarding.back')} variant="ghost" onPress={() => setStep((s) => s - 1)} />
        )}
      </View>

      {step === 0 && (
        <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
          {t('onboarding.disclaimer')}
        </Txt>
      )}
    </Screen>
  );
}

function Choice({
  emoji,
  label,
  active,
  onPress,
}: {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceActive]}>
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
        {label}
      </Txt>
    </Pressable>
  );
}

function ToneRow({
  emoji,
  label,
  sample,
  active,
  onPress,
}: {
  emoji: string;
  label: string;
  sample: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.toneRow, active && styles.toneRowActive]}>
      <Text style={{ fontSize: 26 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
          {label}
        </Txt>
        <Txt variant="small" color={colors.textMuted}>
          {sample}
        </Txt>
      </View>
      <View style={[styles.radio, active && styles.radioActive]}>
        {active && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

const WOOD_DARK = '#B0865E';

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  progress: { flexDirection: 'row', gap: 6, marginBottom: spacing.xl },
  dot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },

  // Step 0 — hero
  intro: { alignItems: 'center' },
  heroVisual: {
    width: '100%',
    height: 200,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  heroGlowOuter: {
    position: 'absolute',
    top: -44,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.sun + '44',
  },
  heroGlowInner: {
    position: 'absolute',
    top: 6,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sun + '66',
  },
  plantGroup: { alignItems: 'center', marginBottom: spacing.xl },
  plant: { fontSize: 76, marginBottom: -6 },
  potRim: {
    width: 66,
    height: 16,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
    marginBottom: -2,
  },
  potBody: {
    width: 52,
    height: 44,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.clay,
  },
  heroTitle: { textAlign: 'center' },
  heroSub: { textAlign: 'center', marginTop: spacing.md, lineHeight: 22, paddingHorizontal: spacing.sm },
  heroSupport: { textAlign: 'center', marginTop: spacing.md, lineHeight: 19, paddingHorizontal: spacing.sm },

  // Steps 1–3
  stepBody: {},
  lead: { marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  choice: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderSoft,
  },
  toneRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },

  footer: { marginTop: spacing.xxl, gap: spacing.sm },
  disclaimer: { marginTop: spacing.xl, lineHeight: 16, textAlign: 'center' },
});
