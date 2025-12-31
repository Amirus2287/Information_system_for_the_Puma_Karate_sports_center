import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: true,  // разрешает доступ со всех интерфейсов
    port: 5173,
    open: true,  // автоматически открыть браузер
  }
})