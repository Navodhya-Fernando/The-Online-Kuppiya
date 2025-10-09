/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#1e3a8a', // Dark Blue
        'accent-yellow': '#f59e0b', // Amber
      },
    },
  },
  plugins: [],
}