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
}

export interface CompetitionRegistration {
  id: number
  user: number
  competition: number
  category: number
  is_confirmed: boolean
  registered_at: string
}