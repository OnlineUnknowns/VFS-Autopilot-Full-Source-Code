import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors mapped to CSS variables to support light/dark context swaps
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          300: 'var(--primary-300)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          900: 'var(--primary-900)',
        },
        // Danger colors mapped to CSS variables
        danger: {
          50: 'var(--danger-50)',
          100: 'var(--danger-100)',
          500: 'var(--danger-500)',
          600: 'var(--danger-600)',
          700: 'var(--danger-700)',
        },
        // Semantic neutral backgrounds and text elements
        canvas: {
          base: 'var(--canvas-base)',
          secondary: 'var(--canvas-secondary)',
          tertiary: 'var(--canvas-tertiary)',
        },
        border: {
          default: 'var(--border-default)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        // Bidirectional font support
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.85' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'toast-slide': {
          'from': { transform: 'translateX(var(--toast-slide-from, 120%))', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'toast-slide': 'toast-slide 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};

export default config;
