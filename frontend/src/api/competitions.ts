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
      params: competitionId ? { competition_id: competitionId } : {}
    })
    return response.data
  },
  
  // Для создания соревнования сделаем все поля опциональными, кроме обязательных
  createCompetition: async (data: Partial<Competition> & { name: string; location: string; date: string }): Promise<Competition> => {
    const response = await api.post('/competitions/competitions/', {
      ...data,
      is_active: data.is_active ?? true  // По умолчанию активно
    })
    return response.data
  },
  
  getRegistrations: async (params?: any): Promise<CompetitionRegistration[]> => {
    const response = await api.get('/competitions/registrations/', { params })
    return response.data
  },
  
  // Для регистрации user будет добавлен на бэкенде из токена
  registerForCompetition: async (data: { competition: number; category: number }): Promise<CompetitionRegistration> => {
    const response = await api.post('/competitions/registrations/', data)
    return response.data
  },
}