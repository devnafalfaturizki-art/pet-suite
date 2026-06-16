/**
 * PetCare Suite Design System — Border Radius
 * Consistent border radius scale for all UI elements.
 */

export const radius = {
  /** 4px — Buttons, inputs, small elements */
  sm: '0.25rem',
  /** 6px — Default radius for most components */
  md: '0.375rem',
  /** 8px — Cards, dialogs, larger surfaces */
  lg: '0.5rem',
  /** 12px — Elevated cards, modals */
  xl: '0.75rem',
  /** 16px — Sidebar, large containers */
  '2xl': '1rem',
  /** 24px — Extra large containers */
  '3xl': '1.5rem',
  /** 9999px — Pills, badges, circular elements */
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radius;

// Semantic radius mappings
export const semanticRadius = {
  button: radius.md,
  input: radius.md,
  card: radius.xl,
  dialog: radius['2xl'],
  badge: radius.full,
  sidebar: radius['2xl'],
  tooltip: radius.md,
  toast: radius.lg,
  table: radius.lg,
} as const;