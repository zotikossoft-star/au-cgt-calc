/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aus-green': '#00843D',
        'aus-gold': '#FFCD00',
      },
    },
  },
  plugins: [],
}
