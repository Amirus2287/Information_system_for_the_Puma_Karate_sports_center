export interface Gym {
  id: number
  name: string
  address: string
  work_time: string
}

export interface Group {
  id: number
  name: string
  coach: number
  gym: number
  coach_name?: string
}

export interface Training {
  id: number
  group: number
  date: string
  time: string
  topic: string
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