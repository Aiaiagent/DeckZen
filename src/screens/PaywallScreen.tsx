import { useState } from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { Screen, Txt, Card, Button } from '../components/ui';
import { colors, spacing, radius } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { PLANS, purchase } from '../services/purchases';
import { hapticSelect, hapticSuccess } from '../services/haptics';

const GROUPS = [
  {
    emoji: '🔁',
    title: 'Workday resets',
    items: ['Meeting Recovery', 'Deadline Survival', 'Low-energy afternoon resets'],
  },
  {
    emoji: '🧘',
    title: 'Body care',
    items: ['Eyes, neck, shoulders, back & wrists', 'Stealth office exercises', 'Equipment-based routines'],
  },
  {
    emoji: '🌿',
    title: 'Habit loop',
    items: ['Personalized nudge voices', 'Weekly insights', 'Premium Desk Garden growth'],
  },
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
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.top}>
        <Pressable onPress={back} hitSlop={12}>
          <Txt variant="h3" color={colors.textMuted}>
            ✕
          </Txt>
        </Pressable>
      </View>

      {/* Hero */}
      <Txt variant="title" style={styles.heroTitle}>
        Make every work break feel made for you.
      </Txt>
      <Txt variant="body" color={colors.textMuted} style={styles.heroSub}>
        Adaptive 30–120 second resets for stressful meetings, tired afternoons,
        stiff shoulders, and deadline mode.
      </Txt>

      {/* Premium glowing plant visual */}
      <View style={styles.visual}>
        <View style={styles.visualGlowOuter} />
        <View style={styles.visualGlowInner} />
        <View style={styles.plantGroup}>
          <Text style={styles.plant}>🪴</Text>
          <View style={styles.potRim} />
          <View style={styles.potBody} />
        </View>
        <View style={styles.premiumBadge}>
          <Txt variant="tiny" color={colors.primaryDark}>
            DESKZEN PREMIUM
          </Txt>
        </View>
      </View>

      {/* Benefit groups */}
      <View style={styles.groups}>
        {GROUPS.map((g) => (
          <Card key={g.title} style={styles.group}>
            <View style={styles.groupHead}>
              <Text style={styles.groupEmoji}>{g.emoji}</Text>
              <Txt variant="h3">{g.title}</Txt>
            </View>
            <View style={styles.groupItems}>
              {g.items.map((item) => (
                <View key={item} style={styles.groupItem}>
                  <Text style={styles.check}>✓</Text>
                  <Txt variant="small" color={colors.textMuted} style={{ flex: 1 }}>
                    {item}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </View>

      {/* Pricing */}
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
              {p.badge && (
                <View style={styles.planBadge}>
                  <Txt
                    variant="tiny"
                    color={colors.onPrimary}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.planBadgeText}
                  >
                    {p.badge.toUpperCase()}
                  </Txt>
                </View>
              )}
              <Txt variant="bodyStrong" color={active ? colors.primaryDark : colors.text}>
                {p.title}
              </Txt>
              <View style={styles.planPrice}>
                <Txt variant="title" color={active ? colors.primaryDark : colors.text}>
                  {p.price}
                </Txt>
                <Txt variant="small" color={colors.textMuted}>
                  {' '}
                  {p.period}
                </Txt>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* CTA */}
      <Button
        title={busy ? 'Processing…' : 'Start Premium'}
        loading={busy}
        onPress={buy}
        style={{ marginTop: spacing.lg }}
      />
      <Txt variant="small" color={colors.textMuted} style={styles.cancel}>
        Cancel anytime.
      </Txt>

      <Txt variant="tiny" color={colors.textFaint} style={styles.legal}>
        Subscriptions renew automatically until cancelled. Manage or cancel anytime
        in your App Store or Google Play account settings. Demo build: purchases are
        simulated and unlock Premium locally.
      </Txt>
    </Screen>
  );
}

const WOOD_DARK = '#B0865E';

const styles = StyleSheet.create({
  content: { paddingTop: spacing.sm },
  top: { alignItems: 'flex-end', marginBottom: spacing.sm },

  heroTitle: { textAlign: 'center', paddingHorizontal: spacing.sm, lineHeight: 33 },
  heroSub: {
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 22,
    paddingHorizontal: spacing.sm,
  },

  // Premium glowing plant visual
  visual: {
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  visualGlowOuter: {
    position: 'absolute',
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.sun + '44',
  },
  visualGlowInner: {
    position: 'absolute',
    top: 4,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.sun + '66',
  },
  plantGroup: { alignItems: 'center', marginBottom: spacing.xl },
  plant: { fontSize: 72, marginBottom: -6 },
  potRim: {
    width: 64,
    height: 15,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
    marginBottom: -2,
  },
  potBody: {
    width: 50,
    height: 42,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: colors.clay,
  },
  premiumBadge: {
    position: 'absolute',
    top: 14,
    backgroundColor: '#FFFFFFD0',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },

  // Benefit groups
  groups: { marginTop: spacing.xl, gap: spacing.md },
  group: { gap: spacing.md },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  groupEmoji: { fontSize: 22 },
  groupItems: { gap: spacing.sm },
  groupItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  check: { color: colors.primary, fontSize: 14, fontWeight: '800' },

  // Pricing
  plans: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  plan: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  planActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  planBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  planBadgeText: { textAlign: 'center' },
  planPrice: { flexDirection: 'row', alignItems: 'baseline' },
  radio: {
    marginTop: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  cancel: { textAlign: 'center', marginTop: spacing.md },
  legal: { marginTop: spacing.xl, lineHeight: 15, textAlign: 'center' },
});
