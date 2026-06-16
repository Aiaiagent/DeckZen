import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Card, Button } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { CheckInState } from '../types';
import { useT, TKey } from '../i18n';

export function InsightsScreen() {
  const go = useNav((s) => s.go);
  const t = useT();
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
    h === null ? '—' : `${((h + 11) % 12) + 1}${h < 12 ? t('insights.am') : t('insights.pm')}`;

  return (
    <Screen scroll>
      <Txt variant="title">{t('insights.title')}</Txt>
      <Txt variant="body" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {t('insights.subtitle')}
      </Txt>

      <View style={styles.row}>
        <MetricCard emoji="✅" value={`${stats.totalResets}`} label={t('insights.metric.totalResets')} />
        <MetricCard emoji="⏱️" value={t('insights.minutesSuffix', { minutes: stats.totalMinutes })} label={t('insights.metric.breakMinutes')} />
      </View>
      <View style={styles.row}>
        <MetricCard emoji="🔥" value={`${streak}`} label={t('insights.metric.dayStreak')} />
        <MetricCard emoji="✨" value={`${gardenPoints}`} label={t('insights.metric.gardenPoints')} />
      </View>

      <Txt variant="h3" style={styles.section}>
        {t('insights.patterns')}
      </Txt>

      {isPremium ? (
        <Card style={{ gap: spacing.md }}>
          <PatternLine
            emoji="🎯"
            text={
              stats.topState
                ? t('insights.pattern.topState', { label: t(checkinLabelKey(stats.topState)) })
                : t('insights.pattern.topStateEmpty')
            }
          />
          <PatternLine
            emoji="🕒"
            text={
              stats.bestHour !== null
                ? t('insights.pattern.bestHour', { hour: fmtHour(stats.bestHour) })
                : t('insights.pattern.bestHourEmpty')
            }
          />
          <PatternLine
            emoji="📊"
            text={t('insights.pattern.rate', { rate: stats.rate })}
          />
          <PatternLine
            emoji="🌿"
            text={t('insights.pattern.engine')}
          />
        </Card>
      ) : (
        <Card style={styles.lockedCard}>
          <Text style={{ fontSize: 34 }}>🔒</Text>
          <Txt variant="h3" style={{ marginTop: spacing.sm }}>
            {t('insights.locked.title')}
          </Txt>
          <Txt
            variant="small"
            color={colors.textMuted}
            style={{ textAlign: 'center', marginTop: spacing.xs, lineHeight: 18 }}
          >
            {t('insights.locked.body')}
          </Txt>
          <Button
            title={t('insights.locked.cta')}
            onPress={() => go('paywall', { paywallSource: 'insights' })}
            style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
          />
        </Card>
      )}

      <Txt variant="tiny" color={colors.textFaint} style={styles.disclaimer}>
        {t('insights.disclaimer')}
      </Txt>
    </Screen>
  );
}

function checkinLabelKey(state: CheckInState): TKey {
  return `checkin.label.${state}` as TKey;
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
