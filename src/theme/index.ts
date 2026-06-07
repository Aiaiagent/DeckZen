/**
 * DeskZen design tokens.
 * Calm, "healing desk" palette with warm greens + soft neutrals,
 * plus accent colors for the comedic "body residents".
 */

export const colors = {
  // Surfaces
  bg: '#F4F7F4',
  bgWarm: '#FAF8F3',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3EC',

  // Brand greens (the plant / healing)
  primary: '#2F9E6E',
  primaryDark: '#1F7A53',
  primarySoft: '#D7EFE2',

  // Accents
  sky: '#7CC0E8',
  skySoft: '#DCEEF8',
  sun: '#F2C14E',
  clay: '#E08E6D',

  // Body residents
  spine: '#E0A4B4',
  brain: '#B49AE0',
  eyes: '#6FB7C9',

  // Text
  text: '#1C2B23',
  textMuted: '#5C6B62',
  textFaint: '#9AA89F',
  onPrimary: '#FFFFFF',

  // Feedback
  danger: '#D45D5D',
  warning: '#E0A02E',
  success: '#2F9E6E',

  // Lines
  border: '#E2E8E2',
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
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const font = {
  // System font stack keeps the bundle light; weights tuned for a calm feel.
  hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, fontWeight: '700' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#1B3A2B',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  soft: {
    shadowColor: '#1B3A2B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
} as const;
