/**
 * Centralized design tokens for PetCare Suite.
 * 
 * Design language: premium veterinary healthcare platform
 * - Trustworthy (deep blues, clean structure)
 * - Modern (professional spacing, strong typography)
 * - Warm (emerald accents, friendly touches)
 * - Operational (dense but readable, high information clarity)
 */

export const colors = {
  // Primary palette
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Indigo - primary brand
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  // Secondary - deep blue for healthcare trust
  blue: {
    50: '#f0f5ff',
    100: '#e0edff',
    200: '#b8d4fe',
    300: '#7cb4fc',
    400: '#4a94f8',
    500: '#2563eb',
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#172554',
  },
  // Accent - emerald for pet care warmth
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Neutrals
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

export const typography = {
  hero: 'text-4xl md:text-6xl font-bold tracking-tight',
  h1: 'text-3xl md:text-4xl font-bold tracking-tight',
  h2: 'text-2xl md:text-3xl font-semibold tracking-tight',
  h3: 'text-xl md:text-2xl font-semibold',
  h4: 'text-lg font-semibold',
  body: 'text-base leading-relaxed',
  bodySm: 'text-sm leading-relaxed',
  muted: 'text-sm text-slate-500 dark:text-slate-400',
  caption: 'text-xs text-slate-400 dark:text-slate-500',
  label: 'text-sm font-medium',
} as const;

export const animation = {
  transition: 'transition-all duration-200',
  hover: 'hover:-translate-y-0.5 hover:shadow-md',
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
} as const;