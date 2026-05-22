/** @type {import('tailwindcss').Config} */
// Design tokens — Tema "Bumi Tabuik" (lihat PRD-UI-REFRESH.md §6)
// Inspirasi: pesisir Padang Pariaman (laut, pasir, tradisi tabuik)
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ===== WARNA =====
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',  // aksi utama, link
          600: '#0369a1',  // hover
          700: '#075985',  // active
          800: '#0c4a6e',
          900: '#082f49',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',  // CTA sekunder, highlight (pasir/tabuik)
          600: '#d97706',
          700: '#b45309',
        },
        neutral: {
          50:  '#f8fafc',  // background utama
          100: '#f1f5f9',  // background card sekunder
          200: '#e2e8f0',  // border
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // teks sekunder
          600: '#475569',
          700: '#334155',  // teks utama
          800: '#1e293b',
          900: '#0f172a',  // heading
        },
        success: {
          50:  '#f0fdf4',
          500: '#16a34a',
          600: '#15803d',
        },
        warning: {
          50:  '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          50:  '#fef2f2',
          500: '#dc2626',
          600: '#b91c1c',
        },
      },

      // ===== TIPOGRAFI =====
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      // ===== RADIUS =====
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
      },

      // ===== SHADOW =====
      boxShadow: {
        'soft':  '0 1px 2px rgb(0 0 0 / 0.04), 0 2px 8px rgb(0 0 0 / 0.06)',
        'pop':   '0 4px 16px rgb(0 0 0 / 0.08), 0 8px 32px rgb(0 0 0 / 0.06)',
        'focus': '0 0 0 3px rgb(2 132 199 / 0.35)',
      },

      // ===== MOTION =====
      transitionDuration: {
        '250': '250ms',
      },

      // ===== ANIMASI KUSTOM =====
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 200ms ease-out',
        'slide-up':   'slide-up 250ms ease-out',
        'slide-down': 'slide-down 250ms ease-out',
      },
    },
  },
  plugins: [],
}
