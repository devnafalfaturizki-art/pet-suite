/**
 * PetCare Suite Design System — Spacing
 * Consistent spacing scale based on 4px grid.
 */

export const spacing = {
  /** 2px — Micro spacing for icons, badges */
  '0.5': '0.125rem',
  /** 4px — Base unit */
  '1': '0.25rem',
  /** 8px — Tight spacing between related elements */
  '2': '0.5rem',
  /** 12px — Standard spacing for form elements */
  '3': '0.75rem',
  /** 16px — Default spacing between sections */
  '4': '1rem',
  /** 20px — Generous spacing */
  '5': '1.25rem',
  /** 24px — Section padding */
  '6': '1.5rem',
  /** 32px — Card padding, large gaps */
  '8': '2rem',
  /** 40px — Page section spacing */
  '10': '2.5rem',
  /** 48px — Major section separation */
  '12': '3rem',
  /** 64px — Page-level padding */
  '16': '4rem',
  /** 80px — Hero/feature spacing */
  '20': '5rem',
  /** 96px — Maximum content separation */
  '24': '6rem',
} as const;

export type SpacingToken = keyof typeof spacing;

// Layout constants
export const layout = {
  sidebar: {
    collapsed: '5rem',    // 80px
    expanded: '18rem',    // 288px
  },
  content: {
    maxWidth: '80rem',    // 1280px
    narrowWidth: '48rem', // 768px
  },
  header: {
    height: '4rem',       // 64px
  },
  borderRadius: {
    sm: '0.375rem',       // 6px
    md: '0.5rem',         // 8px
    lg: '0.75rem',        // 12px
    xl: '1rem',           // 16px
    '2xl': '1.5rem',      // 24px
    full: '9999px',
  },
} as const;