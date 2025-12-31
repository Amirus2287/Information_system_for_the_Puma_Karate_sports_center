export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  is_coach: boolean
  is_student: boolean
  telegram_id?: string
  date_of_birth?: string
  avatar?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
  phone?: string
}