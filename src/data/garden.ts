import { BodyZone, GardenMood } from '../types';

/**
 * Desk Garden model. Each body zone feeds one part of the desk scene.
 * Completing resets raises that part's level (0..1). Neglect lets it wilt.
 */
export const GARDEN_PARTS: { zone: BodyZone; label: string; emoji: string }[] = [
  { zone: 'mind', label: 'Plant', emoji: '🪴' },
  { zone: 'eyes', label: 'Desk Lamp', emoji: '💡' },
  { zone: 'back', label: 'Chair', emoji: '🪑' },
  { zone: 'neck', label: 'Spine Buddy', emoji: '🦴' },
  { zone: 'wrists', label: 'Water', emoji: '💧' },
];

/** Plant growth stages, driven by total points. */
export const PLANT_STAGES = ['🌱', '🌿', '🪴', '🌳', '🌸'] as const;

export function plantStage(points: number): string {
  if (points >= 400) return PLANT_STAGES[4];
  if (points >= 200) return PLANT_STAGES[3];
  if (points >= 80) return PLANT_STAGES[2];
  if (points >= 25) return PLANT_STAGES[1];
  return PLANT_STAGES[0];
}

/**
 * Mood is derived from how long since the last reset + recent volume.
 * `hoursSinceLast` large → wilting/stressed. Just finished → recovering/thriving.
 */
export function deriveMood(params: {
  hoursSinceLastReset: number;
  resetsToday: number;
  justCompleted?: boolean;
}): GardenMood {
  const { hoursSinceLastReset, resetsToday, justCompleted } = params;
  if (justCompleted) return 'recovering';
  if (hoursSinceLastReset >= 8) return 'wilting';
  if (hoursSinceLastReset >= 4) return 'stressed';
  if (resetsToday >= 3) return 'thriving';
  return 'normal';
}

export const MOOD_META: Record<
  GardenMood,
  { label: string; sky: string; line: string }
> = {
  thriving: { label: 'Thriving', sky: '#DCEEF8', line: 'Your desk is glowing today.' },
  normal: { label: 'Steady', sky: '#EAF3EC', line: 'A calm, balanced desk.' },
  recovering: { label: 'Recovering', sky: '#E3F1E8', line: 'Nice. Everything just brightened up.' },
  stressed: { label: 'A bit tense', sky: '#F7EEE2', line: 'The residents are getting restless.' },
  wilting: { label: 'Wilting', sky: '#F2E6E0', line: 'Your garden could really use a reset.' },
};

/** Which "body resident" complains, based on mood + neglected zone. */
export function activeResident(mood: GardenMood): { emoji: string; line: string } | null {
  switch (mood) {
    case 'wilting':
      return { emoji: '🦴', line: '"I have been a question mark for hours."' };
    case 'stressed':
      return { emoji: '🧠', line: '"Slightly overheating up here."' };
    default:
      return null;
  }
}
