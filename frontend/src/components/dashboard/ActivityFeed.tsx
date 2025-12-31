import { useQuery } from '@tanstack/react-query'
import Card from '../ui/Card'
import { Award, Calendar, Target, BookOpen } from 'lucide-react'

export default function ActivityFeed() {
  const { data: activities } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      return [
        { type: 'achievement', title: 'Получен желтый пояс', date: '2024-01-15' },
        { type: 'training', title: 'Интенсивная тренировка', date: '2024-01-14' },
        { type: 'competition', title: 'Участие в соревнованиях', date: '2024-01-10' },
        { type: 'journal', title: 'Новая запись в журнале', date: '2024-01-08' },
      ]
    },
  })
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="w-5 h-5 text-yellow-600" />
      case 'training': return <Target className="w-5 h-5 text-blue-600" />
      case 'competition': return <Calendar className="w-5 h-5 text-green-600" />
      case 'journal': return <BookOpen className="w-5 h-5 text-purple-600" />
      default: return <Award className="w-5 h-5" />
    }
  }
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-4">Последняя активность</h3>
      
      <div className="space-y-3">
        {activities?.map((activity: any, index: number) => (
          <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            {getIcon(activity.type)}
            <div className="flex-1">
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(activity.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}