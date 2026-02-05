import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { usersApi } from '../../api/users'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import AchievementForm from '../../components/achievements/AchievementForm'
import { Plus, Edit, Trash2, UserCog, Search, Award } from 'lucide-react'
import StudentInfoDialog from '../../components/profile/StudentInfoDialog'
import toast from 'react-hot-toast'

export default function UsersManagement() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isCoach = user?.is_coach || user?.is_staff
  const isAdmin = user?.is_staff
  const [editingUser, setEditingUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAchievementForm, setShowAchievementForm] = useState(false)
  const [selectedStudentForAchievement, setSelectedStudentForAchievement] = useState<number | undefined>(undefined)
  const [selectedStudentForView, setSelectedStudentForView] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  
  const { data: usersData, isLoading, isFetching } = useQuery({
    queryKey: ['users', page, searchTerm],
    queryFn: () => usersApi.getUsers({ page, search: searchTerm || undefined }),
    placeholderData: keepPreviousData,
  })
  
  const users = usersData?.results ?? []
  const totalCount = usersData?.count ?? 0
  const hasNext = !!usersData?.next
  const hasPrevious = !!usersData?.previous
  const totalPages = totalCount ? Math.ceil(totalCount / 10) : 1
  const isInitialLoading = isLoading && users.length === 0
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Пользователь удален')
    },
    onError: () => {
      toast.error('Ошибка при удалении пользователя')
    },
  })
  
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }
  
  if (isInitialLoading) {
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Управление пользователями</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 hidden sm:block">Добавление и редактирование пользователей системы</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditingUser(null); setShowForm(true) }} leftIcon={<Plus />} className="text-xs sm:text-sm shrink-0">
            <span className="hidden sm:inline">Добавить пользователя</span>
            <span className="sm:hidden">Добавить</span>
          </Button>
        )}
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-xl p-2 sm:p-4">
        <div className="relative flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none text-sm sm:text-base"
            />
          </div>
          {isFetching && (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-500 border-t-transparent shrink-0" />
          )}
        </div>
      </div>
      
      <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-elegant">
        {users?.length ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 text-xs sm:text-sm">Имя</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 text-xs sm:text-sm hidden md:table-cell">Email</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 text-xs sm:text-sm">Роль</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-bold text-gray-900 text-xs sm:text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-red-50 transition-colors">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {isCoach && (user.is_student || user.is_coach) ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForView(user.id)}
                            className="text-left text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:underline"
                          >
                            {(user as any).last_name} {(user as any).first_name}{(user as any).patronymic ? ` ${(user as any).patronymic}` : ''}
                          </button>
                        ) : (
                          <span>{user.last_name} {user.first_name}{(user as any).patronymic ? ` ${(user as any).patronymic}` : ''}</span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">{user.username}</div>
                      <div className="md:hidden text-xs text-gray-600 mt-1 break-all">{user.email}</div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-700 hidden md:table-cell text-sm">{user.email}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {user.is_staff && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            Админ
                          </span>
                        )}
                        {user.is_coach && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            Тренер
                          </span>
                        )}
                        {user.is_student && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Ученик
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex flex-row items-center justify-end gap-1 sm:gap-2 flex-nowrap">
                        {isCoach && (user.is_student || user.is_coach) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudentForAchievement(user.id)
                              setShowAchievementForm(true)
                            }}
                            leftIcon={<Award className="w-4 h-4" />}
                            className="text-xs px-2 py-2 sm:px-3 sm:py-2 h-9 sm:h-auto min-w-[36px] sm:min-w-0 shrink-0 flex-shrink-0"
                            title="Добавить достижение"
                          >
                            <span className="hidden sm:inline">Добавить достижение</span>
                          </Button>
                        )}
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingUser(user); setShowForm(true) }}
                              leftIcon={<Edit className="w-4 h-4" />}
                              className="text-xs px-2 py-2 sm:px-3 sm:py-2 h-9 sm:h-auto min-w-[36px] sm:min-w-0 shrink-0 flex-shrink-0"
                              title="Редактировать"
                            >
                              <span className="hidden sm:inline">Редактировать</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                                  deleteMutation.mutate(user.id)
                                }
                              }}
                              leftIcon={<Trash2 className="w-4 h-4" />}
                              className="text-xs px-2 py-2 sm:px-3 sm:py-2 h-9 sm:h-auto min-w-[36px] sm:min-w-0 shrink-0 flex-shrink-0"
                              title="Удалить"
                            >
                              <span className="hidden sm:inline">Удалить</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет пользователей</p>
          </div>
        )}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Показано {(page - 1) * 10 + 1}–{Math.min(page * 10, totalCount)} из {totalCount}
            </p>
            <div className="flex gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevious}
                className="text-xs"
              >
                Назад
              </Button>
              <span className="flex items-center px-2 sm:px-3 text-xs sm:text-sm text-gray-600">
                {page}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="text-xs"
              >
                Вперёд
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => { setShowForm(false); setEditingUser(null) }}
        />
      )}
      
      {showAchievementForm && (
        <AchievementForm
          open={showAchievementForm}
          onClose={() => {
            setShowAchievementForm(false)
            setSelectedStudentForAchievement(undefined)
          }}
          studentId={selectedStudentForAchievement}
        />
      )}
      
      <StudentInfoDialog
        open={selectedStudentForView != null}
        onClose={() => setSelectedStudentForView(null)}
        userId={selectedStudentForView}
      />
    </div>
  )
}

function UserForm({ user, onClose }: { user: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    patronymic: (user as any)?.patronymic || '',
    phone: user?.phone || '',
    is_coach: user?.is_coach || user?.is_staff || false,
    is_student: user?.is_student || true,
    is_staff: user?.is_staff || false,
    password: '',
  })
  
  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (user) {
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        return usersApi.updateUser(user.id, updateData)
      }
      return usersApi.createUser(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(user ? 'Пользователь обновлен' : 'Пользователь создан')
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при сохранении пользователя')
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
          {user ? 'Редактировать пользователя' : 'Создать пользователя'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Отчество
            </label>
            <input
              type="text"
              value={formData.patronymic}
              onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                required={!user}
              />
            </div>
          )}
          
          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Новый пароль (оставьте пустым, чтобы не менять)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_student}
                onChange={(e) => setFormData({ ...formData, is_student: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Ученик</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_coach}
                onChange={(e) => {
                  if (!e.target.checked && formData.is_staff) {
                        return
                  }
                  setFormData({ ...formData, is_coach: e.target.checked })
                }}
                    disabled={formData.is_staff}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">
                Тренер
                {formData.is_staff && <span className="text-xs text-gray-500 ml-1">(автоматически)</span>}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_staff}
                onChange={(e) => {
                  const isStaff = e.target.checked
                  setFormData({ 
                    ...formData, 
                    is_staff: isStaff,
                    is_coach: isStaff ? true : formData.is_coach
                  })
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Администратор</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {user ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
