import { CheckInState, BodyZone, ExerciseCategory } from '../types';

export interface CheckInMeta {
  state: CheckInState;
  label: string;
  emoji: string;
  /** Short reassurance shown after tapping. */
  caption: string;
  /** Which zones to prioritize when picking a reset. */
  zones: BodyZone[];
  /** Preferred reset families for this state. */
  categories: ExerciseCategory[];
}

/** The single-screen, 5-second check-in. Order matters for the grid. */
export const CHECK_INS: CheckInMeta[] = [
  {
    state: 'stress',
    label: 'Stressed',
    emoji: '😵\u200d💫',
    caption: "Let's bring it down a notch.",
    zones: ['mind', 'neck'],
    categories: ['mental', 'physical'],
  },
  {
    state: 'sleepy',
    label: 'Sleepy',
    emoji: '😴',
    caption: 'A little spark, coming up.',
    zones: ['back', 'mind'],
    categories: ['physical', 'visual'],
  },
  {
    state: 'eyeStrain',
    label: 'Eye strain',
    emoji: '👀',
    caption: 'Time to give your eyes a breather.',
    zones: ['eyes'],
    categories: ['visual'],
  },
  {
    state: 'stiffNeck',
    label: 'Stiff neck',
    emoji: '🪨',
    caption: 'Loosen up those shoulders.',
    zones: ['neck', 'back'],
    categories: ['physical'],
  },
  {
    state: 'deadline',
    label: 'Deadline mode',
    emoji: '🔥',
    caption: 'Quick, quiet reset. No fuss.',
    zones: ['mind', 'wrists'],
    categories: ['mental', 'physical'],
  },
];

export const CHECK_IN_BY_STATE: Record<CheckInState, CheckInMeta> = CHECK_INS.reduce(
  (acc, c) => {
    acc[c.state] = c;
    return acc;
  },
  {} as Record<CheckInState, CheckInMeta>,
);
