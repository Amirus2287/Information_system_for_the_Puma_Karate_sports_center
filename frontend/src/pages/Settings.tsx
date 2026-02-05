import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { trainingsApi } from '../api/trainings'
import { competitionsApi } from '../api/competitions'
import { usersApi } from '../api/users'
import Button from '../components/ui/Button'
import ProfileForm from '../components/profile/ProfileForm'
import AchievementForm from '../components/achievements/AchievementForm'
import Avatar from '../components/ui/Avatar'
import { Calendar, Target, Trophy, TrendingUp, Award, Plus } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showAchievementForm, setShowAchievementForm] = useState(false)
  const isStudent = user?.is_student && !user?.is_coach && !user?.is_staff
  const isCoach = user?.is_coach || user?.is_staff
  
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
        
        const uniqueGroupIds = Array.from(new Set<number>(groupIds))
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
        
        const uniqueGroupIds = Array.from(new Set<number>(groupIds))
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
  
  const { data: achievements } = useQuery({
    queryKey: ['achievements', 'user', user?.id],
    queryFn: () => usersApi.getAchievements({ user: user?.id }),
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
    
    return {
      trainings: trainingsCount,
      attendance: attendancePercent,
      competitions: competitionsCount,
    }
  }, [allTrainings, attendances, competitions, isStudent])
  
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
    <div className="space-y-3 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Настройки</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1">Ваша личная информация</p>
        </div>
        <Button variant="outline" onClick={() => setShowProfileForm(true)} className="shrink-0 text-xs sm:text-sm">
          Редактировать профиль
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 w-full">
        <div className="lg:col-span-2 space-y-3 sm:space-y-6">
          <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-elegant w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
              <Avatar
                src={user?.avatar || undefined}
                alt={`${user?.first_name} ${user?.last_name}`}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0"
                fallback={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
              />
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 break-words">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-2 sm:mb-3 break-words">@{user?.username}</p>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {getRoleBadges().map((badge, index) => (
                    <span
                      key={index}
                      className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500 mb-0.5 sm:mb-1">Email</p>
                    <p className="font-medium text-gray-900 break-all">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5 sm:mb-1">Телефон</p>
                    <p className="font-medium text-gray-900">{user?.phone || 'Не указан'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Статистика</h3>
            </div>
            
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Тренировок</span>
                </div>
                <span className="font-bold text-blue-600 text-sm sm:text-base">{stats.trainings}</span>
              </div>
              
              {isStudent && (
                <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Посещаемость</span>
                  </div>
                  <span className="font-bold text-green-600 text-sm sm:text-base">{stats.attendance}%</span>
                </div>
              )}
              
              <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Соревнований</span>
                </div>
                <span className="font-bold text-yellow-600 text-sm sm:text-base">{stats.competitions}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Достижения</h3>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAchievementForm(true)}
                leftIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                className="text-xs"
              >
                <span className="hidden sm:inline">Добавить</span>
              </Button>
            </div>
            
            {achievements && achievements.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {achievements.slice(0, 5).map((achievement: any) => {
                  const imageUrl = achievement.image 
                    ? (achievement.image.startsWith('http') 
                        ? achievement.image 
                        : achievement.image.startsWith('/') ? achievement.image : `/${achievement.image}`)
                    : null
                  const achievementDate = new Date(achievement.date).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                  return (
                    <div key={achievement.id} className="border-b border-gray-100 last:border-0 pb-3 sm:pb-4 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{achievement.title}</span>
                        <span className="text-gray-500 shrink-0 text-xs">{achievementDate}</span>
                      </div>
                      {achievement.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{achievement.description}</p>
                      )}
                      {imageUrl && (
                        <div className="mt-2">
                          <img
                            src={imageUrl}
                            alt={achievement.title}
                            className="w-full max-w-md h-auto rounded-lg border border-gray-200 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 text-center py-3 sm:py-4">Нет достижений</p>
            )}
          </div>
        </div>
      </div>
      
      {showProfileForm && (
        <ProfileForm 
          open={showProfileForm} 
          onClose={() => setShowProfileForm(false)} 
        />
      )}
      
      {showAchievementForm && (
        <AchievementForm
          open={showAchievementForm}
          onClose={() => setShowAchievementForm(false)}
          studentId={user?.id}
        />
      )}
    </div>
  )
}
