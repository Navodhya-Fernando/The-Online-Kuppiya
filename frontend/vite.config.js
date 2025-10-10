import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/The-Online-Kuppiya/',
  server: {
    port: 5173, 
    proxy: {
      // Backend is running on port 3003
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})