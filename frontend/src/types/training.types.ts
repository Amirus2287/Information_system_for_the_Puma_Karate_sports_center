export interface Gym {
  id: number
  name: string
  address: string
  work_start: string  // Время начала работы зала (HH:MM:SS)
  work_end?: string   // Время окончания работы зала (HH:MM:SS)
}

export interface Group {
  id: number
  name: string
  coach: number
  gym: number
  coach_name?: string
  gym_name?: string
  gym_address?: string
  gym_work_start?: string
  gym_work_end?: string
  min_age?: number | null
  max_age?: number | null
  student_count?: number
}

export interface Training {
  id: number
  group: number
  group_name?: string
  coach_name?: string
  gym_name?: string
  gym_address?: string
  gym_work_start?: string
  gym_work_end?: string
  date: string
  time: string
  topic: string
  created_at?: string
}

export interface Homework {
  id: number
  training: number
  student: number
  task: string
  deadline: string
  completed: boolean
  student_name?: string
}

export interface Attendance {
  id: number
  training: number
  student: number
  present: boolean
  notes: string
  student_name?: string
}