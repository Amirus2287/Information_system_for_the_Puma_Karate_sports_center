import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { usersApi } from '../api/users'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { Plus, Edit, Trash2, Users, UserPlus, UserMinus, MapPin, User, Clock } from 'lucide-react'
import StudentInfoDialog from '../components/profile/StudentInfoDialog'
import toast from 'react-hot-toast'
import { formatWorkingHours } from '../utils/formatters'

export default function Groups() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  
  const queryClient = useQueryClient()
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [showStudentsModal, setShowStudentsModal] = useState(false)
  
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: isCoach,
  })
  
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ page_size: 200 }),
    enabled: isCoach,
  })
  const allUsers = usersData?.results ?? []
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', selectedGroup?.id],
    queryFn: () => trainingsApi.getGroupStudents({ group: selectedGroup?.id, is_active: true }),
    enabled: !!selectedGroup?.id,
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => trainingsApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Группа удалена')
    },
    onError: () => {
      toast.error('Ошибка при удалении группы')
    },
  })
  
  if (!isCoach) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 text-lg">У вас нет доступа к управлению группами</p>
        </div>
      </div>
    )
  }
  
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление группами</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Создание и управление группами тренировок</p>
        </div>
        <Button onClick={() => { setEditingGroup(null); setShowGroupForm(true) }} leftIcon={<Plus />} className="w-full sm:w-auto shrink-0">
          Создать группу
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {groups?.length ? (
          groups.map((group: any) => (
            <div
              key={group.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 hover:shadow-elegant-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Тренер: <span className="font-medium text-gray-900">{group.coach_name}</span></span>
                    </div>
                    
                    {group.gym_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <span className="font-medium text-gray-900 block">{group.gym_name}</span>
                          {group.gym_address && (
                            <span className="text-xs text-gray-500">{group.gym_address}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {group.gym_work_start && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Время работы: <span className="font-medium text-gray-900">{formatWorkingHours(group.gym_work_start, group.gym_work_end)}</span></span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Учеников: <span className="font-medium text-primary-600">{group.student_count || 0}</span></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 items-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedGroup(group)
                    setShowStudentsModal(true)
                  }}
                  leftIcon={<Users className="w-4 h-4" />}
                >
                  Ученики
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setEditingGroup(group); setShowGroupForm(true) }}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Редактировать
                </Button>
                <button
                  onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите удалить группу "${group.name}"?`)) {
                      deleteMutation.mutate(group.id)
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Удалить группу"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет групп</p>
            <p className="text-gray-400 text-sm mt-2">Создайте первую группу</p>
          </div>
        )}
      </div>
      
      {showGroupForm && (
        <GroupForm
          group={editingGroup}
          onClose={() => { setShowGroupForm(false); setEditingGroup(null) }}
        />
      )}
      
      {showStudentsModal && selectedGroup && (
        <GroupStudentsModal
          group={selectedGroup}
          onClose={() => { setShowStudentsModal(false); setSelectedGroup(null) }}
        />
      )}
    </div>
  )
}

function GroupForm({ group, onClose }: { group: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: group?.name || '',
    coach: group?.coach || user?.id || '',
    gym: group?.gym || '',
    min_age: group?.min_age ?? '',
    max_age: group?.max_age ?? '',
  })
  
  const { data: gyms } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => trainingsApi.getGyms(),
  })
  
  const { data: coachesData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers({ page_size: 200 }),
  })
  const coaches = (coachesData?.results ?? []).filter((user: any) => user.is_coach || user.is_staff)
  
  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        min_age: data.min_age === '' ? null : Number(data.min_age),
        max_age: data.max_age === '' ? null : Number(data.max_age),
      }
      if (group) {
        return trainingsApi.updateGroup(group.id, payload)
      }
      return trainingsApi.createGroup(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success(group ? 'Группа обновлена' : 'Группа создана')
      onClose()
    },
    onError: () => {
      toast.error('Ошибка при сохранении группы')
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-0" onClick={(e) => {
      if (e.target === e.currentTarget) onClose()
    }}>
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {group ? 'Редактировать группу' : 'Создать группу'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название группы
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тренер
            </label>
            <select
              value={formData.coach}
              onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            >
              <option value="">Выберите тренера</option>
              {coaches?.map((coach: any) => (
                <option key={coach.id} value={coach.id}>
                  {coach.first_name} {coach.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Зал
            </label>
            <select
              value={formData.gym}
              onChange={(e) => setFormData({ ...formData, gym: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            >
              <option value="">Выберите зал</option>
              {gyms?.map((gym: any) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name} - {gym.address} ({formatWorkingHours(gym.work_start, gym.work_end)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Возраст от (лет)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                placeholder="Не ограничено"
                value={formData.min_age}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value === '' ? '' : e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Возраст до (лет)
              </label>
              <input
                type="number"
                min={0}
                max={120}
                placeholder="Не ограничено"
                value={formData.max_age}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value === '' ? '' : e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {group ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GroupStudentsModal({ group, onClose }: { group: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentForView, setSelectedStudentForView] = useState<number | null>(null)
  
  const { data: studentsData } = useQuery({
    queryKey: ['users', 'students', 'not_in_any_group'],
    queryFn: () => usersApi.getUsers({ page_size: 200, not_in_any_group: true }),
  })
  const allUsers = studentsData?.results ?? []
  
  const { data: groupStudents, refetch } = useQuery({
    queryKey: ['group-students', group.id],
    queryFn: () => trainingsApi.getGroupStudents({ group: group.id, is_active: true }),
  })
  
  const addStudentMutation = useMutation({
    mutationFn: (studentId: number) => trainingsApi.addStudentToGroup({
      group: group.id,
      student: studentId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-students'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Ученик добавлен в группу')
      refetch()
    },
    onError: () => {
      toast.error('Ошибка при добавлении ученика')
    },
  })
  
  const removeStudentMutation = useMutation({
    mutationFn: (id: number) => trainingsApi.removeStudentFromGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-students'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      toast.success('Ученик удален из группы')
      refetch()
    },
    onError: () => {
      toast.error('Ошибка при удалении ученика')
    },
  })
  
  const currentStudentIds = groupStudents?.map((gs: any) => gs.student) || []
  const minAge = group?.min_age != null ? Number(group.min_age) : null
  const maxAge = group?.max_age != null ? Number(group.max_age) : null
  const availableStudents = allUsers?.filter((user: any) => {
    if (currentStudentIds.includes(user.id)) return false
    if (user.is_student === false) return false
    if (!`${user.first_name} ${user.last_name} ${(user.email || '')}`.toLowerCase().includes(searchTerm.toLowerCase())) 
      return false
    if (minAge != null || maxAge != null) {
      const age = user.age != null ? Number(user.age) : null
      if (age == null) return false
      if (minAge != null && age < minAge) return false
      if (maxAge != null && age > maxAge) return false
    }
    return true
  }) || []
  
  const studentsInGroup = groupStudents?.map((gs: any) => ({
    id: gs.id,
    student: {
      id: gs.student,
      first_name: gs.student_first_name,
      last_name: gs.student_last_name,
      email: gs.student_email,
    }
  })) || []

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])
  
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-0"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Ученики группы: {group.name}
          </h2>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Ученики в группе ({studentsInGroup.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {studentsInGroup.length > 0 ? (
                studentsInGroup.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 border-2 border-gray-100 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForView(item.student.id)}
                          className="text-left text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:underline"
                        >
                          {item.student.first_name} {item.student.last_name}
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">{item.student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeStudentMutation.mutate(item.id)}
                        leftIcon={<UserMinus className="w-4 h-4" />}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Нет учеников в группе</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Добавить ученика</h3>
            {(minAge != null || maxAge != null) && (
              <p className="text-sm text-gray-600 mb-2">
                Показаны ученики по возрасту группы: от {minAge ?? '—'} до {maxAge ?? '—'} лет
              </p>
            )}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Поиск учеников..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {availableStudents.length > 0 ? (
                availableStudents.map((student: any) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-white border-2 border-gray-100 rounded-lg hover:border-primary-200 transition-all"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addStudentMutation.mutate(student.id)}
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Добавить
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm ? 'Ничего не найдено' : 'Нет доступных учеников'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <StudentInfoDialog
          open={selectedStudentForView != null}
          onClose={() => setSelectedStudentForView(null)}
          userId={selectedStudentForView}
        />
      </div>
    </div>
  )
}
