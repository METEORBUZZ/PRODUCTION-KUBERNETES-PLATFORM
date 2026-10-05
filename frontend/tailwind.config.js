/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cat: {
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
          glow: 'rgba(6, 182, 212, 0.4)',
        },
        dog: {
          light: '#fca5a5',
          DEFAULT: '#f97316',
          dark: '#c2410c',
          glow: 'rgba(249, 115, 22, 0.4)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
