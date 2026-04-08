/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A853',
          light: '#E8C97A',
          dark: '#A07D3A',
        },
        surface: {
          DEFAULT: '#111111',
          light: '#1a1a1a',
          lighter: '#222222',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
