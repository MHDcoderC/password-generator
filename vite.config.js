import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss()
  ],
  server: {
    open: true,
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  build: {
    sourcemap: true,
    minify: 'terser',
    cssMinify: true,
  },
  css: {
    devSourcemap: true,
  },
})
