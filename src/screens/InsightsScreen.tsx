import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Card, Button } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { CHECK_IN_BY_STATE } from '../data/checkins';
import { CheckInState } from '../types';

export function InsightsScreen() {
  const go = useNav((s) => s.go);
  const { resets, checkIns, isPremium, gardenPoints, streak } = useStore();

  const stats = useMemo(() => {
    const completed = resets.filter((r) => r.completed);
    const totalMinutes = Math.round(
      completed.reduce((sum, r) => sum + r.durationSec, 0) / 60,
    );

    // most common check-in state
    const counts: Record<string, number> = {};
    checkIns.forEach((c) => (counts[c.state] = (counts[c.state] ?? 0) + 1));
    const topState = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      null) as CheckInState | null;

    // best hour (most completed resets)
    const hourCounts: Record<number, number> = {};
    completed.forEach((r) => {
      const h = new Date(r.at).getHours();
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    });
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // weekly completion rate
    const week = resets.filter((r) => Date.now() - r.at < 7 * 864e5);
    const rate = week.length
      ? Math.round((week.filter((r) => r.completed).length / week.length) * 100)
      : 0;

    return {
      totalResets: completed.length,
      totalMinutes,
      topState,
      bestHour: bestHour !== undefined ? Number(bestHour) : null,
      rate,
    };
  }, [resets, checkIns]);

  const fmtHour = (h: number | null) =>
    h === null ? '—' : `${((h + 11) % 12) + 1}${h < 12 ? 'am' : 'pm'}`;

  return (
    <Screen scroll>
      <Txt variant="title">Your insights</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        A gentle read on your own break habits — just your check-ins and resets.
      </Txt>

      <View style={styles.row}>
        <MetricCard emoji="✅" value={`${stats.totalResets}`} label="Total resets" />
        <MetricCard emoji="⏱️" value={`${stats.totalMinutes}m`} label="Break minutes" />
      </View>
      <View style={styles.row}>
        <MetricCard emoji="🔥" value={`${streak}`} label="Day streak" />
        <MetricCard emoji="✨" value={`${gardenPoints}`} label="Garden points" />
      </View>

      <Txt variant="h3" style={styles.section}>
        Patterns
      </Txt>

      {isPremium ? (
        <Card style={{ gap: spacing.md }}>
          <PatternLine
            emoji="🎯"
            text={
              stats.topState
                ? `You check in as "${CHECK_IN_BY_STATE[stats.topState].label}" most often.`
                : 'Check in a few times to reveal your most common state.'
            }
          />
          <PatternLine
            emoji="🕒"
            text={
              stats.bestHour !== null
                ? `You complete the most resets around ${fmtHour(stats.bestHour)}.`
                : 'Your best reset time will appear as you build a habit.'
            }
          />
          <PatternLine
            emoji="📊"
            text={`This week you finished ${stats.rate}% of the resets you started.`}
          />
          <PatternLine
            emoji="🌿"
            text="Resets you finish most often get recommended more — that's the engine learning you."
          />
        </Card>
      ) : (
        <Card style={styles.lockedCard}>
          <Text style={{ fontSize: 34 }}>🔒</Text>
          <Txt variant="h3" style={{ marginTop: spacing.sm }}>
            Unlock your reset insights
          </Txt>
          <Txt
            variant="small"
            color={colors.textMuted}
            style={{ textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 }}
          >
            See when tension tends to build, your best times to reset, and how
            your week is going — plus an exportable summary.
          </Txt>
          <Button
            title="See Premium"
            onPress={() => go('paywall', { paywallSource: 'insights' })}
            style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
          />
        </Card>
      )}

      <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
        Insights are based on your self-reported check-ins and completed breaks.
        DeskZen does not diagnose or treat any condition.
      </Txt>
    </Screen>
  );
}

function MetricCard({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <Card style={styles.metric}>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <Txt variant="title">{value}</Txt>
      <Txt variant="tiny" color={colors.textFaint}>
        {label.toUpperCase()}
      </Txt>
    </Card>
  );
}

function PatternLine({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.patternLine}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Txt variant="body" style={{ flex: 1, lineHeight: 21 }}>
        {text}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  metric: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: spacing.lg },
  section: { marginTop: spacing.xl, marginBottom: spacing.sm },
  lockedCard: { alignItems: 'center', paddingVertical: spacing.xl },
  patternLine: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  disclaimer: { marginTop: spacing.xl, lineHeight: 16 },
});
