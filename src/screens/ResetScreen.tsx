import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Screen, Txt, Button, Tag } from '../components/ui';
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

  return (
    <Screen>
      <View style={styles.top}>
        <Pressable onPress={abandon} hitSlop={12}>
          <Txt variant="h3" color={colors.textMuted}>
            ✕
          </Txt>
        </Pressable>
        <View style={styles.tags}>
          <Tag text={exercise.category} color={colors.sky} />
          {exercise.stealth && <Tag text="stealth" color={colors.primary} />}
        </View>
      </View>

      {!started ? (
        <View style={styles.intro}>
          <Text style={styles.bigEmoji}>{exercise.icon}</Text>
          <Txt variant="title" style={{ textAlign: 'center' }}>
            {exercise.title}
          </Txt>
          <Txt
            variant="body"
            color={colors.textMuted}
            style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 }}
          >
            {exercise.summary}
          </Txt>
          <Txt variant="small" color={colors.textFaint} style={{ marginTop: spacing.md }}>
            About {exercise.durationSec}s · {exercise.steps.length} steps
          </Txt>
          <Button title="Start reset" onPress={begin} style={styles.startBtn} />
          <Pressable onPress={swapStealth} style={styles.awkward}>
            <Txt variant="small" color={colors.primaryDark}>
              😬 Too awkward at the office? Swap it →
            </Txt>
          </Pressable>
        </View>
      ) : (
        <View style={styles.player}>
          <CircleTimer
            progress={progress}
            secondsLeft={stepLeft}
            emoji={exercise.icon}
            running={running}
          />
          <Txt variant="h2" style={styles.stepLabel}>
            {currentStep?.label}
          </Txt>

          <View style={styles.controls}>
            <Button
              title={running ? 'Pause' : 'Resume'}
              variant="secondary"
              onPress={togglePause}
              style={{ flex: 1 }}
            />
            <Button title="Finish" variant="ghost" onPress={finish} style={{ flex: 1 }} />
          </View>
          <Pressable onPress={swapStealth} style={styles.awkward}>
            <Txt variant="small" color={colors.primaryDark}>
              😬 Swap for something more discreet →
            </Txt>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  tags: { flexDirection: 'row', gap: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  intro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  bigEmoji: { fontSize: 100, marginBottom: spacing.lg },
  startBtn: { marginTop: spacing.xl, alignSelf: 'stretch' },
  awkward: { paddingVertical: spacing.md, marginTop: spacing.sm },
  player: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepLabel: {
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    minHeight: 60,
    lineHeight: 28,
  },
  controls: { flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch' },
});
