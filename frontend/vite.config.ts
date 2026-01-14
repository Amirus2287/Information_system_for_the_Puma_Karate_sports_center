import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Разрешить доступ со всех интерфейсов
    port: 5173,
    strictPort: true,  // Не менять порт если занят
    open: true,        // Автоматически открывать браузер
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})