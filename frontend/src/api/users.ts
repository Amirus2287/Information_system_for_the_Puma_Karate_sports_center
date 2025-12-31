import api from './axiosConfig'

export const usersApi = {
  getUsers: async () => {
    const response = await api.get('/auth/users/')
    return response.data
  },
  
  getUser: async (id: number) => {
    const response = await api.get(`/auth/users/${id}/`)
    return response.data
  },
  
  getAchievements: async () => {
    const response = await api.get('/auth/achievements/')
    return response.data
  },
}