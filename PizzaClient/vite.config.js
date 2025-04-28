import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../wwwroot',
    emptyOutDir: false, // Set to false to avoid permission issues
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5077',
        changeOrigin: true,
      },
    },
  },
})
