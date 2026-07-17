import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Local development reads the same root .env used by Docker Compose.
  envDir: '..',
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
