import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionsApi } from '../api/competitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import CompetitionForm from '../components/competitions/CompetitionForm'
import { Plus, Trophy, Calendar, MapPin, Trash2, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Competitions() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const [showForm, setShowForm] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<any>(null)
  const queryClient = useQueryClient()
  
  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => competitionsApi.getCompetitions(),
  })
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => competitionsApi.deleteCompetition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Соревнование удалено')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении соревнования')
    },
  })
  
  const handleDelete = (competition: any) => {
    if (window.confirm(`Вы уверены, что хотите удалить соревнование "${competition.name}"?`)) {
      deleteMutation.mutate(competition.id)
    }
  }
  
  const handleEdit = (competition: any) => {
    setEditingCompetition(competition)
    setShowForm(true)
  }
  
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCompetition(null)
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Соревнования</h1>
          <p className="text-gray-600 mt-1">
            Информация о соревнованиях и результатах
          </p>
        </div>
        
        {isCoach && (
          <Button 
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setShowForm(true)}
          >
            Новое соревнование
          </Button>
        )}
      </div>
      
      {showForm && (
        <CompetitionForm 
          open={showForm} 
          onClose={handleCloseForm}
          competition={editingCompetition}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions?.length ? (
          competitions.map((competition: any) => (
            <div
              key={competition.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 hover:shadow-elegant-lg transition-all relative"
            >
              {isCoach && (
                <div className="absolute top-4 right-4 z-[1] flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(competition)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    title="Редактировать соревнование"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(competition)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Удалить соревнование"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{competition.name}</h3>
                  {competition.is_active ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      Активно
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      Завершено
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">
                    {new Date(competition.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">{competition.location}</span>
                </div>
              </div>
              
              {competition.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {competition.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет соревнований</p>
            {isCoach && (
              <p className="text-gray-400 text-sm mt-2">
                Создайте первое соревнование
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
