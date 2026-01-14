import { Trophy, Calendar, Target, Users } from 'lucide-react'
import Card from '../ui/Card'

export default function StatsCards() {
  const stats = [
    { icon: Trophy, label: 'Соревнования', value: '3', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: Calendar, label: 'Тренировок', value: '24', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Target, label: 'Посещаемость', value: '92%', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Users, label: 'В группе', value: 'Начинающие', color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}