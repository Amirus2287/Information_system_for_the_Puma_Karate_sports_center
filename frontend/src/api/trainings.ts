import api from './axiosConfig'

export const trainingsApi = {
  getTrainings: async (params?: any) => {
    const response = await api.get('/api/trainings/trainings/', { params })
    return response.data
  },
  
  createTraining: async (data: any) => {
    const response = await api.post('/api/trainings/trainings/', data)
    return response.data
  },
  
  updateTraining: async (id: number, data: any) => {
    const response = await api.patch(`/api/trainings/trainings/${id}/`, data)
    return response.data
  },
  
  deleteTraining: async (id: number) => {
    const response = await api.delete(`/api/trainings/trainings/${id}/`)
    return response.data
  },
  
  getGroups: async () => {
    const response = await api.get('/api/trainings/groups/')
    return response.data
  },
  
  createGroup: async (data: any) => {
    const response = await api.post('/api/trainings/groups/', data)
    return response.data
  },
  
  updateGroup: async (id: number, data: any) => {
    const response = await api.patch(`/api/trainings/groups/${id}/`, data)
    return response.data
  },
  
  deleteGroup: async (id: number) => {
    const response = await api.delete(`/api/trainings/groups/${id}/`)
    return response.data
  },
  
  getGyms: async () => {
    const response = await api.get('/api/trainings/gyms/')
    return response.data
  },
  
  getHomeworks: async (params?: any) => {
    const response = await api.get('/api/trainings/homeworks/', { params })
    return response.data
  },
  
  createHomework: async (data: any) => {
    const response = await api.post('/api/trainings/homeworks/', data)
    return response.data
  },
  
  updateHomework: async (id: number, data: any) => {
    const response = await api.patch(`/api/trainings/homeworks/${id}/`, data)
    return response.data
  },
  
  deleteHomework: async (id: number) => {
    const response = await api.delete(`/api/trainings/homeworks/${id}/`)
    return response.data
  },
  
  getAttendances: async (params?: any) => {
    const response = await api.get('/api/trainings/attendances/', { params })
    return response.data
  },
  
  createAttendance: async (data: any) => {
    const response = await api.post('/api/trainings/attendances/', data)
    return response.data
  },
  
  updateAttendance: async (id: number, data: any) => {
    const response = await api.patch(`/api/trainings/attendances/${id}/`, data)
    return response.data
  },
  
  getGroupStudents: async (params?: any) => {
    const response = await api.get('/api/trainings/group-students/', { params })
    return response.data
  },
  
  addStudentToGroup: async (data: any) => {
    const response = await api.post('/api/trainings/group-students/', data)
    return response.data
  },
  
  updateGroupStudent: async (id: number, data: any) => {
    const response = await api.patch(`/api/trainings/group-students/${id}/`, data)
    return response.data
  },
  
  removeStudentFromGroup: async (id: number) => {
    const response = await api.delete(`/api/trainings/group-students/${id}/`)
    return response.data
  },
}