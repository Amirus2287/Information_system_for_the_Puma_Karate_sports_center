import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TrainingForm from '../components/trainings/TrainingForm'
import AttendanceModal from '../components/trainings/AttendanceModal'
import { Plus, Calendar, Clock, Users, MapPin } from 'lucide-react'

export default function Trainings() {
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<any>(null)
  
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: () => trainingsApi.getTrainings(),
  })
  
  const { data: homework } = useQuery({
    queryKey: ['homework'],
    queryFn: () => trainingsApi.getHomework(),
  })
  
  if (isLoading) {
    return <div>Загрузка...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Тренировки</h1>
          <p className="text-gray-600">Расписание и посещаемость</p>
        </div>
        
        <Button onClick={() => setShowTrainingForm(true)} leftIcon={<Plus />}>
          Новая тренировка
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Расписание</h2>
            
            {trainings?.length ? (
              <div className="space-y-4">
                {trainings.map((training: any) => (
                  <Card key={training.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{training.group?.name}</h3>
                        <p className="text-sm text-gray-600">{training.topic}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTraining(training)
                            setShowAttendanceModal(true)
                          }}
                        >
                          Отметить посещаемость
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(training.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{training.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{training.group?.coach_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{training.group?.gym?.name}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Нет запланированных тренировок
              </p>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Домашние задания</h3>
            
            {homework?.length ? (
              <div className="space-y-3">
                {homework.slice(0, 3).map((hw: any) => (
                  <div key={hw.id} className="p-3 border rounded">
                    <p className="font-medium">{hw.task.slice(0, 50)}...</p>
                    <p className="text-sm text-gray-600">
                      Срок: {new Date(hw.deadline).toLocaleDateString()}
                    </p>
                    <div className={`text-xs mt-1 ${hw.completed ? 'text-green-600' : 'text-red-600'}`}>
                      {hw.completed ? 'Выполнено' : 'Не выполнено'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Нет домашних заданий
              </p>
            )}
          </Card>
        </div>
      </div>
      
      <TrainingForm
        open={showTrainingForm}
        onClose={() => setShowTrainingForm(false)}
      />
      
      <AttendanceModal
        open={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        training={selectedTraining}
      />
    </div>
  )
}