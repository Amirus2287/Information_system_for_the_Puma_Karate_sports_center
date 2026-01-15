import api from './axiosConfig'
import toast from 'react-hot-toast'

export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/token/', { username, password })
      const { access, refresh } = response.data
      
      if (access) {
        localStorage.setItem('token', access)
        if (refresh) {
          localStorage.setItem('refresh_token', refresh)
        }
      }
      
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'Ошибка входа. Проверьте данные.'
      toast.error(message)
      throw error
    }
  },
  
  register: async (data: any) => {
    try {
      console.log('Registering with data:', { ...data, password: '***' })
      const response = await api.post('/api/auth/register/', data)
      console.log('Register response:', response.data)
      
      // Бэкенд возвращает JWT токены (access и refresh)
      const { access, refresh } = response.data
      if (access) {
        localStorage.setItem('token', access)
        if (refresh) {
          localStorage.setItem('refresh_token', refresh)
        }
      }
      toast.success('Регистрация успешна!')
      return response.data
    } catch (error: any) {
      let message = 'Ошибка регистрации. Проверьте данные.'
      
      console.error('Register error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.data) {
        const data = error.response.data
        
        // Обработка различных форматов ошибок от Django
        if (data.detail) {
          message = Array.isArray(data.detail) ? data.detail[0] : String(data.detail)
        } else if (data.message) {
          message = Array.isArray(data.message) ? data.message[0] : String(data.message)
        } else if (typeof data === 'object' && data !== null) {
          // Собираем все ошибки валидации
          const errors: string[] = []
          const fieldNames: Record<string, string> = {
            username: 'Имя пользователя',
            email: 'Email',
            password: 'Пароль',
            first_name: 'Имя',
            last_name: 'Фамилия',
            phone: 'Телефон',
          }
          
          for (const [field, value] of Object.entries(data)) {
            const fieldLabel = fieldNames[field] || field
            if (Array.isArray(value) && value.length > 0) {
              errors.push(`${fieldLabel}: ${value[0]}`)
            } else if (typeof value === 'string' && value) {
              errors.push(`${fieldLabel}: ${value}`)
            } else if (typeof value === 'object' && value !== null) {
              const nestedError = Object.values(value)[0]
              if (Array.isArray(nestedError)) {
                errors.push(`${fieldLabel}: ${nestedError[0]}`)
              } else {
                errors.push(`${fieldLabel}: ${String(nestedError)}`)
              }
            }
          }
          
          if (errors.length > 0) {
            message = errors.join('. ')
          } else {
            // Если это объект с ошибками валидации
            const firstError = Object.values(data)[0]
            if (firstError) {
              message = Array.isArray(firstError) ? firstError[0] : String(firstError)
            }
          }
        }
      } else if (error.message) {
        message = error.message
      }
      
      toast.error(message)
      throw error
    }
  },
  
  getMe: async () => {
    try {
      const response = await api.get('/api/auth/me/')
      return response.data
    } catch (error: any) {
      // Если токен невалидный, очищаем его
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
      }
      throw error
    }
  },
}
