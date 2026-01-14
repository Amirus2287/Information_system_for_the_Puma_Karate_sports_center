export interface Competition {
  id: number
  name: string
  location: string
  date: string
  description: string
  is_active: boolean
}

export interface CompetitionCategory {
  id: number
  name: string
  weight_min?: number
  weight_max?: number
  age_min?: number
  age_max?: number
  competition?: number
}

export interface CompetitionRegistration {
  id: number
  user: number
  competition: number
  category: number
  is_confirmed: boolean
  registered_at: string
}

// Тип для создания регистрации (без полей, которые заполняются на сервере)
export type CreateCompetitionRegistration = Omit<CompetitionRegistration, 'id' | 'user' | 'is_confirmed' | 'registered_at'>