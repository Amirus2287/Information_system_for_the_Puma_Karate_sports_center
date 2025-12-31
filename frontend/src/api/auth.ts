import api from './axiosConfig'

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/token/', { username, password })
    localStorage.setItem('token', response.data.access)
    return response.data
  },
  
  register: async (data: any) => {
    const response = await api.post('/auth/register/', data)
    return response.data
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me/')
    return response.data
  },
}
