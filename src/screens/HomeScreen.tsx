import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Card, Button, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { DeskGarden } from '../components/DeskGarden';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { deriveMood } from '../data/garden';
import { recommend } from '../data/engine';
import { hapticTap } from '../services/haptics';

export function HomeScreen() {
  const go = useNav((s) => s.go);
  const { gardenPoints, streak, isPremium } = useStore();
  const resetsToday = useStore((s) => s.resetsToday());
  const hoursSince = useStore((s) => s.hoursSinceLastReset());

  const mood = deriveMood({ hoursSinceLastReset: hoursSince, resetsToday });

  const greeting = getGreeting();

  const quickReset = () => {
    const ex = recommend({
      equipment: useStore.getState().equipment,
      isPremium: useStore.getState().isPremium,
      history: useStore.getState().resets,
    });
    if (ex) go('reset', { exercise: ex });
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View>
          <Txt variant="small" color={colors.textMuted}>
            {greeting}
          </Txt>
          <Txt variant="title">Your Desk Garden</Txt>
        </View>
        <View style={styles.stats}>
          <Stat value={`${streak}`} label="day streak" emoji="🔥" />
          <Stat value={`${gardenPoints}`} label="points" emoji="✨" />
        </View>
      </View>

      <DeskGarden points={gardenPoints} mood={mood} />

      <Card style={styles.checkinCard}>
        <Txt variant="h3">How are you right now?</Txt>
        <Txt variant="small" color={colors.textMuted} style={{ marginTop: 2 }}>
          One tap. We'll match you with a 2-minute reset.
        </Txt>
        <Button
          title="Check in"
          onPress={() => go('checkin')}
          style={{ marginTop: spacing.md }}
        />
        <Pressable onPress={quickReset} style={styles.quick}>
          <Txt variant="small" color={colors.primaryDark}>
            or surprise me with a quick reset →
          </Txt>
        </Pressable>
      </Card>

      <Txt variant="h3" style={styles.sectionTitle}>
        Focus modes
      </Txt>

      <ModeCard
        emoji="🔁"
        title="Meeting Recovery"
        desc="Just finished a call? Reset your head before the next thing."
        premium={!isPremium}
        onPress={() => {
          hapticTap();
          if (!isPremium) return go('paywall', { paywallSource: 'meetingRecovery' });
          const ex = recommend({
            equipment: useStore.getState().equipment,
            isPremium: true,
            history: useStore.getState().resets,
            mode: 'meetingRecovery',
          });
          if (ex) go('reset', { exercise: ex, mode: 'meetingRecovery' });
        }}
      />

      <ModeCard
        emoji="🔥"
        title="Deadline Survival"
        desc="Crunch time. A quiet 60-second reset so you don't burn out."
        premium={!isPremium}
        onPress={() => {
          hapticTap();
          if (!isPremium) return go('paywall', { paywallSource: 'deadlineSurvival' });
          const ex = recommend({
            equipment: useStore.getState().equipment,
            isPremium: true,
            history: useStore.getState().resets,
            mode: 'deadlineSurvival',
            stealthOnly: true,
          });
          if (ex) go('reset', { exercise: ex, mode: 'deadlineSurvival' });
        }}
      />

      {!isPremium && (
        <Pressable
          onPress={() => go('paywall', { paywallSource: 'home' })}
          style={styles.upsell}
        >
          <Text style={{ fontSize: 26 }}>🌟</Text>
          <View style={{ flex: 1 }}>
            <Txt variant="bodyStrong" color={colors.primaryDark}>
              Unlock DeskZen Premium
            </Txt>
            <Txt variant="small" color={colors.textMuted}>
              AI-matched resets, all voices, weekly insights & more.
            </Txt>
          </View>
          <Txt variant="h3" color={colors.primaryDark}>
            ›
          </Txt>
        </Pressable>
      )}
    </Screen>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning ☀️';
  if (h < 18) return 'Good afternoon 🌤️';
  return 'Good evening 🌙';
}

function Stat({ value, label, emoji }: { value: string; label: string; emoji: string }) {
  return (
    <View style={styles.stat}>
      <Txt variant="h3">
        {emoji} {value}
      </Txt>
      <Txt variant="tiny" color={colors.textFaint}>
        {label.toUpperCase()}
      </Txt>
    </View>
  );
}

function ModeCard({
  emoji,
  title,
  desc,
  premium,
  onPress,
}: {
  emoji: string;
  title: string;
  desc: string;
  premium: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.mode}>
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={styles.modeTitleRow}>
          <Txt variant="bodyStrong">{title}</Txt>
          {premium && <Tag text="Premium" color={colors.sun} />}
        </View>
        <Txt variant="small" color={colors.textMuted}>
          {desc}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { alignItems: 'flex-end' },
  checkinCard: { marginTop: spacing.lg },
  quick: { alignItems: 'center', paddingVertical: spacing.md },
  sectionTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  mode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  modeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
});
