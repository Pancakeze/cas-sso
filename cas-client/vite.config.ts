import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // CAS 后端代理（开发环境用 HTTP 8080）
      '/cas': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Token 接口代理
      '/token-server': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // UAC 接口代理
      '/uac': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
