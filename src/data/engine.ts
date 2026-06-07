import { CheckInState, Equipment, Exercise, ResetLog, SessionMode } from '../types';
import { EXERCISES } from './exercises';
import { CHECK_IN_BY_STATE } from './checkins';

/**
 * Stress Context Engine (Lite).
 * Picks the reset most likely to be both relevant AND completed, using:
 *  - the current check-in state (zones + preferred categories)
 *  - available desk equipment
 *  - premium access
 *  - break history (favor exercises the user actually finishes, avoid recent repeats)
 *
 * This is deterministic-ish but lightly randomized so the app feels alive.
 */
export interface RecommendInput {
  state?: CheckInState;
  equipment: Equipment[];
  isPremium: boolean;
  history: ResetLog[];
  mode?: SessionMode;
  /** Force stealth-only (the "Too awkward at office" toggle). */
  stealthOnly?: boolean;
}

function completionScore(history: ResetLog[], exerciseId: string): number {
  const relevant = history.filter((h) => h.exerciseId === exerciseId);
  if (relevant.length === 0) return 0.5; // unknown → neutral
  const completed = relevant.filter((h) => h.completed).length;
  return completed / relevant.length;
}

function recentlyUsed(history: ResetLog[], exerciseId: string): boolean {
  return history.slice(-3).some((h) => h.exerciseId === exerciseId);
}

/** Score every candidate and return a ranked list. */
export function rankExercises(input: RecommendInput): Exercise[] {
  const meta = input.state ? CHECK_IN_BY_STATE[input.state] : undefined;

  const candidates = EXERCISES.filter((ex) => {
    if (ex.premium && !input.isPremium) return false;
    if (ex.equipment && ex.equipment !== 'none' && !input.equipment.includes(ex.equipment))
      return false;
    if (input.stealthOnly && !ex.stealth) return false;
    // Deadline mode prefers short + stealth + calm
    if (input.mode === 'deadlineSurvival' && (!ex.stealth || ex.durationSec > 75)) return false;
    return true;
  });

  const scored = candidates.map((ex) => {
    let score = 0;
    if (meta) {
      if (meta.zones.includes(ex.zone)) score += 3;
      if (meta.categories.includes(ex.category)) score += 2;
    }
    if (input.mode === 'meetingRecovery' && ex.category === 'mental') score += 2;
    if (input.mode === 'deadlineSurvival' && ex.zone === 'mind') score += 1;
    score += completionScore(input.history, ex.id) * 2; // favor what they finish
    if (recentlyUsed(input.history, ex.id)) score -= 2; // avoid repeats
    score += Math.random() * 0.9; // keep it fresh
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.ex);
}

/** The single best pick. */
export function recommend(input: RecommendInput): Exercise | undefined {
  return rankExercises(input)[0];
}
