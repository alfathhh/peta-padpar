/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#b9dfff',
          300: '#7cc4ff',
          400: '#36a5ff',
          500: '#0c84f3',
          600: '#0066d1',
          700: '#0052a9',
          800: '#04468b',
          900: '#0a3b73',
          950: '#06254d',
        },
        neutral: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        success: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        accent: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
      },

      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        'lg':  '0.625rem',
        'xl':  '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },

      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'soft':  '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md':    '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'pop':   '0 10px 25px -3px rgb(0 0 0 / 0.08), 0 4px 10px -4px rgb(0 0 0 / 0.04)',
        'lg':    '0 20px 40px -8px rgb(0 0 0 / 0.1)',
        'focus': '0 0 0 2px rgb(12 132 243 / 0.2)',
        'brand': '0 4px 14px 0 rgb(12 132 243 / 0.3)',
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
      },

      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 150ms ease-out',
        'slide-up':   'slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slide-down 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':   'scale-in 150ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
