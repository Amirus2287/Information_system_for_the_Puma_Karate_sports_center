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
    // Если есть файл аватарки или нужно удалить аватарку, используем FormData
    if (data.avatar instanceof File || data.avatar === null) {
      const formData = new FormData()
      if (data.first_name !== undefined) formData.append('first_name', data.first_name)
      if (data.last_name !== undefined) formData.append('last_name', data.last_name)
      if (data.patronymic !== undefined) formData.append('patronymic', data.patronymic || '')
      if (data.email !== undefined) formData.append('email', data.email)
      if (data.phone !== undefined) formData.append('phone', data.phone || '')
      if (data.date_of_birth !== undefined) {
        formData.append('date_of_birth', data.date_of_birth || '')
      }
      if (data.avatar !== undefined) {
        if (data.avatar === null) {
          // Для удаления файла в Django нужно отправить пустой файл или использовать специальный подход
          // Отправляем пустой Blob как файл
          formData.append('avatar', new Blob(), '')
        } else {
          formData.append('avatar', data.avatar)
        }
      }
      const response = await api.patch(`/api/auth/users/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }
    // Обычный JSON запрос
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
    const formData = new FormData()
    formData.append('user', data.user.toString())
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('date', data.date)
    if (data.image) {
      formData.append('image', data.image)
    }
    const response = await api.post('/api/auth/achievements/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
    const formData = new FormData()
    if (data.user !== undefined) {
      formData.append('user', data.user.toString())
    }
    if (data.title !== undefined) {
      formData.append('title', data.title)
    }
    if (data.description !== undefined) {
      formData.append('description', data.description)
    }
    if (data.date !== undefined) {
      formData.append('date', data.date)
    }
    if (data.image !== undefined) {
      if (data.image === null) {
        // Для удаления файла отправляем пустой Blob
        formData.append('image', new Blob(), '')
      } else {
        formData.append('image', data.image)
      }
    }
    const response = await api.patch(`/api/auth/achievements/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  deleteAchievement: async (id: number) => {
    const response = await api.delete(`/api/auth/achievements/${id}/`)
    return response.data
  },
}