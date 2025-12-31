import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import StatsCards from '../components/dashboard/StatsCards'
import UpcomingTrainings from '../components/dashboard/UpcomingTrainings'
import CompetitionStats from '../components/dashboard/CompetitionStats'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import { Trophy, Calendar, Target, Users } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <p className="text-gray-600">
          Добро пожаловать, {user?.first_name} {user?.last_name}!
        </p>
      </div>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <UpcomingTrainings />
          <CompetitionStats />
        </div>
        
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
}