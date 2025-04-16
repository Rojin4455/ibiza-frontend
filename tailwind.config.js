/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')


module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        primary: colors.emerald[600],
        primaryhover: colors.emerald[700],
        secondary: colors.amber[500],
        secondaryHover: '#F1C12E',
        danger: '#dc3545',
        third: '#696773',
        fourth: '#009FB7',
        fifth:'#EFF1F3',
      }
    },
  },
  plugins: [],
}

