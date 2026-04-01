import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // CAS 后端代理（开发环境用）
      // 后端已改为 HTTPS 8443
      '/cas': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,  // 允许自签名证书
      },
      // Token 接口代理
      '/token-server': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      },
      // UAC 接口代理
      '/uac': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
