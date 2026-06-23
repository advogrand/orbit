import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
      zIndex: {
        100: '100',
      },
      animation: {
        'bounce-slow': 'bounce 2.2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
