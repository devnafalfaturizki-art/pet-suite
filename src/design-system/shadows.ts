/**
 * PetCare Suite Design System — Shadows
 * Consistent shadow system for elevation and depth.
 */

export const shadows = {
  /** Subtle — Cards, buttons, small elements */
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
  /** Default — Dropdowns, popovers, tooltips */
  md: '0 2px 4px 0 rgb(0 0 0 / 0.04), 0 4px 8px -2px rgb(0 0 0 / 0.06)',
  /** Elevated — Modals, dialogs, elevated cards */
  lg: '0 4px 12px -2px rgb(0 0 0 / 0.06), 0 8px 24px -4px rgb(0 0 0 / 0.08)',
  /** Prominent — Sidebar, large modals, drawers */
  xl: '0 8px 24px -4px rgb(0 0 0 / 0.08), 0 16px 48px -8px rgb(0 0 0 / 0.12)',
  /** Maximum — Toast notifications, floating elements */
  '2xl': '0 16px 48px -8px rgb(0 0 0 / 0.12), 0 24px 64px -12px rgb(0 0 0 / 0.16)',
  /** Inner — Inset shadow for inputs, pressed states */
  inner: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.04)',
  /** Glow — Brand accent glow for interactive elements */
  glow: '0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(59, 130, 246, 0.15)',
  /** None */
  none: '0 0 #0000',
} as const;

export type ShadowToken = keyof typeof shadows;

// Semantic shadow mappings
export const semanticShadows = {
  card: shadows.sm,
  cardHover: shadows.md,
  dropdown: shadows.md,
  modal: shadows.lg,
  sidebar: shadows.lg,
  toast: shadows['2xl'],
  tooltip: shadows.md,
  button: shadows.sm,
  buttonHover: shadows.md,
  input: shadows.inner,
  inputFocus: shadows.glow,
} as const;