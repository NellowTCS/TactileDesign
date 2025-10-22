import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: './',
  plugins: [react()],
  publicDir: 'public', // Ensure the public folder is included
  server: {
    allowedHosts: true
  }
})
