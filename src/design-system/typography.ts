/**
 * PetCare Suite Design System — Typography
 * Consistent type scale for all text elements.
 */

export const typography = {
  fontFamily: {
    sans: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace",
  },

  fontSize: {
    /** 12px — Captions, labels, metadata */
    xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
    /** 14px — Body small, table cells */
    sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
    /** 16px — Body default */
    base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
    /** 18px — Large body, intro text */
    lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
    /** 20px — Section headings */
    xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
    /** 24px — Card titles, sub-headings */
    '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
    /** 30px — Page headings */
    '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
    /** 36px — Hero headings */
    '4xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
    /** 48px — Display headings */
    '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.03em' }],
    /** 60px — Large display */
    '6xl': ['3.75rem', { lineHeight: '4.25rem', letterSpacing: '-0.03em' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export type TypographyToken = keyof typeof typography.fontSize;

// Predefined text styles for common use cases
export const textStyles = {
  h1: { fontSize: '3xl', fontWeight: 'bold', tracking: 'tight' },
  h2: { fontSize: '2xl', fontWeight: 'semibold', tracking: 'tight' },
  h3: { fontSize: 'xl', fontWeight: 'semibold', tracking: 'normal' },
  h4: { fontSize: 'lg', fontWeight: 'semibold', tracking: 'normal' },
  body: { fontSize: 'base', fontWeight: 'normal', tracking: 'normal' },
  bodySm: { fontSize: 'sm', fontWeight: 'normal', tracking: 'normal' },
  caption: { fontSize: 'xs', fontWeight: 'medium', tracking: 'wide' },
  label: { fontSize: 'sm', fontWeight: 'medium', tracking: 'normal' },
  overline: { fontSize: 'xs', fontWeight: 'semibold', tracking: 'wider' },
} as const;