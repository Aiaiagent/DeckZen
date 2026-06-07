import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, font, shadow } from '../theme';
import { Route, TABS, useNav } from '../navigation/nav';
import { hapticSelect } from '../services/haptics';

const META: Record<string, { label: string; emoji: string }> = {
  home: { label: 'Desk', emoji: '🪴' },
  insights: { label: 'Insights', emoji: '📊' },
  settings: { label: 'Settings', emoji: '⚙️' },
};

export function TabBar() {
  const insets = useSafeAreaInsets();
  const route = useNav((s) => s.route);
  const go = useNav((s) => s.go);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {TABS.map((tab) => {
        const active = route === tab;
        return (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => {
              hapticSelect();
              go(tab as Route);
            }}
          >
            <Text style={[styles.emoji, { opacity: active ? 1 : 0.45 }]}>
              {META[tab].emoji}
            </Text>
            <Text
              style={[
                font.tiny,
                { color: active ? colors.primaryDark : colors.textFaint },
              ]}
            >
              {META[tab].label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    ...shadow.soft,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  emoji: { fontSize: 22 },
});
