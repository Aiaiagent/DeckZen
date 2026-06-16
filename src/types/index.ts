/** Core domain types for DeskZen. */

/** The 5 one-tap states from the Smart Check-in. */
export type CheckInState =
  | 'stress'
  | 'sleepy'
  | 'eyeStrain'
  | 'stiffNeck'
  | 'deadline';

/** Body zones a reset can target (also map to Desk Garden parts). */
export type BodyZone = 'eyes' | 'neck' | 'back' | 'wrists' | 'mind';

/** Exercise families for the 2-minute resets. */
export type ExerciseCategory = 'physical' | 'mental' | 'visual';

/** A single timed instruction inside an exercise. */
export interface ExerciseStep {
  /** Short line shown on screen. Keep it minimal. */
  label: string;
  /** Seconds this step runs. */
  seconds: number;
}

export interface Exercise {
  id: string;
  title: string;
  category: ExerciseCategory;
  /** Primary body zone this reset nourishes in the Desk Garden. */
  zone: BodyZone;
  /** Total duration in seconds (sum of steps). */
  durationSec: number;
  /** One-line "why" shown before starting. */
  summary: string;
  /** Timed steps for the player. */
  steps: ExerciseStep[];
  /** Emoji used as the large animated focal point. */
  icon: string;
  /** True if it can be done without anyone noticing (office-safe). */
  stealth: boolean;
  /** Premium-only content (equipment-based or advanced). */
  premium?: boolean;
  /** Equipment required, if any. */
  equipment?: Equipment;
}

/** The notification voice packs. */
export type NotificationTone = 'genz' | 'cute' | 'corporate' | 'zen' | 'minimal';

/** Optional desk equipment, used to personalize resets. */
export type Equipment =
  | 'stressBall'
  | 'massageRoller'
  | 'ergoChair'
  | 'standingDesk'
  | 'none';

/** Work rhythm influences nudge timing. */
export type WorkRhythm = 'nineToSix' | 'nightShift' | 'freelance' | 'hybrid';

/** UI languages supported by the app (interface chrome only). */
export type Language = 'en' | 'vi' | 'ja' | 'ko' | 'th' | 'es' | 'de' | 'fr';

/** Desk Garden overall mood, derived from recent activity. */
export type GardenMood =
  | 'thriving'
  | 'normal'
  | 'wilting'
  | 'stressed'
  | 'recovering';

/** A logged check-in. */
export interface CheckInLog {
  /** ISO timestamp. */
  at: number;
  state: CheckInState;
}

/** A logged reset attempt. */
export interface ResetLog {
  at: number;
  exerciseId: string;
  category: ExerciseCategory;
  zone: BodyZone;
  durationSec: number;
  completed: boolean;
  stateBefore?: CheckInState;
}

/** Special focus modes. */
export type SessionMode = 'standard' | 'meetingRecovery' | 'deadlineSurvival';
