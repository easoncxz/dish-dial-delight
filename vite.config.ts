
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    host: '::',
  },
  base: process.env.BASE_URL || '/',
  build: {
    outDir: path.join(__dirname, "docs"), // match Github Pages defaults
    emptyOutDir: true, // https://stackoverflow.com/questions/66863200/changing-the-input-and-output-directory-in-vite
  },
}))
