import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { competitionsApi } from '../api/competitions'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { Plus, Trophy, Calendar, MapPin, Users, Award } from 'lucide-react'

export default function Competitions() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  
  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => competitionsApi.getCompetitions(),
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
          <h1 className="text-3xl font-bold text-gray-900">Соревнования</h1>
          <p className="text-gray-600 mt-1">
            Информация о соревнованиях и результатах
          </p>
        </div>
        
        {isAdmin && (
          <Button leftIcon={<Plus className="w-5 h-5" />}>
            Новое соревнование
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions?.length ? (
          competitions.map((competition: any) => (
            <div
              key={competition.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-primary-200 hover:shadow-elegant-lg transition-all"
            >
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
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {competition.description}
                </p>
              )}
              
              <Button variant="outline" className="w-full">
                Подробнее
              </Button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Нет соревнований</p>
            {isAdmin && (
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
