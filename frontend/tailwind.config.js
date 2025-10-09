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
        // Modern Dark Theme Colors
        'primary': '#FFFFFF',
        'secondary': '#E5E7EB', 
        'muted': '#9CA3AF',
        'blue': '#3B82F6',
        'green': '#10B981',
        'red': '#EF4444',
        'purple': '#8B5CF6',
        
        // Background Colors
        'bg-primary': '#0F0F23',
        'bg-secondary': '#1A1A2E', 
        'bg-tertiary': '#16213E',
        'bg-hover': '#0E3460',
        
        // Border Colors
        'border-color': '#374151',
        'border-light': '#4B5563',
        
        // Legacy Support
        'primary-bg': '#0A7075',
        'primary-text': '#FFFFFF',
        'background-page': '#031716',
        'button-bg-default': '#FFFFFF',
        'button-text-default': '#274d60',
        'button-bg-hover': '#6ba3be',
        'light-bg': '#FFFFFF',
        'light-container': '#F0F0F0',
        'light-text': '#0A7075',
        'text-highlight': '#0c969c', 
        'accent-yellow': '#0c969c',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}