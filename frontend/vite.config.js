import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // O base deve ser exatamente o nome do seu repositório no GitHub
  base: '/Melanski_Sport/', 
})