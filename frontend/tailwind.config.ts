import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — deep navy/blue, tuned for a trust-first legal & compliance product
        brand: {
          50: '#eef3fa',
          100: '#dbe6f3',
          200: '#b2c9e4',
          300: '#84a7d0',
          400: '#5a83b8',
          500: '#3d659c',
          600: '#2d4f80',
          700: '#243f68',
          800: '#1c3153',
          900: '#152540',
          950: '#0d1626',
        },
        status: {
          pending: '#b45309',
          confirmed: '#1d4ed8',
          active: '#047857',
          missed: '#b91c1c',
          completed: '#475569',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 1px rgb(15 23 42 / 0.04)',
        card: '0 1px 2px 0 rgb(15 23 42 / 0.03), 0 4px 12px -2px rgb(15 23 42 / 0.06)',
      },
      letterSpacing: {
        tight: '-0.015em',
      },
    },
  },
  plugins: [],
};

export default config;
