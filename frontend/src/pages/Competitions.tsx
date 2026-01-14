import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import CompetitionRegistrationForm from '../components/competitions/RegistrationForm'
import CompetitionForm from '../components/competitions/CompetitionForm'
import { Plus, Filter, Search, Trophy, Calendar, MapPin, Users } from 'lucide-react'

export default function Competitions() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showCompetitionForm, setShowCompetitionForm] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Соревнования</h1>
          <p className="text-gray-600">Управление спортивными мероприятиями</p>
        </div>
        
        <Button
          onClick={() => setShowCompetitionForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Новое соревнование
        </Button>
      </div>
      
      <Card className="p-6">
        <p className="text-center text-gray-500 py-8">
          Функционал соревнований загружается...
        </p>
      </Card>
      
      <CompetitionRegistrationForm
        open={showRegistrationForm}
        onClose={() => setShowRegistrationForm(false)}
        competitionId={1}
      />
      
      <CompetitionForm
        open={showCompetitionForm}
        onClose={() => setShowCompetitionForm(false)}
      />
    </div>
  )
}