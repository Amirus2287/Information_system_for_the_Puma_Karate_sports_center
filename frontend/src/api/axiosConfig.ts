import axios from 'axios'
import toast from 'react-hot-toast'

const rawApiUrl = import.meta.env.VITE_API_URL
let API_URL = rawApiUrl !== undefined ? rawApiUrl : (import.meta.env.DEV ? '' : 'http://localhost:8000')
if (API_URL && typeof API_URL === 'string' && API_URL.endsWith('/api')) {
  API_URL = API_URL.slice(0, -4)
}

function getCsrfToken(): string | null {
  const name = 'csrftoken'
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(value)
    }
  }
  return null
}

let csrfTokenPromise: Promise<string | null> | null = null

async function ensureCsrfToken(): Promise<string | null> {
  let token = getCsrfToken()
  if (token) {
    return token
  }
  
  if (!csrfTokenPromise) {
    const csrfUrl = import.meta.env.DEV || API_URL === ''
      ? '/api/auth/csrf-token/'
      : `${API_URL || 'http://localhost:8000'}/api/auth/csrf-token/`
    
    csrfTokenPromise = axios.get(csrfUrl, {
      withCredentials: true
    }).then(response => {
      const token = response.data.csrfToken || getCsrfToken()
      return token
    }).catch(() => {
      return getCsrfToken()
    })
  }
  
  return csrfTokenPromise
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      if (!config.url?.includes('/csrf-token/')) {
        const csrfToken = await ensureCsrfToken()
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken
        }
      }
    }
    
    // Don't override Content-Type for FormData - axios will set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    if (import.meta.env.DEV && (config.url?.includes('/register/') || config.url?.includes('/login/'))) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        data: config.data ? { ...config.data, password: '***' } : null
      })
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV && (response.config.url?.includes('/register/') || response.config.url?.includes('/login/'))) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    if (import.meta.env.DEV && error.config?.url?.includes('/register/') || error.config?.url?.includes('/login/')) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      })
    }
    
    if (!error.response) {
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
    
    if (error.response?.status === 401) {
      if (!error.config?.url?.includes('/auth/')) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.')
      }
    }
    
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      toast.error('Ошибка CSRF токена. Попробуйте обновить страницу.')
    }
    
    return Promise.reject(error)
  }
)

export default api
