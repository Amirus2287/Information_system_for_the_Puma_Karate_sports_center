import api from './axiosConfig'

export const trainingsApi = {
  getTrainings: async (params?: any) => {
    const response = await api.get('/trainings/trainings/', { params })
    return response.data
  },
  
  getGroups: async () => {
    const response = await api.get('/trainings/groups/')
    return response.data
  },
  
  getHomework: async (params?: any) => {
    const response = await api.get('/trainings/homework/', { params })
    return response.data
  },
  
  getAttendance: async (params?: any) => {
    const response = await api.get('/trainings/attendance/', { params })
    return response.data
  },
  
  createAttendance: async (data: any) => {
    const response = await api.post('/trainings/attendance/', data)
    return response.data
  },
}