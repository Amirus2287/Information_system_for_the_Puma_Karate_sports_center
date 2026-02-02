import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { formatTrainingTime, toLocalDate, toLocalDateString } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import TrainingForm from '../components/trainings/TrainingForm'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Journal() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const isStudent = user?.is_student && !isCoach
  
  const queryClient = useQueryClient()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('18:00')
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  
  const weekStart = new Date(currentWeek)
  weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1)
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: !!user,
  })
  
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings', 'journal', toLocalDateString(weekStart), selectedGroup],
    queryFn: () => {
      const params: any = {
        date_after: toLocalDateString(weekStart),
        date_before: toLocalDateString(weekEnd),
      }
      if (selectedGroup) {
        params.group = selectedGroup
      }
      return trainingsApi.getTrainings(params)
    },
  })
  
  const getWeekDays = () => {
    const days = []
    const start = new Date(weekStart)
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }
  
  const getTrainingsForDay = (date: Date) => {
    if (!trainings) return []
    const dateStr = toLocalDateString(date)
    return trainings.filter((training: any) => training.date === dateStr)
  }
  
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() - 7)
    setCurrentWeek(newWeek)
  }
  
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + 7)
    setCurrentWeek(newWeek)
  }
  
  const goToToday = () => {
    setCurrentWeek(new Date())
  }
  
  const handleDayClick = (date: Date) => {
    if (isCoach) {
      setSelectedDate(date)
      setShowTrainingForm(true)
    }
  }
  
  const formatWeekRange = () => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    return `${weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  
  const weekDays = getWeekDays()
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Электронный журнал</h1>
          <p className="text-gray-600 mt-1">
            {isCoach 
              ? 'Календарь тренировок. Нажмите на день, чтобы создать тренировку' 
              : 'Расписание тренировок на неделю'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToToday}>
            Сегодня
          </Button>
          {isCoach && (
            <Button onClick={() => { setSelectedDate(new Date()); setShowTrainingForm(true) }} leftIcon={<Plus />}>
              Новая тренировка
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-elegant">
        <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Группа
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
          >
            <option value="">Все группы</option>
            {groups?.map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={goToPreviousWeek} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Предыдущая неделя
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{formatWeekRange()}</h2>
          </div>
          
          <Button variant="outline" onClick={goToNextWeek} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Следующая неделя
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayTrainings = getTrainingsForDay(day)
            const isToday = day.toDateString() === new Date().toDateString()
            const isPast = day < new Date() && !isToday
            
            return (
              <div
                key={index}
                className={`border-2 rounded-xl p-3 min-h-[150px] transition-all ${
                  isToday
                    ? 'border-primary-500 bg-primary-50'
                    : isPast
                    ? 'border-gray-200 bg-gray-50'
                    : isCoach
                    ? 'border-gray-200 bg-white hover:border-primary-300 hover:bg-red-50 cursor-pointer'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => handleDayClick(day)}
              >
                <div className="mb-2">
                  <div className="text-xs font-bold text-gray-500 mb-1">{dayNames[index]}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {dayTrainings.map((training: any) => (
                    <div
                      key={training.id}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg p-2 text-xs font-medium hover:shadow-md transition-shadow"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTrainingTime(training.time_start, training.time_end)}</span>
                      </div>
                      <div className="font-semibold truncate">{training.group_name || training.group?.name}</div>
                      {training.topic && (
                        <div className="text-xs opacity-90 truncate">{training.topic}</div>
                      )}
                    </div>
                  ))}
                  
                  {isCoach && dayTrainings.length === 0 && !isPast && (
                    <div className="text-xs text-gray-400 text-center py-2">
                      Нажмите, чтобы добавить
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {isStudent && trainings && trainings.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Тренировки на неделю</h2>
          <div className="space-y-4">
            {trainings.map((training: any) => (
              <div
                key={training.id}
                className="bg-gradient-to-r from-white to-red-50 border-2 border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      <h3 className="font-bold text-lg text-gray-900">
                        {toLocalDate(training.date).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{formatTrainingTime(training.time_start, training.time_end)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{training.coach_name || 'Тренер не указан'}</span>
                      </div>
                      
                      {training.gym_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-primary-600" />
                          <div>
                            <span className="font-medium block">{training.gym_name}</span>
                            {training.gym_address && (
                              <span className="text-xs text-gray-500">{training.gym_address}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {training.group_name && (
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Группа: </span>
                          <span>{training.group_name}</span>
                        </div>
                      )}
                    </div>
                    
                    {training.topic && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Тема: </span>
                          {training.topic}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showTrainingForm && (
        <TrainingForm
          open={showTrainingForm}
          onClose={() => {
            setShowTrainingForm(false)
            setSelectedDate(null)
          }}
          initialDate={selectedDate ? toLocalDateString(selectedDate) : undefined}
          initialTime={selectedTime}
        />
      )}
    </div>
  )
}
