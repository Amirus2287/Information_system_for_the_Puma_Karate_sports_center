import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../api/users'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { Award, Calendar, Target, User } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  
  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => usersApi.getAchievements(),
    enabled: !!user,
  })
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Профиль</h1>
          <p className="text-gray-600">Ваша личная информация</p>
        </div>
        
        <Button>Редактировать профиль</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <Avatar
                className="w-24 h-24"
                fallback={`${user?.first_name?.[0]}${user?.last_name?.[0]}`}
              />
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600">@{user?.username}</p>
                
                <div className="flex gap-6 mt-4">
                  <div>
                    <p className="font-medium">Роль</p>
                    <p className="text-gray-600">
                      {user?.is_coach ? 'Тренер' : 'Ученик'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Телефон</p>
                    <p className="text-gray-600">{user?.phone || 'Не указан'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Достижения</h3>
            
            {achievements?.length ? (
              <div className="space-y-4">
                {achievements.map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded">
                    <Award className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Нет достижений
              </p>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Статистика</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Тренировок</span>
                </div>
                <span className="font-semibold">24</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Посещаемость</span>
                </div>
                <span className="font-semibold">92%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Соревнования</span>
                </div>
                <span className="font-semibold">3</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span>В группе</span>
                </div>
                <span className="font-semibold">Начинающие</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}