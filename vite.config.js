<<<<<<< HEAD
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


=======
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


>>>>>>> 90b0267bb542127759cf6f33cd61e8b7cf9e056f
