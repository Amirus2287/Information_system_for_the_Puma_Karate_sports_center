import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { User, Target, Award, FileVideo } from 'lucide-react'

interface JournalCardProps {
  journal: {
    id: number
    date: string
    attendance: boolean
    technique_score?: number
    kata_score?: number
    kumite_score?: number
    notes: string
    student_name: string
    coach_name: string
    video?: string
  }
}

export default function JournalCard({ journal }: JournalCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-lg">
            {new Date(journal.date).toLocaleDateString()}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <User className="w-4 h-4" />
            <span>Ученик: {journal.student_name}</span>
            <span>•</span>
            <span>Тренер: {journal.coach_name}</span>
          </div>
        </div>
        
        <Badge variant={journal.attendance ? 'success' : 'destructive'}>
          {journal.attendance ? 'Присутствовал' : 'Отсутствовал'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded">
          <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <div className="font-semibold">{journal.technique_score || '-'}</div>
          <div className="text-xs text-gray-600">Техника</div>
        </div>
        
        <div className="text-center p-2 bg-green-50 rounded">
          <Award className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <div className="font-semibold">{journal.kata_score || '-'}</div>
          <div className="text-xs text-gray-600">Ката</div>
        </div>
        
        <div className="text-center p-2 bg-purple-50 rounded">
          <Award className="w-5 h-5 mx-auto mb-1 text-purple-600" />
          <div className="font-semibold">{journal.kumite_score || '-'}</div>
          <div className="text-xs text-gray-600">Кумите</div>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3">{journal.notes}</p>
      
      {journal.video && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <FileVideo className="w-4 h-4" />
          <span>Есть видео запись</span>
        </div>
      )}
    </Card>
  )
}