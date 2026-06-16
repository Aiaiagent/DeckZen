import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt } from '../components/ui';
import { colors, spacing, radius, shadow } from '../theme';
import { CHECK_INS } from '../data/checkins';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { recommend } from '../data/engine';
import { CheckInState } from '../types';
import { hapticSelect } from '../services/haptics';
import { useT, TKey } from '../i18n';

export function CheckInScreen() {
  const go = useNav((s) => s.go);
  const back = useNav((s) => s.back);
  const t = useT();
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
        <Txt variant="title">{t('checkin.title')}</Txt>
        <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          {t('checkin.subtitle')}
        </Txt>
      </View>

      <View style={styles.grid}>
        {CHECK_INS.map((c, i) => {
          const wide = i === CHECK_INS.length - 1 && CHECK_INS.length % 2 === 1;
          return (
            <Pressable
              key={c.state}
              onPress={() => pick(c.state)}
              style={({ pressed }) => [
                styles.tile,
                wide && styles.tileWide,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Text style={[styles.emoji, wide && styles.emojiWide]}>{c.emoji}</Text>
              <View style={wide ? styles.wideText : undefined}>
                <Txt variant="bodyStrong">{t(`checkin.label.${c.state}` as TKey)}</Txt>
                <Txt
                  variant="small"
                  color={colors.textMuted}
                  style={wide ? styles.captionWide : styles.caption}
                >
                  {t(`checkin.caption.${c.state}` as TKey)}
                </Txt>
              </View>
            </Pressable>
          );
        })}
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
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.card,
  },
  tileWide: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  wideText: { flex: 1 },
  emoji: { fontSize: 46, marginBottom: spacing.sm },
  emojiWide: { fontSize: 40, marginBottom: 0 },
  caption: { textAlign: 'center' },
  captionWide: { marginTop: 2 },
});
