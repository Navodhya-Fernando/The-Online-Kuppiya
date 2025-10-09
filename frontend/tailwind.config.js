/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Guaranteed Primary Theme Colors ---
        'primary-bg': '#0A7075', // Header, Footer, Containers
        'primary-text': '#FFFFFF', // White text/icons
        
        // --- Page Background ---
        'background-page': '#031716',
        
        // --- Button & Accent Colors ---
        'button-bg-default': '#FFFFFF',
        'button-text-default': '#274d60',
        'button-bg-hover': '#6ba3be',
        
        // --- Light Mode Palette ---
        'light-bg': '#FFFFFF',
        'light-container': '#F0F0F0',
        'light-text': '#0A7075',
        
        // Remapping old colors
        'text-highlight': '#0c969c', 
        'accent-yellow': '#0c969c', 
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}