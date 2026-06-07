import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt } from '../components/ui';
import { colors, spacing, radius } from '../theme';
import { CHECK_INS } from '../data/checkins';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { recommend } from '../data/engine';
import { CheckInState } from '../types';
import { hapticSelect } from '../services/haptics';

export function CheckInScreen() {
  const go = useNav((s) => s.go);
  const back = useNav((s) => s.back);
  const logCheckIn = useStore((s) => s.logCheckIn);

  const pick = (state: CheckInState) => {
    hapticSelect();
    logCheckIn(state);
    const ex = recommend({
      state,
      equipment: useStore.getState().equipment,
      isPremium: useStore.getState().isPremium,
      history: useStore.getState().resets,
    });
    if (ex) go('reset', { exercise: ex, stateBefore: state });
    else back();
  };

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={back} hitSlop={12}>
          <Txt variant="h3" color={colors.textMuted}>
            ✕
          </Txt>
        </Pressable>
      </View>

      <View style={styles.head}>
        <Txt variant="title">What are you feeling?</Txt>
        <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          Tap one. That's the whole check-in.
        </Txt>
      </View>

      <View style={styles.grid}>
        {CHECK_INS.map((c) => (
          <Pressable key={c.state} style={styles.tile} onPress={() => pick(c.state)}>
            <Text style={styles.emoji}>{c.emoji}</Text>
            <Txt variant="bodyStrong">{c.label}</Txt>
            <Txt variant="small" color={colors.textMuted} style={styles.caption}>
              {c.caption}
            </Txt>
          </Pressable>
        ))}
        <View style={[styles.tile, styles.tileGhost]} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { padding: spacing.lg, alignItems: 'flex-end' },
  head: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  tileGhost: { backgroundColor: 'transparent' },
  emoji: { fontSize: 46, marginBottom: spacing.sm },
  caption: { textAlign: 'center' },
});
