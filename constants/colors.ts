// ─── Core Palette ─────────────────────────────────────────────────────────────
// Deep space dark: bg levels use a cool blue-black hue family.
// Accent: indigo-400 (#818cf8) as primary, cyan-400 (#22d3ee) as highlight.
// All semantic soft variants kept for backwards-compat; colour values improved.

export const COLORS = {
  // Backgrounds — 4 clear elevation levels
  bg:          '#080b14',   // deepest: true black-blue
  bgElevated:  '#0e1120',   // nav bars, sheets
  card:        '#141828',   // card surface
  cardAlt:     '#1c2236',   // inset / input background
  surface:     '#242b42',   // tertiary surface, pressed states
  border:      '#252c42',   // default hairline
  borderStrong:'#333d5c',   // emphasis borders, focus rings

  // Primary & accent
  primary:     '#818cf8',   // indigo-400
  primaryDark: '#6366f1',   // indigo-500
  primarySoft: 'rgba(129, 140, 248, 0.14)',

  // Highlight accent (used for hero numbers, special callouts)
  accent:      '#22d3ee',   // cyan-400
  accentSoft:  'rgba(34, 211, 238, 0.14)',

  // Text hierarchy — 4 levels
  text:           '#f0f2ff',   // near-white with blue tint
  textSecondary:  '#9aa0bc',   // secondary labels
  textMuted:      '#5d6580',   // placeholder, timestamps
  textSubtle:     '#3e4463',   // decorative, disabled

  // Semantic colours (kept identical names, improved values)
  success:     '#34d399',   // emerald-400
  successSoft: 'rgba(52, 211, 153, 0.14)',
  danger:      '#f87171',   // red-400
  dangerSoft:  'rgba(248, 113, 113, 0.14)',
  warning:     '#fbbf24',   // amber-400 (unchanged)
  warningSoft: 'rgba(251, 191, 36, 0.14)',
  info:        '#60a5fa',   // blue-400

  // Utility
  overlay:     'rgba(0, 0, 0, 0.62)',

  // Tab bar underline indicator
  tabIndicator: '#818cf8',
};

// ─── Category colours ─────────────────────────────────────────────────────────
// Kept as-is — they are semantic and already distinct.
export const CATEGORY_COLORS: Record<string, string> = {
  food:          '#34d399',   // emerald
  transport:     '#22d3ee',   // cyan
  entertainment: '#a78bfa',   // violet
  health:        '#f87171',   // red
  clothing:      '#fbbf24',   // amber
  home:          '#818cf8',   // indigo (matches primary)
  education:     '#60a5fa',   // blue
  other:         '#9aa0bc',   // muted
};

export const CATEGORY_LABELS: Record<string, string> = {
  food:          'אוכל',
  transport:     'תחבורה',
  entertainment: 'בידור',
  health:        'בריאות',
  clothing:      'לבוש',
  home:          'בית',
  education:     'חינוך',
  other:         'אחר',
};

export const CATEGORY_ICONS: Record<string, string> = {
  food:          'fast-food',
  transport:     'car',
  entertainment: 'game-controller',
  health:        'medkit',
  clothing:      'shirt',
  home:          'home',
  education:     'school',
  other:         'pricetag',
};

export type Category = keyof typeof CATEGORY_COLORS;
export const CATEGORIES = Object.keys(CATEGORY_COLORS) as Category[];
