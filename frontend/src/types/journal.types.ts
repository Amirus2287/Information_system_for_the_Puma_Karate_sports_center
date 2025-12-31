export interface Journal {
  id: number
  student: number
  coach: number
  date: string
  attendance: boolean
  technique_score?: number
  kata_score?: number
  kumite_score?: number
  notes: string
  video?: string
  created_at: string
  student_name?: string
  coach_name?: string
}

export interface ProgressNote {
  id: number
  student: number
  coach: number
  date: string
  category: string
  content: string
  created_at: string
  student_name?: string
  coach_name?: string
}

export interface TechniqueRecord {
  id: number
  student: number
  technique: string
  mastery_level: number
  notes: string
  date_recorded: string
  student_name?: string
}