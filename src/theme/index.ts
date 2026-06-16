/**
 * DeskZen design tokens.
 * Calm, "healing desk" palette: warm cream/mint surfaces, a grounded warm-green
 * brand, and a gentle sunlight accent. Tuned to feel like a premium cozy office
 * wellness app rather than a prototype.
 */

export const colors = {
  // Surfaces — warm mint base, cream-white cards
  bg: '#EEF4EC',
  bgWarm: '#FAF6EE',
  surface: '#FFFDF8',
  surfaceAlt: '#E6F0E3',

  // Brand greens (the plant / healing)
  primary: '#2F9E6E',
  primaryDark: '#1E7A52',
  primarySoft: '#D8EFE2',

  // Accents
  sky: '#7CC0E8',
  skySoft: '#DDEEF8',
  sun: '#F3C667',
  sunSoft: '#FBEFCE',
  clay: '#E0906F',

  // Body residents
  spine: '#E0A4B4',
  brain: '#B49AE0',
  eyes: '#6FB7C9',

  // Text — warm deep green-grey
  text: '#1F2E27',
  textMuted: '#5A6A60',
  textFaint: '#9AA89F',
  onPrimary: '#FFFFFF',

  // Feedback
  danger: '#D45D5D',
  warning: '#E0A02E',
  success: '#2F9E6E',

  // Lines
  border: '#E4EBE2',
  borderSoft: '#EDF2EB',
  overlay: 'rgba(20, 35, 27, 0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const font = {
  // System font stack keeps the bundle light; weights + line-heights tuned for a
  // calm, readable rhythm.
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.6, lineHeight: 41 },
  title: { fontSize: 27, fontWeight: '800' as const, letterSpacing: -0.4, lineHeight: 33 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2, lineHeight: 27 },
  h3: { fontSize: 17, fontWeight: '700' as const, letterSpacing: -0.1, lineHeight: 23 },
  body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5, lineHeight: 14 },
} as const;

export const shadow = {
  // Soft, diffuse, warm-tinted shadows — gentle lift, never harsh.
  card: {
    shadowColor: '#244A37',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#244A37',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  button: {
    shadowColor: '#15583B',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;
