import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { Screen, Txt, Button, Card } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { plantStage } from '../data/garden';
import { CHECK_IN_BY_STATE } from '../data/checkins';
import { useT, TKey } from '../i18n';

export function RewardScreen() {
  const { params, go } = useNav();
  const t = useT();
  const { gardenPoints, streak } = useStore();
  const resetsToday = useStore((s) => s.resetsToday());

  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
  }, [pop]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const gained = params.gained ?? 10;
  const stateMeta = params.stateBefore ? CHECK_IN_BY_STATE[params.stateBefore] : undefined;

  const careLine = t(stateMeta ? careLineKey(stateMeta.zones[0]) : 'reward.careLine.default');

  return (
    <Screen>
      <View style={styles.body}>
        <Animated.View style={[styles.plantWrap, { transform: [{ scale }] }]}>
          <View style={styles.plantGlow} />
          <View style={styles.plantGroup}>
            <Text style={styles.plant}>{plantStage(gardenPoints)}</Text>
            <View style={styles.potRim} />
            <View style={styles.potBody} />
          </View>
        </Animated.View>
        <Txt variant="title" style={{ textAlign: 'center' }}>
          {t('reward.title')}
        </Txt>
        <Txt
          variant="body"
          color={colors.textMuted}
          style={{ textAlign: 'center', marginTop: spacing.sm }}
        >
          {careLine} {t('reward.brightened')}
        </Txt>

        <Card style={styles.statsCard}>
          <StatLine emoji="✨" label={t('reward.pointsEarned')} value={`+${gained}`} />
          <View style={styles.divider} />
          <StatLine emoji="🔥" label={t('reward.dayStreak')} value={`${streak}`} />
          <View style={styles.divider} />
          <StatLine emoji="✅" label={t('reward.resetsToday')} value={`${resetsToday}`} />
        </Card>

        {resetsToday >= 3 && (
          <View style={styles.badge}>
            <Text style={{ fontSize: 20 }}>🏆</Text>
            <Txt variant="small" color={colors.primaryDark}>
              {t('reward.badge')}
            </Txt>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button title={t('reward.back')} onPress={() => go('home')} />
      </View>
    </Screen>
  );
}

function careLineKey(zone: string): TKey {
  switch (zone) {
    case 'eyes':
      return 'reward.careLine.eyes';
    case 'neck':
      return 'reward.careLine.neck';
    case 'back':
      return 'reward.careLine.back';
    case 'wrists':
      return 'reward.careLine.wrists';
    default:
      return 'reward.careLine.mind';
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

const WOOD_DARK = '#B0865E';

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  plantWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  plantGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.sun + '55',
  },
  plantGroup: { alignItems: 'center' },
  plant: { fontSize: 84, marginBottom: -6 },
  potRim: {
    width: 70,
    height: 16,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
    marginBottom: -2,
  },
  potBody: {
    width: 54,
    height: 46,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.clay,
  },
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
