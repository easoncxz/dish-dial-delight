
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"
import fs from 'node:fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Custom hook to copy PWA assets to build output directory
  const copyPWAAssets = () => ({
    name: 'copy-pwa-assets',
    closeBundle: async () => {
      const outDir = path.join(__dirname, 'docs')
      
      // Ensure PWA assets are copied to the output directory
      const pwaAssets = [
        'manifest.json',
        'service-worker.js',
        'pwa-icon-192.png',
        'pwa-icon-512.png'
      ]
      
      for (const asset of pwaAssets) {
        const srcPath = path.join(__dirname, 'public', asset)
        const destPath = path.join(outDir, asset)
        
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath)
          console.log(`Copied PWA asset: ${asset}`)
        } else {
          console.warn(`PWA asset not found: ${asset}`)
        }
      }
    }
  })

  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      copyPWAAssets()
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
  }
})
