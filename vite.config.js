import fs from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import dotenv from 'dotenv';
dotenv.config();

const useHttps = true;//process.env.HTTPS === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4200,
    ...(useHttps && {
      https: {
        key: fs.readFileSync('/home/ubuntu/certs/privkey.pem'),
        cert: fs.readFileSync('/home/ubuntu/certs/fullchain.pem'),
      },
    }),
  },
})
