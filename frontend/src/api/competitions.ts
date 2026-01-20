import api from './axiosConfig'
import type { Competition, CompetitionCategory, CompetitionRegistration } from '../types/competition.types'

export const competitionsApi = {
  getCompetitions: async (): Promise<Competition[]> => {
    const response = await api.get('/api/competitions/competitions/')
    return response.data
  },
  
  getCompetition: async (id: number): Promise<Competition> => {
    const response = await api.get(`/api/competitions/competitions/${id}/`)
    return response.data
  },
  
  getCategories: async (competitionId?: number): Promise<CompetitionCategory[]> => {
    const response = await api.get('/api/competitions/categories/', {
      params: competitionId ? { competition_id: competitionId } : {}
    })
    return response.data
  },
  
  createCompetition: async (data: Partial<Competition> & { name: string; location: string; date: string }): Promise<Competition> => {
    const response = await api.post('/api/competitions/competitions/', {
      ...data,
      is_active: data.is_active ?? true
    })
    return response.data
  },
  
  getRegistrations: async (params?: any): Promise<CompetitionRegistration[]> => {
    const response = await api.get('/api/competitions/registrations/', { params })
    return response.data
  },
  
  registerForCompetition: async (data: { competition: number; category: number }): Promise<CompetitionRegistration> => {
    const response = await api.post('/api/competitions/registrations/', data)
    return response.data
  },
}