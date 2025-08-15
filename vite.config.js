import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    open: true,
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
      clientPort: 5173,
      path: '/vite-hmr',
    },
  },
  build: {
    sourcemap: true,
  },
})
