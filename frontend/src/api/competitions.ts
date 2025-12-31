import api from './axiosConfig'
import type { Competition, CompetitionCategory, CompetitionRegistration } from '../types/competition.types'

export const competitionsApi = {
  getCompetitions: async (): Promise<Competition[]> => {
    const response = await api.get('/competitions/competitions/')
    return response.data
  },
  
  getCompetition: async (id: number): Promise<Competition> => {
    const response = await api.get(`/competitions/competitions/${id}/`)
    return response.data
  },
  
  getCategories: async (competitionId?: number): Promise<CompetitionCategory[]> => {
    const response = await api.get('/competitions/categories/', {
      params: { competition_id: competitionId }
    })
    return response.data
  },
  
  createCompetition: async (data: Omit<Competition, 'id'>): Promise<Competition> => {
    const response = await api.post('/competitions/competitions/', data)
    return response.data
  },
  
  getRegistrations: async (params?: any): Promise<CompetitionRegistration[]> => {
    const response = await api.get('/competitions/registrations/', { params })
    return response.data
  },
  
  registerForCompetition: async (data: Omit<CompetitionRegistration, 'id' | 'registered_at' | 'is_confirmed'>): Promise<CompetitionRegistration> => {
    const response = await api.post('/competitions/registrations/', data)
    return response.data
  },
}