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
        // --- Dark Mode Specifics ---
        // Refined for better contrast, reduced eye strain, and a premium "IDE-like" feel
        'bg-primary-dark': '#0B0F19',    // Deepest background (Main body)
        'bg-secondary-dark': '#111827',  // Elevated surfaces (Cards, sidebars)
        'bg-tertiary-dark': '#1F2937',   // Hover states / Tag backgrounds
        'bg-hover-dark': '#374151',      // Active states
        
        // --- Borders ---
        'border-default': '#1F2937',     // Subtle dark borders
        'border-light': '#374151',       // Hover dark border
        'border-accent': '#3B82F6',

        // --- Base/Brand ---
        'primary': '#FFFFFF',
        'secondary': '#E5E7EB', 
        'muted': '#9CA3AF',
        'accent': '#60A5FA',
        
        // Legacy Support (Kept minimal to prevent breaking old pages)
        'legacy-primary-bg': '#0A7075',
        'legacy-text-highlight': '#0c969c',
      },
      fontFamily: {
        // Inter is the absolute gold standard for modern SaaS/Dashboards
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        // JetBrains Mono for all code snippets and course codes
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        // Ultra-soft shadows for the modern "card" aesthetic
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'glow-active': '0 0 25px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)', // Apple-style smooth ease
      },
    },
  },
  plugins: [], // Note: Tailwind CSS v3.3+ includes line-clamp by default!
}