import { NotificationTone, CheckInState } from '../types';

export interface ToneMeta {
  tone: NotificationTone;
  label: string;
  emoji: string;
  /** A one-line preview of the personality. */
  sample: string;
  premium: boolean;
}

/** The selectable voice packs. Two are free, the rest are Premium. */
export const TONES: ToneMeta[] = [
  {
    tone: 'cute',
    label: 'Sen the Plant',
    emoji: '🪴',
    sample: 'Your little plant is drooping. Water it with one slow breath?',
    premium: false,
  },
  {
    tone: 'minimal',
    label: 'Minimal Zen',
    emoji: '⚪',
    sample: 'Drop your shoulders. Breathe. 60 seconds.',
    premium: false,
  },
  {
    tone: 'genz',
    label: 'Gen Z Roast',
    emoji: '💀',
    sample: "You've been sitting like a question mark for 90 min, idol. Reset?",
    premium: true,
  },
  {
    tone: 'corporate',
    label: 'Corporate Friendly',
    emoji: '👔',
    sample: "You've focused for 82 minutes. A short micro-break can help.",
    premium: true,
  },
  {
    tone: 'zen',
    label: 'Calm Coach',
    emoji: '🧘',
    sample: 'Soften the shoulders. Exhale. Return to your body for 60 seconds.',
    premium: true,
  },
];

export const TONE_BY_ID: Record<NotificationTone, ToneMeta> = TONES.reduce(
  (acc, t) => {
    acc[t.tone] = t;
    return acc;
  },
  {} as Record<NotificationTone, ToneMeta>,
);

/** Nudge copy keyed by tone, then by the signal we want to address. */
type Signal = CheckInState | 'sitting' | 'eyeTimer' | 'endOfDay';

const COPY: Record<NotificationTone, Partial<Record<Signal, string[]>>> = {
  cute: {
    sitting: [
      'Your little plant is wilting a bit 🪴 Tend to it with a 60-second stretch?',
      'Psst — your desk garden misses you. One tiny reset?',
    ],
    eyeTimer: [
      'Your eyes look thirsty 👀 Gaze far away for 20 seconds?',
      'Little eye break? Your plant grows when you do.',
    ],
    stress: ['Things feel heavy? Let’s breathe it out together for a minute. 💛'],
    stiffNeck: ['Your shoulders are up by your ears again 🐢 Let them melt down?'],
    deadline: ['Big push, I know. 60 quiet seconds so you don’t run out of sun. ☀️'],
    endOfDay: ['Almost done today! One soft reset to close it kindly. 🌙'],
  },
  minimal: {
    sitting: ['Sitting streak: long. Stand and reach. 60s.', 'Move. 60 seconds.'],
    eyeTimer: ['Look 20 ft away. 20 seconds.', 'Eye break.'],
    stress: ['Breathe. 4-7-8. One minute.'],
    stiffNeck: ['Drop shoulders. Neck tilt. 60s.'],
    deadline: ['One reset. Then back in.'],
    endOfDay: ['Close the day. One breath.'],
  },
  genz: {
    sitting: [
      "You've been sitting like a question mark for a while, idol 💀 Reset 60s?",
      'Your spine is filing a complaint. Wanna respond or leave it on read?',
    ],
    eyeTimer: [
      'Your eyes are buffering 👀 Look away for 20s before they crash.',
      'POV: your eyes need a break and you’re ignoring them. Rude. Tap in.',
    ],
    stress: ['Stress level: spicy 🌶️ Let’s breathe before you combust.'],
    stiffNeck: ['Shoulders at ear level again? Bestie. Let them down. 60s.'],
    deadline: ['Locked in, respect 🔒 But sip some air for 60s so you don’t glitch.'],
    endOfDay: ['You survived today 🫡 One reset and you’re free.'],
  },
  corporate: {
    sitting: [
      "You've been focused for a while. A brief micro-break can help sustain it.",
      'Consider a short movement break to support posture and focus.',
    ],
    eyeTimer: [
      'A 20-second distance gaze can help reduce screen-related eye strain.',
      'Time for a brief eye break to ease visual load.',
    ],
    stress: ['A one-minute breathing reset may help you re-center before the next task.'],
    stiffNeck: ['A short shoulder release can ease tension from prolonged sitting.'],
    deadline: ['A 60-second reset can help maintain focus during intense work.'],
    endOfDay: ['Wrapping up? A brief reset can help you close the day well.'],
  },
  zen: {
    sitting: [
      'Notice your body. Stand, reach, and return — gently, for one minute.',
      'You’ve held this posture a while. Move with kindness for 60 seconds.',
    ],
    eyeTimer: ['Let your gaze travel far. Rest your eyes for 20 quiet seconds.'],
    stress: ['Soften the shoulders. Exhale slowly. Come back to your breath.'],
    stiffNeck: ['Release the neck, ear toward shoulder. Breathe into the space.'],
    deadline: ['Even now, one calm breath. Sixty seconds to steady yourself.'],
    endOfDay: ['The day is closing. One slow breath to let it settle.'],
  },
};

const FALLBACK = 'Time for a 60-second reset. Your desk garden is waiting. 🌱';

/** Pick a nudge line for a tone + signal, rotating for variety. */
export function buildNudge(tone: NotificationTone, signal: Signal): string {
  const pool = COPY[tone]?.[signal] ?? COPY[tone]?.sitting;
  if (!pool || pool.length === 0) return FALLBACK;
  return pool[Math.floor(Math.random() * pool.length)];
}
