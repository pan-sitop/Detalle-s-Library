/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ["'Playfair Display'", 'serif'],
      },
      colors: {
        background: '#0B0A10',
        bg: {
          DEFAULT: '#0A0A12',
          card: '#14141F',
          hover: '#1C1C2A',
        },
        border: {
          DEFAULT: '#26263A',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
        },
        pink: {
          DEFAULT: '#C026D3',
        },
        coral: '#FB7185',
        muted: '#9CA3AF',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #8B5CF6 0%, #C026D3 100%)',
      },
    },
  },
  plugins: [],
};
