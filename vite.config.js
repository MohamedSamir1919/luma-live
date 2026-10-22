import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/luma-live/',
  server: {
    proxy: {
      '/api': 'https://backend-for-live-meet.vercel.app',
      '/socket.io': {
        target: 'https://backend-for-live-meet.vercel.app',
        ws: true,
      },
    },
  },
})
