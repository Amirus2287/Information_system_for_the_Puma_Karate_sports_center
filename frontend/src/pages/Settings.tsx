import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../api/users'
import Button from '../components/ui/Button'
import { Award, Calendar, Target, Trophy, TrendingUp } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  
  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => usersApi.getAchievements({ user: user?.id }),
    enabled: !!user,
  })
  
  const getRoleBadges = () => {
    const badges = []
    if (user?.is_staff) {
      badges.push({ label: 'Администратор', color: 'bg-purple-100 text-purple-700' })
    }
    if (user?.is_coach) {
      badges.push({ label: 'Тренер', color: 'bg-blue-100 text-blue-700' })
    }
    if (user?.is_student) {
      badges.push({ label: 'Ученик', color: 'bg-green-100 text-green-700' })
    }
    return badges
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-600 mt-1">Ваша личная информация и достижения</p>
        </div>
        <Button variant="outline">Редактировать профиль</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600 mb-3">@{user?.username}</p>
                
                <div className="flex gap-2 mb-4">
                  {getRoleBadges().map((badge, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Телефон</p>
                    <p className="font-medium text-gray-900">{user?.phone || 'Не указан'}</p>
                  </div>
                  {user?.telegram_id && (
                    <div>
                      <p className="text-gray-500 mb-1">Telegram</p>
                      <p className="font-medium text-gray-900">@{user.telegram_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Достижения</h3>
            </div>
            
            {achievements?.length ? (
              <div className="space-y-4">
                {achievements.map((achievement: any) => (
                  <div
                    key={achievement.id}
                    className="bg-gradient-to-r from-white to-red-50 border-2 border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 rounded-lg">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Нет достижений</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Статистика</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Тренировок</span>
                </div>
                <span className="font-bold text-blue-600">24</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Посещаемость</span>
                </div>
                <span className="font-bold text-green-600">92%</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Соревнований</span>
                </div>
                <span className="font-bold text-yellow-600">3</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Достижений</span>
                </div>
                <span className="font-bold text-purple-600">{achievements?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
