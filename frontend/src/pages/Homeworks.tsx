import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import HomeworkForm from '../components/trainings/HomeworkForm'
import { Plus, BookOpen, CheckCircle, XCircle, Calendar, User, Users, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Homeworks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const isStudent = user?.is_student && !isCoach
  
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [showHomeworkForm, setShowHomeworkForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: !!user && isCoach,
  })
  
  const { data: groupStudents, isLoading: groupStudentsLoading, error: groupStudentsError } = useQuery({
    queryKey: ['group-students', selectedGroup],
    queryFn: async () => {
      if (!selectedGroup || selectedGroup === '') {
        throw new Error('Группа не выбрана')
      }
      const groupId = Number(selectedGroup)
      if (isNaN(groupId)) {
        throw new Error('Неверный ID группы')
      }
      try {
        return await trainingsApi.getGroupStudents({ group: groupId, is_active: true })
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.group?.[0] ||
                            error.message ||
                            'Ошибка при загрузке учеников'
        throw new Error(errorMessage)
      }
    },
    enabled: !!selectedGroup && selectedGroup !== '' && isCoach,
    retry: false,
  })
  
  const { data: allHomeworks } = useQuery({
    queryKey: ['homeworks'],
    queryFn: () => trainingsApi.getHomeworks(),
    enabled: !!user,
  })
  
  const filteredHomeworks = selectedGroup && groupStudents 
    ? (allHomeworks || []).filter((hw: any) => {
        const studentIds = groupStudents.map((gs: any) => Number(gs.student))
        return studentIds.includes(Number(hw.student))
      })
    : (allHomeworks || [])
  
  const handleCreateHomework = (student?: any) => {
    if (student) {
      setSelectedStudent({ ...student, group: Number(selectedGroup) })
    } else {
      setSelectedStudent({ group: Number(selectedGroup) })
    }
    setShowHomeworkForm(true)
  }
  
  if (isStudent) {
    return <StudentHomeworksView />
  }
  
  if (!isCoach) {
    return null
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Домашние задания</h1>
          <p className="text-gray-600 mt-1">Управление домашними заданиями по группам</p>
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите группу
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => {
              const groupId = e.target.value
              if (groupId) {
                setSelectedGroup(groupId)
                setSelectedStudent(null)
              } else {
                setSelectedGroup('')
                setSelectedStudent(null)
              }
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
          >
            <option value="">Выберите группу</option>
            {groups?.map((group: any) => (
              <option key={group.id} value={String(group.id)}>
                {group.name}
              </option>
            ))}
          </select>
          {selectedGroup && (
            <p className="text-xs text-gray-500 mt-2">
              Выбрана группа: {groups?.find((g: any) => String(g.id) === selectedGroup)?.name}
            </p>
          )}
        </div>
        
        {selectedGroup && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="font-bold text-gray-900">
                  Ученики группы ({groupStudents?.length || 0})
                </h3>
              </div>
              <Button
                size="sm"
                onClick={() => handleCreateHomework()}
                leftIcon={<Plus className="w-4 h-4" />}
                disabled={groupStudentsLoading}
              >
                Задание для всей группы
              </Button>
            </div>
            
            {groupStudentsError ? (
              <div className="text-center py-8">
                <p className="text-red-600 font-medium">Ошибка при загрузке учеников</p>
                <p className="text-sm text-gray-500 mt-2">
                  {groupStudentsError instanceof Error ? groupStudentsError.message : 'Неизвестная ошибка'}
                </p>
              </div>
            ) : groupStudentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Загрузка учеников...</p>
              </div>
            ) : groupStudents && groupStudents.length > 0 ? (
              <div className="space-y-4">
                {groupStudents.map((groupStudent: any) => {
                  const studentId = Number(groupStudent.student)
                  const studentHomeworks = filteredHomeworks.filter(
                    (hw: any) => Number(hw.student) === studentId
                  )
                  
                  return (
                    <StudentHomeworkCard
                      key={groupStudent.id}
                      groupStudent={groupStudent}
                      homeworks={studentHomeworks}
                      onCreateHomework={() => handleCreateHomework(groupStudent)}
                      isCoach={isCoach}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  В группе нет учеников
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedGroup && (
        <HomeworkForm
          open={showHomeworkForm}
          onClose={() => {
            setShowHomeworkForm(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent || { group: Number(selectedGroup) }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['homeworks'] })
          }}
        />
      )}
    </div>
  )
}

function StudentHomeworkCard({ 
  groupStudent, 
  homeworks, 
  onCreateHomework,
  isCoach
}: { 
  groupStudent: any
  homeworks: any[]
  onCreateHomework: () => void
  isCoach: boolean
}) {
  const studentName = groupStudent.student_name || 
    `${groupStudent.student_first_name || ''} ${groupStudent.student_last_name || ''}`.trim()
  
  const completedCount = homeworks.filter(hw => hw.completed).length
  const pendingCount = homeworks.filter(hw => !hw.completed).length
  
  return (
    <div className="bg-gradient-to-r from-white to-red-50 border-2 border-gray-100 rounded-xl p-5 hover:border-primary-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <User className="w-6 h-6 text-primary-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-900">{studentName}</h4>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span>Всего: {homeworks.length}</span>
              <span className="text-green-600">Выполнено: {completedCount}</span>
              <span className="text-red-600">Не выполнено: {pendingCount}</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreateHomework}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Добавить задание
        </Button>
      </div>
      
      {homeworks.length > 0 ? (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
          {homeworks.map((hw: any) => (
            <HomeworkItem key={hw.id} homework={hw} isCoach={isCoach} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-gray-500">
          Нет домашних заданий
        </div>
      )}
    </div>
  )
}

function HomeworkItem({ homework: hw, isCoach }: { homework: any; isCoach: boolean }) {
  const queryClient = useQueryClient()
  
  const toggleCompletedMutation = useMutation({
    mutationFn: (completed: boolean) => {
      return trainingsApi.updateHomework(hw.id, {
        completed,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworks'] })
      toast.success(hw.completed ? 'Домашнее задание отмечено как не выполненное' : 'Домашнее задание отмечено как выполненное')
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса')
    },
  })
  
  const deleteMutation = useMutation({
    mutationFn: () => {
      return trainingsApi.deleteHomework(hw.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworks'] })
      toast.success('Домашнее задание удалено')
    },
    onError: () => {
      toast.error('Ошибка при удалении домашнего задания')
    },
  })
  
  const handleToggleCompleted = () => {
    toggleCompletedMutation.mutate(!hw.completed)
  }
  
  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить это домашнее задание?')) {
      deleteMutation.mutate()
    }
  }
  
  const isOverdue = new Date(hw.deadline) < new Date() && !hw.completed
  
  return (
    <div className={`p-4 border-2 rounded-lg transition-all ${
      hw.completed 
        ? 'border-green-200 bg-green-50' 
        : isOverdue 
        ? 'border-red-200 bg-red-50' 
        : 'border-gray-100 bg-white hover:border-primary-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            {hw.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium text-gray-900 text-sm flex-1">
              {hw.task}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600 ml-7">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary-600" />
              <span>
                Срок: {new Date(hw.deadline).toLocaleDateString('ru-RU')}
                {isOverdue && (
                  <span className="ml-1 text-red-600 font-semibold">(Просрочено)</span>
                )}
              </span>
            </div>
            {hw.training_date && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-primary-600" />
                <span>Тренировка: {new Date(hw.training_date).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 ml-4">
          <div className="flex items-center gap-2">
            {isCoach && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                title="Удалить домашнее задание"
              >
                {deleteMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
            <Button
              size="sm"
              variant={hw.completed ? "outline" : "primary"}
              onClick={handleToggleCompleted}
              disabled={toggleCompletedMutation.isPending}
              leftIcon={hw.completed ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            >
              {hw.completed ? 'Отменить' : 'Выполнено'}
            </Button>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              hw.completed
                ? 'bg-green-100 text-green-700'
                : isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {hw.completed ? 'Выполнено' : isOverdue ? 'Просрочено' : 'В процессе'}
          </span>
        </div>
      </div>
    </div>
  )
}

function StudentHomeworksView() {
  const { data: homeworks, isLoading } = useQuery({
    queryKey: ['homeworks'],
    queryFn: () => trainingsApi.getHomeworks(),
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
  
  const filteredHomeworks = homeworks || []
  const completedCount = filteredHomeworks.filter((hw: any) => hw.completed).length
  const pendingCount = filteredHomeworks.filter((hw: any) => !hw.completed).length
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Мои домашние задания</h1>
        <p className="text-gray-600 mt-1">Ваши домашние задания</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-elegant">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">Всего заданий</p>
              <p className="text-2xl font-bold text-gray-900">{filteredHomeworks.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-elegant">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Выполнено</p>
              <p className="text-2xl font-bold text-green-700">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-elegant">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Не выполнено</p>
              <p className="text-2xl font-bold text-red-700">{pendingCount}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
        {filteredHomeworks.length > 0 ? (
          <div className="space-y-4">
            {filteredHomeworks.map((hw: any) => (
              <HomeworkItem key={hw.id} homework={hw} isCoach={isCoach} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              Нет домашних заданий
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
