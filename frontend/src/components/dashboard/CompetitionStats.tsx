import { useQuery } from '@tanstack/react-query'
import { competitionsApi } from '../../api/competitions'
import Card from '../ui/Card'
import { Trophy, Award, Calendar } from 'lucide-react'

export default function CompetitionStats() {
  const { data: competitions } = useQuery({
    queryKey: ['competitions-stats'],
    queryFn: () => competitionsApi.getCompetitions(),
  })
  
  const upcoming = competitions?.filter((c: any) => 
    new Date(c.date) > new Date() && c.is_active
  ).length || 0
  
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-lg mb-4">Соревнования</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span>Всего соревнований</span>
          </div>
          <span className="font-semibold">{competitions?.length || 0}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-green-50 rounded">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Предстоящие</span>
          </div>
          <span className="font-semibold">{upcoming}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Участие</span>
          </div>
          <span className="font-semibold">0</span>
        </div>
      </div>
    </Card>
  )
}