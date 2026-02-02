import api from './axiosConfig'

export const usersApi = {
  getUsers: async (params?: { page?: number; search?: string; page_size?: number; not_in_any_group?: boolean }) => {
    const params_ = { ...params }
    if (params_?.not_in_any_group) {
      (params_ as any).not_in_any_group = 'true'
    }
    const response = await api.get('/api/auth/users/', { params: params_ })
    const data = response.data
    if (data && typeof data === 'object' && 'results' in data) {
      return data as { count: number; next: string | null; previous: string | null; results: any[] }
    }
    return { count: Array.isArray(data) ? data.length : 0, next: null, previous: null, results: Array.isArray(data) ? data : [] }
  },
  
  getUser: async (id: number) => {
    const response = await api.get(`/api/auth/users/${id}/`)
    return response.data
  },
  
  createUser: async (data: any) => {
    const response = await api.post('/api/auth/users/', data)
    return response.data
  },
  
  updateUser: async (id: number, data: any) => {
    const response = await api.patch(`/api/auth/users/${id}/`, data)
    return response.data
  },
  
  deleteUser: async (id: number) => {
    const response = await api.delete(`/api/auth/users/${id}/`)
    return response.data
  },
  
  getAchievements: async (params?: any) => {
    const response = await api.get('/api/auth/achievements/', { params })
    return response.data
  },
  
  createAchievement: async (data: any) => {
    const response = await api.post('/api/auth/achievements/', data)
    return response.data
  },
  
  getNews: async (params?: any) => {
    const response = await api.get('/api/auth/news/', { params })
    return response.data
  },
  
  createNews: async (data: any) => {
    const response = await api.post('/api/auth/news/', data)
    return response.data
  },
  
  updateNews: async (id: number, data: any) => {
    const response = await api.patch(`/api/auth/news/${id}/`, data)
    return response.data
  },
  
  deleteNews: async (id: number) => {
    const response = await api.delete(`/api/auth/news/${id}/`)
    return response.data
  },
  
  getProfile: async (userId?: number) => {
    if (userId) {
      const response = await api.get(`/api/auth/profiles/?user=${userId}`)
      const data = response.data
      return Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data
    } else {
      const response = await api.get('/api/auth/profiles/me/')
      return response.data
    }
  },
  
  createProfile: async (data: any) => {
    const response = await api.post('/api/auth/profiles/', data)
    return response.data
  },
  
  updateProfile: async (profileId: number, data: any) => {
    const response = await api.patch(`/api/auth/profiles/${profileId}/`, data)
    return response.data
  },
  
  updateMe: async (data: any) => {
    const response = await api.patch('/api/auth/users/me/', data)
    return response.data
  },
  
  updateAchievement: async (id: number, data: any) => {
    const response = await api.patch(`/api/auth/achievements/${id}/`, data)
    return response.data
  },
  
  deleteAchievement: async (id: number) => {
    const response = await api.delete(`/api/auth/achievements/${id}/`)
    return response.data
  },
}