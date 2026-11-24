/** @type {import('tailwindcss').Config} */
const surface = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BureauCat chromatic palette — the only four colors in the system
        accent: '#F97316',        // color-1
        positive: '#10B981',      // color-2
        warning: '#F59E0B',       // color-3
        light: '#FFFFFF',         // color-4

        // Achromatic surfaces (neutral by design, resolved per theme)
        canvas: surface('--bc-canvas'),
        ink: surface('--bc-ink'),
        muted: surface('--bc-muted'),
        onaccent: surface('--bc-on-accent'),
        surface: {
          DEFAULT: surface('--bc-surface'),
          secondary: surface('--bc-surface-2'),
          raised: surface('--bc-surface-3'),
          border: surface('--bc-border'),
          'dark-primary': surface('--bc-canvas'),
          'dark-secondary': surface('--bc-surface'),
          'dark-tertiary': surface('--bc-surface-2'),
          'dark-border': surface('--bc-border'),
        },

        // Legacy aliases kept so every calculator inherits the new system
        brand: {
          navy: surface('--bc-surface-3'),
          'navy-light': surface('--bc-surface-3'),
          'navy-dark': surface('--bc-canvas'),
          accent: '#F97316',
          'accent-hover': '#F97316',
          teal: '#10B981',
        },
        gain: {
          DEFAULT: '#10B981',
          light: '#10B981',
          dark: '#10B981',
          bg: surface('--bc-surface-2'),
        },
        loss: {
          DEFAULT: '#F97316',
          light: '#F97316',
          dark: '#F97316',
          bg: surface('--bc-surface-2'),
        },
        neutral: {
          DEFAULT: '#F59E0B',
          light: '#F59E0B',
          dark: '#F59E0B',
          bg: surface('--bc-surface-2'),
        },
      },

      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Inter Variable', 'Inter', 'sans-serif'],
        hindi: ['Inter Variable', 'Inter', 'sans-serif'],
      },

      fontSize: {
        xs: ['9px', { lineHeight: '11.22px' }],
        sm: ['11px', { lineHeight: '14.2857px' }],
        base: ['14px', { lineHeight: '20px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '27.5px' }],
        '2xl': ['20px', { lineHeight: '28px' }],
        '3xl': ['48px', { lineHeight: '50.4px' }],
        '4xl': ['68px', { lineHeight: '69.36px' }],
      },

      spacing: {
        'sp-1': '2px',
        'sp-2': '6px',
        'sp-3': '8px',
        'sp-4': '10px',
        'sp-5': '12px',
        'sp-6': '16px',
        'sp-7': '20px',
        'sp-8': '24px',
        'sp-9': '32px',
      },

      borderRadius: {
        none: '0px',
        sm: '1px',
        DEFAULT: '4px',
        md: '4px',
        lg: '4px',
        xl: '6px',
        '2xl': '16px',
        '3xl': '16px',
        full: '16px',
        pill: '2.68435e+07px',
      },

      boxShadow: {
        sm: 'oklch(0.205 0 0) 0px 0px 0px 2px',
        md: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
        lg: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px',
        xl: 'rgba(0, 0, 0, 0.35) 0px 30px 60px -30px',
      },

      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        flow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s both',
        fade: 'fade 0.3s 1.6s both',
        flow: 'flow 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
