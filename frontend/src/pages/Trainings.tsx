import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import TrainingForm from '../components/trainings/TrainingForm'
import AttendanceModal from '../components/trainings/AttendanceModal'
import { Plus, Calendar, Clock, Users, MapPin, User, Filter, X, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Trainings() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const isStudent = user?.is_student && !isCoach
  
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: !!user,
  })
  
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings', selectedGroup, selectedDate],
    queryFn: () => {
      const params: any = {}
      if (selectedGroup) {
        params.group = selectedGroup
      }
      if (selectedDate) {
        params.date = selectedDate
      }
      return trainingsApi.getTrainings(params)
    },
  })
  
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
          <h1 className="text-3xl font-bold text-gray-900">Тренировки</h1>
          <p className="text-gray-600 mt-1">
            {isCoach ? 'Управление тренировками и группами' : 'Расписание тренировок'}
          </p>
        </div>
        
        {isCoach && (
          <Button 
            onClick={() => setShowTrainingForm(true)} 
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Новая тренировка
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Расписание тренировок</h2>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-red-50 border-2 border-primary-100 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Фильтры</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Группа
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Все группы</option>
                    {groups?.map((group: any) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              {(selectedGroup || selectedDate) && (
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedGroup('')
                      setSelectedDate('')
                    }}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </div>
            
            {trainings?.length ? (
              <div className="space-y-4">
                {trainings.map((training: any) => (
                  <TrainingCard
                    key={training.id}
                    training={training}
                    isCoach={!!isCoach}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  Нет запланированных тренировок
                </p>
                {isCoach && (
                  <p className="text-gray-400 text-sm mt-2">
                    Создайте первую тренировку, нажав кнопку выше
                  </p>
                )}
              </div>
            )}
          </div>
      </div>
      
      {isCoach && (
        <>
          <TrainingForm
            open={showTrainingForm}
            onClose={() => setShowTrainingForm(false)}
          />
          
          <AttendanceModal
            open={showAttendanceModal}
            onClose={() => setShowAttendanceModal(false)}
            training={selectedTraining}
          />
        </>
      )}
    </div>
  )
}

function TrainingCard({ training, isCoach }: { training: any; isCoach: boolean }) {
  const queryClient = useQueryClient()
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', training.group],
    queryFn: () => trainingsApi.getGroupStudents({ group: training.group, is_active: true }),
    enabled: !!training.group && isCoach,
  })
  
  const { data: attendances } = useQuery({
    queryKey: ['attendances', training.id],
    queryFn: () => trainingsApi.getAttendances({ training: training.id }),
    enabled: !!training.id && isCoach,
  })
  
  const deleteTrainingMutation = useMutation({
    mutationFn: () => {
      return trainingsApi.deleteTraining(training.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      toast.success('Тренировка удалена')
    },
    onError: () => {
      toast.error('Ошибка при удалении тренировки')
    },
  })
  
  const toggleAttendanceMutation = useMutation({
    mutationFn: ({ studentId, present }: { studentId: number; present: boolean }) => {
      const existing = attendances?.find((att: any) => att.student === studentId)
      
      if (existing) {
        return trainingsApi.updateAttendance(existing.id, {
          present,
          notes: existing.notes || '',
        })
      } else {
        return trainingsApi.createAttendance({
          training: training.id,
          student: studentId,
          present,
          notes: '',
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances', training.id] })
      toast.success('Посещаемость обновлена')
    },
    onError: () => {
      toast.error('Ошибка при обновлении посещаемости')
    },
  })
  
  const getAttendanceForStudent = (studentId: number) => {
    return attendances?.find((att: any) => att.student === studentId)
  }
  
  const students = groupStudents || []
  
  const handleDeleteTraining = () => {
    if (confirm('Вы уверены, что хотите удалить эту тренировку?')) {
      deleteTrainingMutation.mutate()
    }
  }
  
  return (
    <div className="bg-gradient-to-r from-white to-red-50 border-2 border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              {training.group_name || training.group?.name}
            </h3>
            {isCoach && (
              <button
                onClick={handleDeleteTraining}
                disabled={deleteTrainingMutation.isPending}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Удалить тренировку"
              >
                {deleteTrainingMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          {training.topic && (
            <p className="text-sm text-gray-600 mb-3">{training.topic}</p>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-primary-600" />
              <span className="font-medium">
                {new Date(training.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-primary-600" />
              <span className="font-medium">{training.time}</span>
            </div>
            
            {training.coach_name && (
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4 text-primary-600" />
                <span className="font-medium">{training.coach_name}</span>
              </div>
            )}
            
            {training.gym_name && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-primary-600" />
                <div>
                  <span className="font-medium block">{training.gym_name}</span>
                  {training.gym_address && (
                    <span className="text-xs text-gray-500">{training.gym_address}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isCoach && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-sm text-gray-700">
                Ученики группы ({students.length})
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
              {students.length > 0 ? (
                students.map((groupStudent: any) => {
                  const studentId = groupStudent.student
                  const attendance = getAttendanceForStudent(studentId)
                  const isPresent = attendance?.present ?? null
                  
                  return (
                    <div
                      key={groupStudent.id}
                      className="flex items-center justify-between p-3 bg-white border-2 border-gray-100 rounded-lg hover:border-primary-200 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          {isPresent === true ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : isPresent === false ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {groupStudent.student_name || `${groupStudent.student_first_name || ''} ${groupStudent.student_last_name || ''}`.trim()}
                          </p>
                          {attendance?.notes && (
                            <p className="text-xs text-gray-500 mt-1">{attendance.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={isPresent === true ? "primary" : "outline"}
                          onClick={() => toggleAttendanceMutation.mutate({ studentId, present: true })}
                          disabled={toggleAttendanceMutation.isPending}
                          className="h-8 px-3"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={isPresent === false ? "danger" : "outline"}
                          onClick={() => toggleAttendanceMutation.mutate({ studentId, present: false })}
                          disabled={toggleAttendanceMutation.isPending}
                          className="h-8 px-3"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Нет учеников в группе
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  )
}
