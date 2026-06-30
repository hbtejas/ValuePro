/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1F3A',
          'navy-light': '#122D52',
          'navy-dark': '#071628',
          accent: '#E97B2C', // Saffron-adjacent orange for CTAs
          'accent-hover': '#D06A1F',
          teal: '#0D9488',
        },
        gain: {
          DEFAULT: '#16A34A',
          light: '#22C55E',
          dark: '#15803D',
          bg: '#052E16',
        },
        loss: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
          bg: '#450A0A',
        },
        neutral: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309',
          bg: '#451A03',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          tertiary: '#F1F5F9',
          border: '#E2E8F0',
          'dark-primary': '#0F172A',
          'dark-secondary': '#1E293B',
          'dark-tertiary': '#334155',
          'dark-border': '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
