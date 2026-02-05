import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../api/trainings'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { ArrowLeft, FileText, Calendar, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HomeworkDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isCoach = !!(user?.is_coach || user?.is_staff)

  const { data: homework, isLoading, error } = useQuery({
    queryKey: ['homework', id],
    queryFn: () => trainingsApi.getHomeworkById(Number(id)),
    enabled: !!id && !isNaN(Number(id)),
  })

  const toggleMutation = useMutation({
    mutationFn: (completed: boolean) =>
      trainingsApi.updateHomework(Number(id), { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework', id] })
      queryClient.invalidateQueries({ queryKey: ['homeworks'] })
      toast.success(homework?.completed ? 'Отмечено как не выполненное' : 'Отмечено как выполненное')
    },
    onError: () => toast.error('Ошибка при обновлении'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error || !homework) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Домашнее задание не найдено</p>
        <Link to="/homeworks" className="text-primary-600 hover:text-primary-700 font-medium">
          Вернуться к заданиям
        </Link>
      </div>
    )
  }

  const isOverdue = new Date(homework.deadline) < new Date() && !homework.completed

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Link
            to="/homeworks"
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
            title="Назад к заданиям"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Домашнее задание</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Подробная информация</p>
          </div>
        </div>
        {!isCoach && (
          <Button
            variant={homework.completed ? 'outline' : 'primary'}
            onClick={() => toggleMutation.mutate(!homework.completed)}
            disabled={toggleMutation.isPending}
            leftIcon={homework.completed ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            className="shrink-0 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{homework.completed ? 'Отменить выполнение' : 'Отметить выполненным'}</span>
            <span className="sm:hidden">{homework.completed ? 'Отменить' : 'Выполнено'}</span>
          </Button>
        )}
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-elegant w-full overflow-x-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              homework.completed
                ? 'bg-green-100 text-green-700'
                : isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {homework.completed ? 'Выполнено' : isOverdue ? 'Просрочено' : 'В процессе'}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Текст задания</h2>
          <div className="min-h-[120px] p-4 rounded-xl bg-gray-50 border-2 border-gray-100 text-gray-900 whitespace-pre-wrap break-words">
            {homework.task || 'Текст задания не указан.'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Срок выполнения</p>
              <p className="font-medium">
                {new Date(homework.deadline).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {isOverdue && !homework.completed && (
                  <span className="ml-1 text-red-600 text-sm">(Просрочено)</span>
                )}
              </p>
            </div>
          </div>
          {homework.training_date && (
            <div className="flex items-center gap-3 text-gray-700">
              <BookOpen className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Тренировка</p>
                <p className="font-medium">
                  {new Date(homework.training_date).toLocaleDateString('ru-RU')}
                  {homework.training_topic && ` — ${homework.training_topic}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
