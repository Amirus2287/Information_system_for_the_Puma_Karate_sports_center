import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { competitionsApi } from '../api/competitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import CompetitionForm from '../components/competitions/CompetitionForm'
import RegistrationForm from '../components/competitions/RegistrationForm'
import { ArrowLeft, Trophy, Calendar, MapPin, Pencil, UserPlus } from 'lucide-react'

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isCoach = user?.is_coach || user?.is_staff
  const [showForm, setShowForm] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  const { data: competition, isLoading, error } = useQuery({
    queryKey: ['competition', id],
    queryFn: () => competitionsApi.getCompetition(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
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

  if (error || !competition) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Соревнование не найдено</p>
        <Link to="/competitions" className="text-primary-600 hover:text-primary-700 font-medium">
          Вернуться к списку соревнований
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link
            to="/competitions"
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
            title="Назад к соревнованиям"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{competition.name}</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Подробная информация о соревновании</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isCoach && (
            <Button
              variant="outline"
              leftIcon={<Pencil className="w-4 h-4" />}
              onClick={() => setShowForm(true)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Редактировать</span>
              <span className="sm:hidden">Изменить</span>
            </Button>
          )}
          {competition.is_active && user?.is_student && !isCoach && (
            <Button
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setShowRegistration(true)}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Зарегистрироваться</span>
              <span className="sm:hidden">Участвовать</span>
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <CompetitionForm
          open={showForm}
          onClose={() => setShowForm(false)}
          competition={competition}
        />
      )}

      {showRegistration && (
        <RegistrationForm
          open={showRegistration}
          onClose={() => setShowRegistration(false)}
          competitionId={competition.id}
        />
      )}

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-elegant w-full overflow-x-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            {competition.is_active ? (
              <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Активно
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                Завершено
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Дата</p>
              <p className="font-medium">
                {new Date(competition.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Место проведения</p>
              <p className="font-medium">{competition.location}</p>
            </div>
          </div>
        </div>

        {competition.description && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Описание</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{competition.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
