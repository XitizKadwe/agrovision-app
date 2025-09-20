import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All requests that start with '/api' will be proxied
      '/api': {
        target: 'http://localhost:8000', // Your backend server address
        changeOrigin: true,
        secure: false,      
      },
    },
  },
})