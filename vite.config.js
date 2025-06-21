import fs from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync('/home/ubuntu/certs/privkey.pem'),
      cert: fs.readFileSync('/home/ubuntu/certs/fullchain.pem'),
    },
    port: 4200,
  },
})
