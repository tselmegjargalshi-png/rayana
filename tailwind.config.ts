import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FBF7F0', sand: '#F1E9DC', beige: '#E6DAC8', ink: '#2B2622', muted: '#7A6F66',
        blush: '#F3CFC8', sage: '#D3E0CE', sky: '#CFE0EC', butter: '#F6E6B8', clay: '#C4806A', claydark: '#A9664F', line: '#E9E0D3',
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: { soft: '0 8px 30px -12px rgba(80,55,35,.18)' },
    },
  },
  plugins: [],
} satisfies Config;
