import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, path.resolve(__dirname, '..'), '');

  return {
    plugins: [react()],
    envDir: path.resolve(__dirname, '..'),
    base: '/',
    build: {
      outDir: path.resolve(__dirname, '../public'),
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3003',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})