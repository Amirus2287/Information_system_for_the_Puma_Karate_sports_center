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
  
  createCompetition: async (data: Partial<Competition> & { name: string; location: string; date: string; visible_groups?: number[] }): Promise<Competition> => {
    const payload: any = {
      ...data,
      is_active: data.is_active ?? true,
    }
    if (data.visible_groups && data.visible_groups.length > 0) {
      payload.visible_groups = data.visible_groups
    }
    const response = await api.post('/api/competitions/competitions/', payload)
    return response.data
  },
  
  updateCompetition: async (id: number, data: Partial<Competition>): Promise<Competition> => {
    const response = await api.patch(`/api/competitions/competitions/${id}/`, data)
    return response.data
  },
  
  deleteCompetition: async (id: number): Promise<void> => {
    await api.delete(`/api/competitions/competitions/${id}/`)
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