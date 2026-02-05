import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'
import { Trophy, Calendar, Users, TrendingUp, Award, Clock, BookOpen, Newspaper, UserCog } from 'lucide-react'
import { trainingsApi } from '../api/trainings'
import { formatTrainingTime, toLocalDate } from '../utils/formatters'
import { journalApi } from '../api/journal'
import { competitionsApi } from '../api/competitions'
import { usersApi } from '../api/users'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  const isStudent = user?.is_student && !isCoach
  
  const { data: trainings } = useQuery({
    queryKey: ['trainings', 'dashboard'],
    queryFn: () => trainingsApi.getTrainings({ limit: 5 }),
    enabled: !!user,
  })
  
  const { data: journals } = useQuery({
    queryKey: ['journals', 'dashboard'],
    queryFn: () => journalApi.getJournals({ limit: 5 }),
    enabled: !!user && isStudent,
  })
  
  const { data: competitions } = useQuery({
    queryKey: ['competitions', 'dashboard'],
    queryFn: () => competitionsApi.getCompetitions(),
    enabled: !!user,
  })
  
  const { data: achievements } = useQuery({
    queryKey: ['achievements', 'dashboard'],
    queryFn: () => usersApi.getAchievements(),
    enabled: !!user && isStudent,
  })
  
  const { data: news } = useQuery({
    queryKey: ['news', 'dashboard'],
    queryFn: () => usersApi.getNews(),
    enabled: !!user,
  })
  
  useQuery({
    queryKey: ['users', 'dashboard'],
    queryFn: () => usersApi.getUsers({ page_size: 100 }),
    enabled: !!user && isAdmin,
  })
  
  const getRoleText = () => {
    if (isAdmin) return 'Панель администратора'
    if (isCoach) return 'Панель управления тренера'
    return 'Личный кабинет ученика'
  }
  
  const getQuickActions = () => {
    if (isAdmin) {
      return [
        {
          icon: Newspaper,
          title: 'Управление новостями',
          description: 'Создавать и редактировать новости',
          onClick: () => navigate('/admin/news'),
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          icon: UserCog,
          title: 'Управление пользователями',
          description: 'Добавлять и редактировать пользователей',
          onClick: () => navigate('/admin/users'),
          gradient: 'from-primary-500 to-primary-600'
        },
        {
          icon: Trophy,
          title: 'Создать соревнование',
          description: 'Организовать новое спортивное мероприятие',
          onClick: () => navigate('/competitions'),
          gradient: 'from-orange-500 to-orange-600'
        }
      ]
    } else if (isCoach) {
      return [
        {
          icon: Calendar,
          title: 'Создать тренировку',
          description: 'Добавить новую тренировку в расписание',
          onClick: () => navigate('/trainings'),
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          icon: Users,
          title: 'Управление группами',
          description: 'Формировать группы и добавлять учеников',
          onClick: () => navigate('/groups'),
          gradient: 'from-primary-500 to-primary-600'
        },
        {
          icon: BookOpen,
          title: 'Записать в журнал',
          description: 'Отметить посещаемость и оставить комментарии',
          onClick: () => navigate('/journal'),
          gradient: 'from-orange-500 to-orange-600'
        }
      ]
    } else {
      return [
        {
          icon: Calendar,
          title: 'Расписание тренировок',
          description: 'Просмотреть расписание и место проведения',
          onClick: () => navigate('/trainings'),
          gradient: 'from-blue-500 to-blue-600'
        },
        {
          icon: BookOpen,
          title: 'Электронный журнал',
          description: 'Посмотреть посещаемость и комментарии тренера',
          onClick: () => navigate('/journal'),
          gradient: 'from-primary-500 to-primary-600'
        },
        {
          icon: Trophy,
          title: 'Соревнования',
          description: 'Узнать о предстоящих соревнованиях',
          onClick: () => navigate('/competitions'),
          gradient: 'from-orange-500 to-orange-600'
        }
      ]
    }
  }
  
  const quickActions = getQuickActions()
  
  return (
    <div className="space-y-3 sm:space-y-6 lg:space-y-8 w-full overflow-x-hidden">
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 text-white shadow-elegant-lg overflow-hidden w-full">
        <div className="absolute inset-0 opacity-10 sm:opacity-20">
          <div className="w-full h-full bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
        </div>
        <div className="relative flex flex-col gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 tracking-tight text-white">
              <span className="hidden sm:inline">Добро пожаловать {user?.first_name}!</span>
              <span className="sm:hidden">Добро пожаловать!</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-red-100 font-medium">
              {getRoleText()}
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">
              {new Date().toLocaleDateString('ru-RU', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-elegant w-full overflow-x-hidden">
        <div className="mb-3 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Быстрые действия</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="group p-4 sm:p-6 border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-primary-300 hover:bg-red-50 text-left transition-all duration-200 hover:shadow-md"
            >
              <div className={`bg-gradient-to-br ${action.gradient} p-2 sm:p-3 rounded-lg w-fit mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">{action.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
      
      {news && news.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-elegant w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Последние новости</h2>
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin/news')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
              >
                Управление новостями
              </button>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            {news.slice(0, 3).map((item: any) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="block w-full text-left p-3 sm:p-5 border-2 border-gray-100 rounded-lg sm:rounded-xl hover:border-primary-200 hover:bg-red-50 transition-all"
              >
                <div className="flex items-start gap-2 sm:gap-3 mb-2">
                  <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2">{item.title}</h3>
                    <div 
                      className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 prose prose-sm max-w-none hidden sm:block"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                      <span className="truncate">Автор: {item.author_name || 'Неизвестен'}</span>
                      <span className="hidden sm:inline">
                        {new Date(item.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="sm:hidden">
                        {new Date(item.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {isStudent && trainings && trainings.length > 0 && (
        <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 shadow-elegant">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Ближайшие тренировки</h2>
            <button 
              onClick={() => navigate('/trainings')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
            >
              Все
            </button>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {trainings.slice(0, 3).map((training: any) => (
              <div
                key={training.id}
                className="p-3 sm:p-4 border-2 border-gray-100 rounded-lg sm:rounded-xl hover:border-primary-200 hover:bg-red-50 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{training.group_name || training.group?.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1">{training.topic || 'Тема не указана'}</p>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {toLocalDate(training.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatTrainingTime(training.time_start, training.time_end)}
                      </span>
                      {training.gym_name && (
                        <span className="flex items-center gap-1 hidden sm:flex">
                          <Users className="w-4 h-4" />
                          {training.gym_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {training.coach_name && (
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-500">Тренер</p>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{training.coach_name}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
