import api from './axiosConfig'

export const journalApi = {
  getJournals: async (params?: any) => {
    const response = await api.get('/journal/journals/', { params })
    return response.data
  },
  
  createJournal: async (data: any) => {
    const response = await api.post('/journal/journals/', data)
    return response.data
  },
  
  getProgressNotes: async (params?: any) => {
    const response = await api.get('/journal/progress-notes/', { params })
    return response.data
  },
  
  createProgressNote: async (data: any) => {
    const response = await api.post('/journal/progress-notes/', data)
    return response.data
  },
  
  getTechniqueRecords: async (params?: any) => {
    const response = await api.get('/journal/technique-records/', { params })
    return response.data
  },
  
  createTechniqueRecord: async (data: any) => {
    const response = await api.post('/journal/technique-records/', data)
    return response.data
  },
}