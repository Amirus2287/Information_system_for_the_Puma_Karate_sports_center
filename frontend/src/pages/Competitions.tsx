import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Plus, Filter, Search, Trophy, Calendar, MapPin, Users } from 'lucide-react';
import { competitionsApi } from '../api/competitions';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { CompetitionRegistrationForm } from '../components/competitions/RegistrationForm';
import { CompetitionForm } from '../components/competitions/CompetitionForm';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  upcoming: 'Предстоящие',
  ongoing: 'Идут сейчас',
  completed: 'Завершены',
  cancelled: 'Отменены',
};

const CompetitionsPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showCompetitionForm, setShowCompetitionForm] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['competitions', statusFilter],
    queryFn: () => competitionsApi.getCompetitions({
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
  });

  const { data: userRegistrations } = useQuery({
    queryKey: ['user-competition-registrations'],
    queryFn: () => competitionsApi.getRegistrations({
      user_id: user?.id,
    }),
    enabled: !!user?.id,
  });

  const filteredCompetitions = competitions?.filter(comp =>
    comp.name.toLowerCase().includes(search.toLowerCase()) ||
    comp.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (competitionId: number) => {
    setSelectedCompetition(competitionId);
    setShowRegistrationForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Соревнования</h1>
          <p className="text-muted-foreground">
            Зарегистрируйтесь и следите за результатами
          </p>
        </div>
        
        {user?.is_coach && (
          <Button
            onClick={() => setShowCompetitionForm(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Новое соревнование
          </Button>
        )}
      </div>

      {/* Фильтры и поиск */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск соревнований..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Все' : statusLabels[status as keyof typeof statusLabels]}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Список соревнований */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetitions?.map((competition, index) => {
          const userRegistration = userRegistrations?.find(
            r => r.competition === competition.id || r.competition_details?.id === competition.id
          );

          return (
            <motion.div
              key={competition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{competition.name}</h3>
                      <Badge className={`mt-2 ${statusColors[competition.status]}`}>
                        {statusLabels[competition.status]}
                      </Badge>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(competition.date), 'd MMMM yyyy', { locale: ru })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{competition.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {competition.statistics?.confirmed_registrations || 0} участников
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm line-clamp-2">{competition.description}</p>

                  <div className="mt-6 flex gap-2">
                    {user?.is_student && competition.can_register && (
                      <Button
                        variant={userRegistration ? 'outline' : 'default'}
                        className="flex-1"
                        onClick={() => handleRegister(competition.id)}
                        disabled={!!userRegistration}
                      >
                        {userRegistration
                          ? userRegistration.status_display
                          : 'Зарегистрироваться'}
                      </Button>
                    )}
                    
                    <Button variant="ghost" className="flex-1">
                      Подробнее
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Формы */}
      {selectedCompetition && (
        <CompetitionRegistrationForm
          open={showRegistrationForm}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedCompetition(null);
          }}
          competitionId={selectedCompetition}
        />
      )}

      <CompetitionForm
        open={showCompetitionForm}
        onClose={() => setShowCompetitionForm(false)}
      />
    </div>
  );
};

export default CompetitionsPage;