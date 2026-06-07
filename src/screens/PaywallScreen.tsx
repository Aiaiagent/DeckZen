import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Screen, Txt, Card, Button, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { PLANS, purchase } from '../services/purchases';
import { hapticSelect, hapticSuccess } from '../services/haptics';

const BENEFITS = [
  { emoji: '🧠', title: 'AI-matched resets', desc: 'The right 2-minute reset for your exact state.' },
  { emoji: '🔁', title: 'Meeting Recovery', desc: 'Decompress and refocus between calls.' },
  { emoji: '🔥', title: 'Deadline Survival', desc: 'Quiet resets that keep you from burning out.' },
  { emoji: '🎙️', title: 'All nudge voices', desc: 'Gen Z Roast, Corporate, Calm Coach & more.' },
  { emoji: '🛠️', title: 'Equipment routines', desc: 'Resets tuned to your ball, roller or standing desk.' },
  { emoji: '📊', title: 'Weekly Health Insights', desc: 'Stress patterns, best times & exportable reports.' },
];

export function PaywallScreen() {
  const { back } = useNav();
  const setPremium = useStore((s) => s.setPremium);
  const [selected, setSelected] = useState(PLANS.find((p) => p.highlight)?.id ?? PLANS[0].id);
  const [busy, setBusy] = useState(false);

  const buy = async () => {
    setBusy(true);
    const res = await purchase(selected);
    setBusy(false);
    if (res.success && res.isPremium) {
      setPremium(true);
      hapticSuccess();
      Alert.alert('Welcome to Premium 🌟', 'Everything is unlocked. Enjoy your resets!', [
        { text: 'Great', onPress: back },
      ]);
    } else {
      Alert.alert('Purchase failed', res.error ?? 'Please try again.');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <Pressable onPress={back} hitSlop={12}>
          <Txt variant="h3" color={colors.textMuted}>
            ✕
          </Txt>
        </Pressable>
      </View>

      <Text style={styles.hero}>🌿</Text>
      <Txt variant="title" style={{ textAlign: 'center' }}>
        DeskZen Premium
      </Txt>
      <Txt
        variant="body"
        color={colors.textMuted}
        style={{ textAlign: 'center', marginTop: spacing.sm }}
      >
        Turn 2-minute breaks into a habit that actually sticks.
      </Txt>

      <Card style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b.title} style={styles.benefit}>
            <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyStrong">{b.title}</Txt>
              <Txt variant="small" color={colors.textMuted}>
                {b.desc}
              </Txt>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.plans}>
        {PLANS.map((p) => {
          const active = selected === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => {
                hapticSelect();
                setSelected(p.id);
              }}
              style={[styles.plan, active && styles.planActive]}
            >
              <View style={styles.planHead}>
                <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
                  {p.title}
                </Txt>
                {p.badge && <Tag text={p.badge} color={colors.sun} />}
              </View>
              <View style={styles.planPrice}>
                <Txt variant="title" color={active ? colors.primaryDark : colors.text}>
                  {p.price}
                </Txt>
                <Txt variant="small" color={colors.textMuted}>
                  {' '}
                  {p.period}
                </Txt>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        title={busy ? 'Processing…' : 'Start Premium'}
        loading={busy}
        onPress={buy}
        style={{ marginTop: spacing.lg }}
      />
      <Txt variant="tiny" color={colors.textFaint} style={styles.legal}>
        Subscriptions renew automatically until cancelled. Manage or cancel anytime
        in your App Store or Google Play account settings. (Demo build: purchases are
        simulated and unlock Premium locally.)
      </Txt>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', marginBottom: spacing.sm },
  hero: { fontSize: 72, textAlign: 'center' },
  benefits: { marginTop: spacing.xl, gap: spacing.lg },
  benefit: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  plans: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  plan: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  planActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  planPrice: { flexDirection: 'row', alignItems: 'baseline' },
  legal: { marginTop: spacing.lg, lineHeight: 16, textAlign: 'center' },
});
