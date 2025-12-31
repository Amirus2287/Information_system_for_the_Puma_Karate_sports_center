import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { journalApi } from '../api/journal'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import JournalForm from '../components/journal/JournalForm'
import JournalCard from '../components/journal/JournalCard'
import ProgressNoteForm from '../components/journal/ProgressNoteForm'
import TechniqueRecordForm from '../components/journal/TechniqueRecordForm'
import { Plus, BookOpen, TrendingUp, Target } from 'lucide-react'

export default function Journal() {
  const { user } = useAuth()
  const [showJournalForm, setShowJournalForm] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [showTechniqueForm, setShowTechniqueForm] = useState(false)
  
  const { data: journals, isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => journalApi.getJournals(),
    enabled: !!user,
  })
  
  const { data: progressNotes } = useQuery({
    queryKey: ['progress-notes'],
    queryFn: () => journalApi.getProgressNotes(),
    enabled: !!user,
  })
  
  const { data: techniqueRecords } = useQuery({
    queryKey: ['technique-records'],
    queryFn: () => journalApi.getTechniqueRecords(),
    enabled: !!user,
  })
  
  if (isLoading) {
    return <div>Загрузка...</div>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Электронный журнал</h1>
          <p className="text-gray-600">Отслеживайте прогресс и достижения</p>
        </div>
        
        {user?.is_coach && (
          <div className="flex gap-2">
            <Button onClick={() => setShowJournalForm(true)} leftIcon={<Plus />}>
              Новая запись
            </Button>
            <Button variant="outline" onClick={() => setShowProgressForm(true)}>
              Заметка о прогрессе
            </Button>
            <Button variant="outline" onClick={() => setShowTechniqueForm(true)}>
              Запись техники
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Записи тренировок</h2>
            </div>
            
            {journals?.length ? (
              <div className="space-y-4">
                {journals.map((journal: any) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Нет записей в журнале
              </p>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Заметки о прогрессе</h3>
            </div>
            
            {progressNotes?.slice(0, 3).map((note: any) => (
              <div key={note.id} className="p-3 border rounded mb-2">
                <p className="font-medium">{note.category}</p>
                <p className="text-sm text-gray-600">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="font-semibold">Техники</h3>
            </div>
            
            {techniqueRecords?.slice(0, 5).map((record: any) => (
              <div key={record.id} className="flex justify-between items-center p-2 border-b">
                <div>
                  <p className="font-medium">{record.technique}</p>
                  <p className="text-sm text-gray-600">
                    Уровень: {record.mastery_level}/10
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(record.date_recorded).toLocaleDateString()}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
      
      <JournalForm
        open={showJournalForm}
        onClose={() => setShowJournalForm(false)}
      />
      
      <ProgressNoteForm
        open={showProgressForm}
        onClose={() => setShowProgressForm(false)}
      />
      
      <TechniqueRecordForm
        open={showTechniqueForm}
        onClose={() => setShowTechniqueForm(false)}
      />
    </div>
  )
}