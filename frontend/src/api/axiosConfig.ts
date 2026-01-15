import axios from 'axios'
import toast from 'react-hot-toast'

// Используем прокси из vite.config.ts для разработки
// В продакшене можно использовать VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Логирование для отладки
  if (config.url?.includes('/register/') || config.url?.includes('/token/')) {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data ? { ...config.data, password: '***' } : null
    })
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Логирование успешных ответов для отладки
    if (response.config.url?.includes('/register/') || response.config.url?.includes('/token/')) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    // Логирование ошибок
    if (error.config?.url?.includes('/register/') || error.config?.url?.includes('/token/')) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      })
    }
    
    // Обработка сетевых ошибок
    if (!error.response) {
      // Нет ответа от сервера (сетевая ошибка)
      const isNetworkError = error.code === 'ERR_NETWORK' || 
                            error.message?.includes('Network Error') ||
                            error.message?.includes('Failed to fetch')
      
      if (isNetworkError) {
        toast.error('Проблема с подключением к серверу. Проверьте, что бэкенд запущен на порту 8000.')
      } else {
        toast.error('Ошибка подключения к серверу')
      }
      return Promise.reject(error)
    }
    
    // Обработка ошибок 401 (неавторизован)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      // Не показываем toast для ошибок авторизации, так как они обрабатываются в компонентах
      if (!error.config?.url?.includes('/auth/')) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.')
      }
    }
    
    return Promise.reject(error)
  }
)

export default api