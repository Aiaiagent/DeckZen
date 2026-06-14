import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Screen, Txt, Button } from '../components/ui';
import { colors, spacing, radius } from '../theme';
import { CircleTimer } from '../components/CircleTimer';
import { useStore } from '../store/useStore';
import { useNav } from '../navigation/nav';
import { Exercise } from '../types';
import { rankExercises } from '../data/engine';
import { hapticStep, hapticSuccess, hapticTap } from '../services/haptics';

/** Given total elapsed seconds, find the active step index + seconds left in it. */
function locate(exercise: Exercise, elapsed: number): { stepIdx: number; stepLeft: number } {
  let acc = 0;
  for (let i = 0; i < exercise.steps.length; i++) {
    const end = acc + exercise.steps[i].seconds;
    if (elapsed < end) return { stepIdx: i, stepLeft: end - elapsed };
    acc = end;
  }
  const last = exercise.steps.length - 1;
  return { stepIdx: last, stepLeft: 0 };
}

export function ResetScreen() {
  const { params, go, back } = useNav();
  const logReset = useStore((s) => s.logReset);

  const [exercise, setExercise] = useState<Exercise | undefined>(params.exercise);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStepRef = useRef(0);
  const finishedRef = useRef(false);

  const total = exercise?.durationSec ?? 0;
  const { stepIdx, stepLeft } = useMemo(
    () => (exercise ? locate(exercise, elapsed) : { stepIdx: 0, stepLeft: 0 }),
    [exercise, elapsed],
  );

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stop();
    setRunning(false);
    if (exercise) {
      logReset(exercise, true, params.stateBefore);
      hapticSuccess();
      const gained = Math.round(exercise.durationSec / 6) + 5;
      go('reward', { gained, stateBefore: params.stateBefore });
    }
  }, [exercise, logReset, params.stateBefore, go, stop]);

  // Single source of truth: tick `elapsed` up once per second.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return stop;
  }, [running, stop]);

  // React to elapsed crossing step / total boundaries.
  useEffect(() => {
    if (!exercise || !started) return;
    if (elapsed >= total) {
      finish();
      return;
    }
    if (stepIdx !== lastStepRef.current) {
      lastStepRef.current = stepIdx;
      hapticStep();
    }
  }, [elapsed, exercise, started, total, stepIdx, finish]);

  const begin = () => {
    if (!exercise) return;
    hapticTap();
    finishedRef.current = false;
    lastStepRef.current = 0;
    setElapsed(0);
    setStarted(true);
    setRunning(true);
  };

  const togglePause = () => {
    hapticTap();
    setRunning((r) => !r);
  };

  const abandon = () => {
    stop();
    if (started && exercise && !finishedRef.current)
      logReset(exercise, false, params.stateBefore);
    back();
  };

  const swapStealth = () => {
    if (!exercise) return;
    hapticTap();
    const ranked = rankExercises({
      state: params.stateBefore,
      equipment: useStore.getState().equipment,
      isPremium: useStore.getState().isPremium,
      history: useStore.getState().resets,
      mode: params.mode,
      stealthOnly: true,
    }).filter((e) => e.id !== exercise.id);
    const next = ranked[0];
    if (!next) return;
    stop();
    finishedRef.current = false;
    lastStepRef.current = 0;
    setExercise(next);
    setElapsed(0);
    setStarted(true);
    setRunning(true);
  };

  if (!exercise) {
    return (
      <Screen>
        <View style={styles.center}>
          <Txt variant="h3">No reset available.</Txt>
          <Button title="Go back" onPress={back} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  const progress = total ? elapsed / total : 0;
  const currentStep = exercise.steps[stepIdx];
  const modeLabel = resolveModeLabel(exercise, params.mode);

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={abandon} hitSlop={12} style={styles.edge}>
          <Txt variant="h3" color={colors.textMuted}>
            ✕
          </Txt>
        </Pressable>
        <View style={styles.modePill}>
          <Txt variant="tiny" color={colors.primaryDark}>
            {modeLabel.toUpperCase()}
          </Txt>
        </View>
        <View style={styles.edge} />
      </View>

      {!started ? (
        <>
          <View style={styles.stage}>
            <View style={styles.orb}>
              <View style={styles.orbHalo} />
              <View style={styles.orbInner}>
                <Txt variant="hero" style={styles.orbEmoji}>
                  {exercise.icon}
                </Txt>
              </View>
            </View>
            <Txt variant="title" style={styles.centerText}>
              {exercise.title}
            </Txt>
            <Txt variant="body" color={colors.textMuted} style={styles.summary}>
              {exercise.summary}
            </Txt>
            <Txt variant="small" color={colors.textFaint} style={styles.meta}>
              About {exercise.durationSec}s · {exercise.steps.length} steps
            </Txt>
          </View>

          <View style={styles.footer}>
            <Button title="Start 2-minute reset" onPress={begin} />
            <Pressable onPress={swapStealth} style={styles.discreet} hitSlop={8}>
              <Txt variant="small" color={colors.primaryDark}>
                Need something discreet?
              </Txt>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={styles.stage}>
            <View style={styles.timerWrap}>
              <View style={styles.timerHalo} />
              <CircleTimer
                progress={progress}
                secondsLeft={stepLeft}
                emoji={exercise.icon}
                running={running}
              />
            </View>
            <Txt variant="h2" style={styles.stepLabel}>
              {currentStep?.label}
            </Txt>
          </View>

          <View style={styles.footer}>
            <View style={styles.controls}>
              <Button
                title={running ? 'Pause' : 'Resume'}
                variant="secondary"
                onPress={togglePause}
                style={{ flex: 1 }}
              />
              <Button title="I'm done" variant="ghost" onPress={finish} style={{ flex: 1 }} />
            </View>
            <Pressable onPress={swapStealth} style={styles.discreet} hitSlop={8}>
              <Txt variant="small" color={colors.primaryDark}>
                Need something discreet?
              </Txt>
            </Pressable>
          </View>
        </>
      )}
    </Screen>
  );
}

/** A short, friendly label for the top of the focus screen. */
function resolveModeLabel(exercise: Exercise, mode?: string): string {
  if (mode === 'meetingRecovery') return 'Meeting Recovery';
  if (mode === 'deadlineSurvival') return 'Deadline Survival';
  if (exercise.stealth) return 'Stealth Reset';
  if (exercise.category === 'visual') return 'Eye Reset';
  if (exercise.category === 'mental') return 'Mind Reset';
  return 'Body Reset';
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  edge: { width: 40, alignItems: 'flex-start' },
  modePill: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  // Pre-start soft orb (static layered shapes)
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.primarySoft,
  },
  orbHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySoft,
    opacity: 0.45,
  },
  orbInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  orbEmoji: { fontSize: 72, lineHeight: 84 },

  centerText: { textAlign: 'center' },
  summary: {
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 23,
    maxWidth: 320,
  },
  meta: { marginTop: spacing.lg },

  // Player
  timerWrap: { alignItems: 'center', justifyContent: 'center' },
  timerHalo: {
    position: 'absolute',
    width: 296,
    height: 296,
    borderRadius: 148,
    backgroundColor: colors.primarySoft,
    opacity: 0.4,
  },
  stepLabel: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    minHeight: 60,
    lineHeight: 28,
    maxWidth: 320,
  },

  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
  controls: { flexDirection: 'row', gap: spacing.md },
  discreet: { alignItems: 'center', paddingVertical: spacing.md },
});
