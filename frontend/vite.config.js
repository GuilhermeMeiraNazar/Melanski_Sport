import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Hostinger: sai de frontend, sai de nodejs, entra em public_html
    outDir: '../../public_html',
    emptyOutDir: true
  }
})