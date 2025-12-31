import { useQuery } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import Card from '../ui/Card'
import { Calendar, Clock, Users } from 'lucide-react'

export default function UpcomingTrainings() {
  const { data: trainings } = useQuery({
    queryKey: ['upcoming-trainings'],
    queryFn: () => trainingsApi.getTrainings(),
  })
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-4">Ближайшие тренировки</h3>
      
      <div className="space-y-3">
        {trainings?.slice(0, 3).map((training: any) => (
          <div key={training.id} className="p-3 border rounded hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{training.group?.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(training.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{training.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{training.group?.coach_name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}