import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Card, Button } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { DeskGarden } from '../components/DeskGarden';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { deriveMood } from '../data/garden';
import { recommend } from '../data/engine';
import { hapticTap } from '../services/haptics';
import { useT, TKey } from '../i18n';

export function HomeScreen() {
  const go = useNav((s) => s.go);
  const t = useT();
  const { gardenPoints, streak, isPremium } = useStore();
  const resetsToday = useStore((s) => s.resetsToday());
  const hoursSince = useStore((s) => s.hoursSinceLastReset());

  const mood = deriveMood({ hoursSinceLastReset: hoursSince, resetsToday });
  const greeting = t(greetingKey());
  const contextLine = t(contextLineKey(mood, resetsToday));

  const quickReset = () => {
    const ex = recommend({
      equipment: useStore.getState().equipment,
      isPremium: useStore.getState().isPremium,
      history: useStore.getState().resets,
    });
    if (ex) go('reset', { exercise: ex });
  };

  const startMode = (mode: 'meetingRecovery' | 'deadlineSurvival') => {
    hapticTap();
    const ex = recommend({
      equipment: useStore.getState().equipment,
      isPremium: useStore.getState().isPremium,
      history: useStore.getState().resets,
      mode,
      stealthOnly: mode === 'deadlineSurvival',
    });
    if (ex) go('reset', { exercise: ex, mode });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Txt variant="small" color={colors.textMuted}>
          {greeting}
        </Txt>
        <Txt variant="title" style={styles.contextLine}>
          {contextLine}
        </Txt>
      </View>

      <DeskGarden points={gardenPoints} mood={mood} />

      <View style={styles.chips}>
        <ProgressChip emoji="✅" value={`${resetsToday}`} label={t('home.chip.today')} />
        <ProgressChip emoji="🔥" value={`${streak}`} label={t('home.chip.streak')} />
        <ProgressChip emoji="✨" value={`${gardenPoints}`} label={t('home.chip.points')} />
      </View>

      <View style={styles.actions}>
        <Button title={t('home.reset2min')} onPress={quickReset} />
        <Button
          title={t('home.checkInFirst')}
          variant="secondary"
          onPress={() => go('checkin')}
          style={styles.secondaryBtn}
        />
      </View>

      {isPremium && (
        <View style={styles.modes}>
          <ModeChip
            emoji="🔁"
            label={t('home.mode.meeting')}
            onPress={() => startMode('meetingRecovery')}
          />
          <ModeChip
            emoji="🔥"
            label={t('home.mode.deadline')}
            onPress={() => startMode('deadlineSurvival')}
          />
        </View>
      )}

      {!isPremium && (
        <Pressable
          onPress={() => {
            hapticTap();
            go('paywall', { paywallSource: 'home' });
          }}
          style={styles.upsell}
        >
          <View style={styles.upsellGlow} />
          <Text style={styles.upsellEmoji}>🌿</Text>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong" color={colors.primaryDark}>
              {t('home.upsell.title')}
            </Txt>
            <Txt variant="small" color={colors.textMuted} style={styles.upsellDesc}>
              {t('home.upsell.body')}
            </Txt>
          </View>
          <Txt variant="h2" color={colors.primaryDark}>
            ›
          </Txt>
        </Pressable>
      )}
    </Screen>
  );
}

function greetingKey(): TKey {
  const h = new Date().getHours();
  if (h < 12) return 'home.greetingMorning';
  if (h < 18) return 'home.greetingAfternoon';
  return 'home.greetingEvening';
}

function contextLineKey(mood: string, resetsToday: number): TKey {
  if (mood === 'wilting') return 'home.ctx.wilting';
  if (mood === 'stressed') return 'home.ctx.stressed';
  if (mood === 'thriving') return 'home.ctx.thriving';
  if (mood === 'recovering') return 'home.ctx.recovering';
  if (resetsToday === 0) return 'home.ctx.start';
  return 'home.ctx.default';
}

function ProgressChip({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Txt variant="bodyStrong">{value}</Txt>
      <Txt variant="tiny" color={colors.textFaint}>
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

function ModeChip({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mode,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <Text style={styles.modeEmoji}>{emoji}</Text>
      <Txt variant="small" color={colors.primaryDark} style={styles.modeLabel}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  header: { marginBottom: spacing.lg, gap: 2 },
  contextLine: { marginTop: 2, lineHeight: 33 },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  chipEmoji: { fontSize: 15 },
  actions: { marginTop: spacing.xl, gap: spacing.md },
  secondaryBtn: { marginTop: 0 },
  modes: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  mode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  modeEmoji: { fontSize: 18 },
  modeLabel: { flexShrink: 1 },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    overflow: 'hidden',
  },
  upsellGlow: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.sun + '33',
  },
  upsellEmoji: { fontSize: 28 },
  upsellDesc: { marginTop: 2, lineHeight: 19 },
});
