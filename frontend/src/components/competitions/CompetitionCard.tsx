import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { MapPin, Calendar, Users } from 'lucide-react'

interface CompetitionCardProps {
  competition: {
    id: number
    name: string
    location: string
    date: string
    is_active: boolean
    description: string
  }
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{competition.name}</h3>
        <Badge variant={competition.is_active ? 'success' : 'destructive'}>
          {competition.is_active ? 'Активно' : 'Завершено'}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{new Date(competition.date).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{competition.location}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Регистрация открыта</span>
        </div>
      </div>
      
      <p className="mt-3 text-gray-700 line-clamp-2">{competition.description}</p>
    </Card>
  )
}