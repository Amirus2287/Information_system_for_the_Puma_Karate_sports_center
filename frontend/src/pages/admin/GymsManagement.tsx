import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatWorkingHours } from '../../utils/formatters'

function formatTimeForInput(value: string | undefined): string {
  if (!value) return ''
  return value.slice(0, 5)
}

export default function GymsManagement() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingGym, setEditingGym] = useState<any>(null)

  const { data: gyms, isLoading } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => trainingsApi.getGyms(),
    enabled: isAdmin,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trainingsApi.deleteGym(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] })
      toast.success('Зал удалён')
    },
    onError: () => {
      toast.error('Ошибка при удалении зала')
    },
  })

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 text-lg">У вас нет доступа к управлению залами</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление залами</h1>
          <p className="text-gray-600 mt-1">Добавление и редактирование залов для групп</p>
        </div>
        <Button onClick={() => { setEditingGym(null); setShowForm(true) }} leftIcon={<Plus />}>
          Добавить зал
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms?.length ? (
          gyms.map((gym: any) => (
            <div
              key={gym.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 hover:shadow-elegant-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <h3 className="font-bold text-lg text-gray-900">{gym.name}</h3>
                  </div>
                  {gym.address && (
                    <p className="text-sm text-gray-600 mb-2">{gym.address}</p>
                  )}
                  {gym.work_start && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatWorkingHours(gym.work_start, gym.work_end)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setEditingGym(gym); setShowForm(true) }}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Редактировать
                </Button>
                <button
                  onClick={() => {
                    if (window.confirm(`Удалить зал «${gym.name}»?`)) {
                      deleteMutation.mutate(gym.id)
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Удалить зал"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет залов</p>
            <p className="text-gray-400 text-sm mt-2">Добавьте первый зал</p>
          </div>
        )}
      </div>

      {showForm && (
        <GymForm
          gym={editingGym}
          onClose={() => { setShowForm(false); setEditingGym(null) }}
        />
      )}
    </div>
  )
}

function GymForm({ gym, onClose }: { gym: any; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: gym?.name || '',
    address: gym?.address || '',
    work_start: formatTimeForInput(gym?.work_start) || '09:00',
    work_end: formatTimeForInput(gym?.work_end) || '',
  })

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        name: data.name,
        address: data.address,
        work_start: data.work_start ? `${data.work_start}:00` : null,
        work_end: data.work_end ? `${data.work_end}:00` : null,
      }
      if (gym) {
        return trainingsApi.updateGym(gym.id, payload)
      }
      return trainingsApi.createGym(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] })
      toast.success(gym ? 'Зал обновлён' : 'Зал добавлен')
      onClose()
    },
    onError: () => {
      toast.error('Ошибка при сохранении зала')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

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
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {gym ? 'Редактировать зал' : 'Добавить зал'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время открытия</label>
              <input
                type="time"
                value={formData.work_start}
                onChange={(e) => setFormData({ ...formData, work_start: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время закрытия</label>
              <input
                type="time"
                value={formData.work_end}
                onChange={(e) => setFormData({ ...formData, work_end: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {gym ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
