/**
 * DevLearn Monochrome Design Tokens
 * Source of truth: ui-context.md & 01-system-design.md
 */

export const THEME_TOKENS = {
  colors: {
    bgBase: '#0D0D0D',
    bgSurface: '#151515',
    bgSurfaceElevated: '#1C1C1C',
    borderDefault: '#2A2A2A',
    borderSubtle: '#202020',
    textPrimary: '#FFFFFF',
    textSecondary: '#BDBDBD',
    textMuted: '#808080',
    neutralSoft: '#E0E0E0',
    accentPrimary: '#FFFFFF',
    stateError: '#EF4444',
    stateWarning: '#F59E0B',
    stateSuccess: '#22C55E',
  },
  contributionLevels: {
    0: '#1A1A1A',
    1: '#303030',
    2: '#555555',
    3: '#858585',
    4: '#FFFFFF',
  },
  fonts: {
    sans: 'var(--font-sans)',
    mono: 'var(--font-mono)',
  },
} as const;

export type ThemeTokens = typeof THEME_TOKENS;
