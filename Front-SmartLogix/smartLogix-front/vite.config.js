import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Cambiamos 127.0.0.1 por localhost
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ ERROR EN PROXY DE VITE:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('↗️ Enviando petición al BFF:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('⬅️ Respuesta del BFF:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})