/** Shared design tokens for the app. */
export const colors = {
  bg: '#0c0c12',
  surface: '#17171f',
  surfaceAlt: '#1a1a22',
  surfaceDeep: '#111111',
  border: '#2a2a35',
  borderMuted: '#333333',
  borderSubtle: '#1e1e2a',
  text: '#ffffff',
  textMuted: '#888888',
  textDim: '#555555',
  textPlaceholder: '#444444',
  accent: '#6366f1',
  accentFaded: '#4b4db8',
  customAccent: '#a855f7',
  customAccentFaded: '#4a2a6a',
  customAccentBg: '#1e1030',
  error: '#f87171',
  errorBg: '#2a1010',
  errorBorder: '#5a1d1d',
} as const;

export const radii = {
  md: 14,
  lg: 18,
  xl: 22,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
} as const;

/** Per-style accent colours for clipart result cards. */
export const STYLE_COLORS = {
  Clay: '#f97316',
  '3D': '#6366f1',
  Anime: '#ec4899',
  'Pixel Art': '#22c55e',
} as const;

export const CUSTOM_STYLE_ACCENT = colors.customAccent;
