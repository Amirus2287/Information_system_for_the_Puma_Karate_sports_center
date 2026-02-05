import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { formatTrainingTime, toLocalDate, toLocalDateString } from '../utils/formatters'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Dialog from '../components/ui/Dialog'
import TrainingForm from '../components/trainings/TrainingForm'
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, Users, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Journal() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const isStudent = user?.is_student && !isCoach
  
  const queryClient = useQueryClient()
  const [currentDay, setCurrentDay] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('18:00')
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  
  const dayStart = new Date(currentDay)
  dayStart.setHours(0, 0, 0, 0)
  
  const dayEnd = new Date(currentDay)
  dayEnd.setHours(23, 59, 59, 999)
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: !!user,
  })

  // У ученика всегда выбрана только его группа (или первая из нескольких)
  useEffect(() => {
    if (!isStudent || !groups?.length) return
    setSelectedGroup((prev) => {
      const ids = groups.map((g: any) => String(g.id))
      if (!prev || !ids.includes(prev)) return String(groups[0].id)
      return prev
    })
  }, [isStudent, groups])
  
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings', 'journal', toLocalDateString(dayStart), selectedGroup],
    queryFn: () => {
      const params: any = {
        date_after: toLocalDateString(dayStart),
        date_before: toLocalDateString(dayEnd),
      }
      if (selectedGroup) {
        params.group = selectedGroup
      }
      return trainingsApi.getTrainings(params)
    },
  })
  
  const goToPreviousDay = () => {
    const newDay = new Date(currentDay)
    newDay.setDate(currentDay.getDate() - 1)
    setCurrentDay(newDay)
  }
  
  const goToNextDay = () => {
    const newDay = new Date(currentDay)
    newDay.setDate(currentDay.getDate() + 1)
    setCurrentDay(newDay)
  }
  
  const goToToday = () => {
    setCurrentDay(new Date())
  }
  
  const handleDayClick = () => {
    if (isCoach) {
      setSelectedDate(currentDay)
      setShowTrainingForm(true)
    }
  }
  
  const handleDateSelect = (dateString: string) => {
    const selected = new Date(dateString)
    setCurrentDay(selected)
    setShowDatePicker(false)
  }
  
  const formatDay = () => {
    return currentDay.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  const isToday = currentDay.toDateString() === new Date().toDateString()
  const isPast = currentDay < new Date() && !isToday
  
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
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Электронный журнал</h1>
          {isCoach && (
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Календарь тренировок. Нажмите на день, чтобы создать тренировку
            </p>
          )}
        </div>
        
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={goToToday} className="text-xs sm:text-sm">
            Сегодня
          </Button>
          {isCoach && (
            <Button onClick={() => { setSelectedDate(new Date()); setShowTrainingForm(true) }} leftIcon={<Plus />} className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Новая тренировка</span>
              <span className="sm:hidden">Новая</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 shadow-elegant w-full overflow-x-hidden">
        <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-100 rounded-xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Группа
          </label>
          {isStudent && groups?.length === 1 ? (
            <p className="px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium w-full max-w-xs">
              {groups[0].name}
            </p>
          ) : (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              {!isStudent && <option value="">Все группы</option>}
              {groups?.map((group: any) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4 gap-2">
          <Button variant="outline" onClick={goToPreviousDay} leftIcon={<ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />} className="text-xs sm:text-sm px-2 sm:px-4 shrink-0">
            <span className="hidden sm:inline">Предыдущий день</span>
            <span className="sm:hidden">Назад</span>
          </Button>
          
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="text-center min-w-0 flex-1 px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 break-words capitalize flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 shrink-0" />
              <span>{formatDay()}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">Нажмите для выбора даты</p>
          </button>
          
          <Button variant="outline" onClick={goToNextDay} rightIcon={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />} className="text-xs sm:text-sm px-2 sm:px-4 shrink-0">
            <span className="hidden sm:inline">Следующий день</span>
            <span className="sm:hidden">Вперёд</span>
          </Button>
        </div>
        
        <div 
          className={`border-2 rounded-xl p-4 sm:p-6 transition-all ${
            isToday
              ? 'border-primary-500 bg-primary-50'
              : isPast
              ? 'border-gray-200 bg-gray-50'
              : isCoach
              ? 'border-gray-200 bg-white hover:border-primary-300 hover:bg-red-50 cursor-pointer'
              : 'border-gray-200 bg-white'
          }`}
          onClick={handleDayClick}
        >
          {trainings && trainings.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {trainings.map((training: any) => (
                <div
                  key={training.id}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg sm:rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-base sm:text-lg font-semibold">{formatTrainingTime(training.time_start, training.time_end)}</span>
                    </div>
                    <div className="text-sm sm:text-base font-medium opacity-90">{training.group_name || training.group?.name}</div>
                  </div>
                  
                  {training.topic && (
                    <div className="mb-3">
                      <div className="text-xs sm:text-sm font-medium opacity-80 mb-1">Тема:</div>
                      <div className="text-sm sm:text-base font-semibold">{training.topic}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    {training.coach_name && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                        <span className="opacity-90">{training.coach_name}</span>
                      </div>
                    )}
                    {training.gym_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
                        <span className="opacity-90">{training.gym_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              {isCoach && !isPast ? (
                <>
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 font-medium mb-2">
                    Нет тренировок на этот день
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Нажмите на день, чтобы добавить тренировку
                  </p>
                </>
              ) : (
                <>
                  <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-500 font-medium">
                    Нет тренировок на этот день
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      
      {showDatePicker && (
        <Dialog
          open={showDatePicker}
          onOpenChange={setShowDatePicker}
          title="Выберите дату"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата
              </label>
              <input
                type="date"
                value={formatDateForInput(currentDay)}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-base"
                min="2020-01-01"
                max="2100-12-31"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        </Dialog>
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
