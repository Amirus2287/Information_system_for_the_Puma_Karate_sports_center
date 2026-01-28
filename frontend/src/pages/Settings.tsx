import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { usersApi } from '../api/users'
import { trainingsApi } from '../api/trainings'
import { competitionsApi } from '../api/competitions'
import Button from '../components/ui/Button'
import ProfileForm from '../components/profile/ProfileForm'
import { Award, Calendar, Target, Trophy, TrendingUp } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const isStudent = user?.is_student && !user?.is_coach && !user?.is_staff
  const isCoach = user?.is_coach || user?.is_staff
  
  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => usersApi.getAchievements({ user: user?.id }),
    enabled: !!user,
  })
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', 'user', user?.id],
    queryFn: () => trainingsApi.getGroupStudents({ student: user?.id, is_active: true }),
    enabled: !!user && isStudent,
  })
  
  const { data: coachGroups } = useQuery({
    queryKey: ['groups', 'coach', user?.id],
    queryFn: () => trainingsApi.getGroups(),
    enabled: !!user && isCoach,
  })
  
  const { data: allTrainings } = useQuery({
    queryKey: ['trainings', 'stats', user?.id, groupStudents, coachGroups],
    queryFn: async () => {
      if (isStudent && groupStudents && groupStudents.length > 0) {
        const groupIds = groupStudents
          .map((gs: any) => {
            const groupId = typeof gs.group === 'object' ? gs.group?.id : gs.group
            return Number(groupId)
          })
          .filter((id: number) => !isNaN(id) && id > 0)
        
        if (groupIds.length === 0) return []
        
        const uniqueGroupIds = [...new Set(groupIds)]
        const trainings = await Promise.all(
          uniqueGroupIds.map((groupId: number) => 
            trainingsApi.getTrainings({ group: groupId }).catch(() => [])
          )
        )
        return trainings.flat()
      } else if (isCoach && coachGroups && coachGroups.length > 0) {
        const groupIds = coachGroups
          .filter((group: any) => {
            const coachId = typeof group.coach === 'object' ? group.coach?.id : group.coach
            return Number(coachId) === user?.id
          })
          .map((group: any) => Number(group.id))
          .filter((id: number) => !isNaN(id) && id > 0)
        
        if (groupIds.length === 0) return []
        
        const uniqueGroupIds = [...new Set(groupIds)]
        const trainings = await Promise.all(
          uniqueGroupIds.map((groupId: number) => 
            trainingsApi.getTrainings({ group: groupId }).catch(() => [])
          )
        )
        return trainings.flat()
      }
      return []
    },
    enabled: !!user && (isStudent || isCoach),
  })
  
  const { data: attendances } = useQuery({
    queryKey: ['attendances', 'stats', user?.id],
    queryFn: () => trainingsApi.getAttendances({ student: user?.id }),
    enabled: !!user && isStudent,
  })
  
  const { data: competitions } = useQuery({
    queryKey: ['competitions', 'stats'],
    queryFn: () => competitionsApi.getCompetitions(),
    enabled: !!user,
  })
  
  const stats = useMemo(() => {
    const trainingsCount = allTrainings?.length || 0
    
    let attendancePercent = 0
    if (isStudent && attendances && allTrainings) {
      const presentCount = attendances.filter((att: any) => att.present).length
      const totalCount = allTrainings.length
      attendancePercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
    }
    
    const competitionsCount = competitions?.length || 0
    const achievementsCount = achievements?.length || 0
    
    return {
      trainings: trainingsCount,
      attendance: attendancePercent,
      competitions: competitionsCount,
      achievements: achievementsCount,
    }
  }, [allTrainings, attendances, competitions, achievements, isStudent])
  
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
        <Button variant="outline" onClick={() => setShowProfileForm(true)}>
          Редактировать профиль
        </Button>
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
                <span className="font-bold text-blue-600">{stats.trainings}</span>
              </div>
              
              {isStudent && (
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Посещаемость</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.attendance}%</span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Соревнований</span>
                </div>
                <span className="font-bold text-yellow-600">{stats.competitions}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Достижений</span>
                </div>
                <span className="font-bold text-purple-600">{stats.achievements}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showProfileForm && (
        <ProfileForm 
          open={showProfileForm} 
          onClose={() => setShowProfileForm(false)} 
        />
      )}
    </div>
  )
}
