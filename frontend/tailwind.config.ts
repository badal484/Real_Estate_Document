import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#E5E8E5',
        border: '#E5E8E5',
      },
      colors: {
        background: '#F7F8F6',
        surface: '#FFFFFF',
        'primary-text': '#171A19',
        'secondary-text': '#66706B',
        border: '#E5E8E5',
        input: '#E5E8E5',
        ring: '#173F35',

        primary: {
          DEFAULT: '#173F35',
          hover: '#0F332B',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#2F7D68',
          foreground: '#FFFFFF',
          light: '#EAF3F0',
        },
        secondary: {
          DEFAULT: '#F0F2EF',
          foreground: '#171A19',
        },
        muted: {
          DEFAULT: '#F0F2EF',
          foreground: '#66706B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#171A19',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#171A19',
        },
        success: {
          DEFAULT: '#21845A',
          foreground: '#FFFFFF',
          light: '#EDF7F2',
          border: '#C3E6D6',
        },
        warning: {
          DEFAULT: '#B7791F',
          foreground: '#FFFFFF',
          light: '#FDF7EB',
          border: '#F4D8A4',
        },
        danger: {
          DEFAULT: '#C94A4A',
          foreground: '#FFFFFF',
          light: '#FCF0F0',
          border: '#F5C6C6',
        },
        destructive: {
          DEFAULT: '#C94A4A',
          foreground: '#FFFFFF',
        },
        info: {
          DEFAULT: '#3B6EA8',
          foreground: '#FFFFFF',
          light: '#EFF5FB',
          border: '#C8DEF4',
        },
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(23, 26, 25, 0.03)',
        xs: '0 1px 2px 0 rgba(23, 26, 25, 0.04)',
        sm: '0 1px 3px 0 rgba(23, 26, 25, 0.04), 0 1px 2px -1px rgba(23, 26, 25, 0.03)',
        md: '0 4px 6px -1px rgba(23, 26, 25, 0.04), 0 2px 4px -2px rgba(23, 26, 25, 0.03)',
        subtle: '0 0 0 1px #E5E8E5, 0 1px 2px 0 rgba(23, 26, 25, 0.03)',
      },
      letterSpacing: {
        tight: '-0.015em',
        tighter: '-0.025em',
      },
    },
  },
  plugins: [],
};

export default config;
