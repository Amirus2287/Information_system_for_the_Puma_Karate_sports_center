import api from './axiosConfig'
import toast from 'react-hot-toast'

export const authApi = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login/', { username, password })
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error || 
                     error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'Ошибка входа. Проверьте данные.'
      toast.error(message)
      throw error
    }
  },
  
  logout: async () => {
    try {
      await api.post('/api/auth/logout/')
      toast.success('Выход выполнен успешно')
    } catch (error: any) {
      console.error('Logout error:', error)
    }
  },
  
  register: async (data: any) => {
    try {
      console.log('Registering with data:', { ...data, password: '***' })
      const response = await api.post('/api/auth/register/', data)
      console.log('Register response:', response.data)
      
      toast.success('Регистрация успешна!')
      return response.data
    } catch (error: any) {
      let message = 'Ошибка регистрации. Проверьте данные.'
      
      console.error('Register error:', error)
      console.error('Error response:', error.response?.data)
      
      if (error.response?.data) {
        const data = error.response.data
        
        if (data.detail) {
          message = Array.isArray(data.detail) ? data.detail[0] : String(data.detail)
        } else if (data.message) {
          message = Array.isArray(data.message) ? data.message[0] : String(data.message)
        } else if (data.error) {
          message = Array.isArray(data.error) ? data.error[0] : String(data.error)
        } else if (typeof data === 'object' && data !== null) {
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
      throw error
    }
  },
}
