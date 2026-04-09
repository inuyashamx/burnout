/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cyan: {
          DEFAULT: '#00E5FF',
          light: '#40F8FF',
          dark: '#0097A7',
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
