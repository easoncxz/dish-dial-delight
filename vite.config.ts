
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080
  },
  base: process.env.BASE_URL || '/',
  build: {
    outDir: path.join(__dirname, "dist"), // match Github Pages defaults
    emptyOutDir: true, // https://stackoverflow.com/questions/66863200/changing-the-input-and-output-directory-in-vite
  },
})
