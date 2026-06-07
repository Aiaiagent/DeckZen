import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { Screen, Txt, Button, Card } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { plantStage } from '../data/garden';
import { CHECK_IN_BY_STATE } from '../data/checkins';

export function RewardScreen() {
  const { params, go } = useNav();
  const { gardenPoints, streak } = useStore();
  const resetsToday = useStore((s) => s.resetsToday());

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
  }, [pop]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const gained = params.gained ?? 10;
  const stateMeta = params.stateBefore ? CHECK_IN_BY_STATE[params.stateBefore] : undefined;

  const careLine = stateMeta
    ? `You just looked after ${zoneWord(stateMeta.zones[0])}.`
    : 'You just gave yourself a real break.';

  return (
    <Screen>
      <View style={styles.body}>
        <Animated.Text style={[styles.plant, { transform: [{ scale }] }]}>
          {plantStage(gardenPoints)}
        </Animated.Text>
        <Txt variant="title" style={{ textAlign: 'center' }}>
          Nice reset 🌟
        </Txt>
        <Txt
          variant="body"
          color={colors.textMuted}
          style={{ textAlign: 'center', marginTop: spacing.sm }}
        >
          {careLine} Your desk garden just brightened up.
        </Txt>

        <Card style={styles.statsCard}>
          <StatLine emoji="✨" label="Points earned" value={`+${gained}`} />
          <View style={styles.divider} />
          <StatLine emoji="🔥" label="Day streak" value={`${streak}`} />
          <View style={styles.divider} />
          <StatLine emoji="✅" label="Resets today" value={`${resetsToday}`} />
        </Card>

        {resetsToday >= 3 && (
          <View style={styles.badge}>
            <Text style={{ fontSize: 20 }}>🏆</Text>
            <Txt variant="small" color={colors.primaryDark}>
              3 resets today — your garden is thriving!
            </Txt>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="Back to my desk" onPress={() => go('home')} />
      </View>
    </Screen>
  );
}

function zoneWord(zone: string): string {
  switch (zone) {
    case 'eyes':
      return 'your eyes';
    case 'neck':
      return 'your neck and shoulders';
    case 'back':
      return 'your back';
    case 'wrists':
      return 'your wrists';
    default:
      return 'your mind';
  }
}

function StatLine({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statLine}>
      <Txt variant="body">
        {emoji}  {label}
      </Txt>
      <Txt variant="h3" color={colors.primaryDark}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  plant: { fontSize: 110, marginBottom: spacing.lg },
  statsCard: { alignSelf: 'stretch', marginTop: spacing.xl },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.border },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.lg,
  },
  footer: { padding: spacing.lg },
});
