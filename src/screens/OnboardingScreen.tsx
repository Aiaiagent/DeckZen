import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Button, Card } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { Equipment, NotificationTone, WorkRhythm } from '../types';
import { TONES } from '../data/tones';
import { hapticSelect } from '../services/haptics';
import { rescheduleNudges } from '../services/notifications';

const RHYTHMS: { id: WorkRhythm; label: string; emoji: string }[] = [
  { id: 'nineToSix', label: '9 to 6', emoji: '🏢' },
  { id: 'hybrid', label: 'Hybrid / remote', emoji: '🏡' },
  { id: 'freelance', label: 'Freelance', emoji: '🧑‍💻' },
  { id: 'nightShift', label: 'Night shift', emoji: '🌙' },
];

const EQUIPMENT: { id: Equipment; label: string; emoji: string }[] = [
  { id: 'stressBall', label: 'Stress ball', emoji: '🔴' },
  { id: 'massageRoller', label: 'Massage roller', emoji: '🧻' },
  { id: 'ergoChair', label: 'Ergo chair', emoji: '🪑' },
  { id: 'standingDesk', label: 'Standing desk', emoji: '🧍' },
];

export function OnboardingScreen() {
  const completeOnboarding = useStore((s) => s.completeOnboarding);
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

  return (
    <Screen scroll>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View>
          <Txt variant="hero">Reset your{'\n'}workday in 2 minutes.</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            DeskZen nudges you out of the sitting-and-stressing loop with quick,
            personalized resets — no yoga mat, no 10-minute meditations.
          </Txt>
          <Card style={styles.promiseCard}>
            <Row emoji="👀" text="Ease screen-tired eyes with the 20-20-20 rule" />
            <Row emoji="🪨" text="Loosen a stiff neck and shoulders, discreetly" />
            <Row emoji="🌬️" text="Calm a racing mind between meetings" />
            <Row emoji="🪴" text="Grow a desk garden every time you reset" />
          </Card>
        </View>
      )}

      {step === 1 && (
        <View>
          <Txt variant="title">What's your work rhythm?</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            We'll time nudges around when you're actually at your desk.
          </Txt>
          <View style={styles.grid}>
            {RHYTHMS.map((r) => (
              <Choice
                key={r.id}
                emoji={r.emoji}
                label={r.label}
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
        <View>
          <Txt variant="title">Anything on your desk?</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            Optional. We'll suggest resets that use what you've got. Pick any.
          </Txt>
          <View style={styles.grid}>
            {EQUIPMENT.map((e) => (
              <Choice
                key={e.id}
                emoji={e.emoji}
                label={e.label}
                active={equipment.includes(e.id)}
                onPress={() => toggleEquipment(e.id)}
              />
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View>
          <Txt variant="title">Pick your nudge voice</Txt>
          <Txt variant="body" color={colors.textMuted} style={styles.lead}>
            How should DeskZen talk to you? (You can change this anytime.)
          </Txt>
          {TONES.filter((t) => !t.premium).map((t) => (
            <ToneRow
              key={t.tone}
              active={tone === t.tone}
              emoji={t.emoji}
              label={t.label}
              sample={t.sample}
              onPress={() => {
                hapticSelect();
                setTone(t.tone);
              }}
            />
          ))}
          <Txt variant="small" color={colors.textFaint} style={{ marginTop: spacing.sm }}>
            More voices (Gen Z Roast, Corporate, Calm Coach) unlock with Premium.
          </Txt>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
      <Button
        title={step === 3 ? "Let's go" : 'Continue'}
        onPress={() => (step === 3 ? finish() : setStep((s) => s + 1))}
      />
      {step > 0 && (
        <Button title="Back" variant="ghost" onPress={() => setStep((s) => s - 1)} />
      )}

      <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
        DeskZen supports general wellbeing and break habits. It is not a medical
        device and does not diagnose or treat any condition.
      </Txt>
    </Screen>
  );
}

function Row({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.row}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Txt variant="body" style={{ flex: 1 }}>
        {text}
      </Txt>
    </View>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, marginBottom: spacing.xl },
  dot: { width: 26, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  lead: { marginTop: spacing.sm, marginBottom: spacing.lg, lineHeight: 22 },
  promiseCard: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  choice: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
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
    borderColor: 'transparent',
  },
  toneRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  disclaimer: { marginTop: spacing.xl, lineHeight: 16, textAlign: 'center' },
});
