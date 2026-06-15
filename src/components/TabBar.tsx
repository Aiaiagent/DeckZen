import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, font, shadow } from '../theme';
import { Route, TABS, useNav } from '../navigation/nav';
import { hapticSelect } from '../services/haptics';
import { useT, TKey } from '../i18n';

const META: Record<string, { labelKey: TKey; emoji: string }> = {
  home: { labelKey: 'tab.desk', emoji: '🪴' },
  insights: { labelKey: 'tab.insights', emoji: '📊' },
  settings: { labelKey: 'tab.settings', emoji: '⚙️' },
};

export function TabBar() {
  const insets = useSafeAreaInsets();
  const route = useNav((s) => s.route);
  const go = useNav((s) => s.go);
  const t = useT();

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
              {t(META[tab].labelKey).toUpperCase()}
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
