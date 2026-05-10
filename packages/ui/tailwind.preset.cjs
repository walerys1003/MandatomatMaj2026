/**
 * Tailwind preset shared across `apps/web` and Storybook.
 *
 * Maps tokens from `src/tokens/*` to Tailwind theme keys so authors can use
 * `bg-precision-blue-600`, `text-iron-900`, `text-volt-600`, etc.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        'precision-blue': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A5F',
          950: '#172554',
        },
        iron: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        volt: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        signal: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        'status-amber': {
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        h1: ['52px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '800' }],
        h2: ['36px', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        h3: ['24px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        h4: ['18px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      maxWidth: {
        landing: '1320px',
        dashboard: '1140px',
        wizard: '560px',
        prose: '480px',
      },
      boxShadow: {
        ring: '0 0 0 3px rgba(37, 99, 235, 0.18)',
      },
      transitionTimingFunction: {
        snap: 'cubic-bezier(0.12, 0.8, 0.3, 1)',
        'smooth-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        80: '80ms',
        150: '150ms',
      },
      keyframes: {
        'spinner-rotate': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        spinner: 'spinner-rotate 600ms linear infinite',
        'fade-in': 'fade-in 200ms cubic-bezier(0.12, 0.8, 0.3, 1)',
      },
    },
  },
}
