import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { Trophy, Calendar, Users, TrendingUp, Award, Clock } from 'lucide-react'
import StatCard from '../components/dashboard/StatsCards'

export default function Dashboard() {
  const { user } = useAuth()
  
  const stats = [
    {
      title: 'Тренировок за месяц',
      value: '24',
      change: '+12%',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Активных учеников',
      value: '156',
      change: '+8%',
      icon: Users,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Соревнований',
      value: '6',
      change: '+2',
      icon: Trophy,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Посещаемость',
      value: '94%',
      change: '+3%',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600'
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Добро пожаловать, {user?.first_name}!</h1>
            <p className="text-primary-100 mt-2">
              {user?.is_coach 
                ? 'Панель управления тренера' 
                : 'Личный кабинет ученика'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span>Сегодня: {new Date().toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.title}</p>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Calendar className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium mb-1">Запланировать тренировку</h3>
            <p className="text-sm text-gray-600">Добавить новую тренировку в расписание</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Trophy className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium mb-1">Создать соревнование</h3>
            <p className="text-sm text-gray-600">Организовать новое спортивное мероприятие</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Award className="w-6 h-6 text-primary-600 mb-2" />
            <h3 className="font-medium mb-1">Добавить достижение</h3>
            <p className="text-sm text-gray-600">Отметить спортивные успехи учеников</p>
          </button>
        </div>
      </div>
    </div>
  )
}