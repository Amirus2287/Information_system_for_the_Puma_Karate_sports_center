import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import { formatDate, formatTrainingTime } from '../../utils/formatters'
import Dialog from '../ui/Dialog'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Input from '../ui/Input'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface HomeworkFormProps {
  open: boolean
  onClose: () => void
  training?: any
  student?: any
  onSuccess?: () => void
}

export default function HomeworkForm({ open, onClose, training, student, onSuccess }: HomeworkFormProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      training: training?.id || '',
      student: student?.student || 'all',
      task: '',
      deadline: '',
      completed: false,
    },
  })
  
  const selectedStudent = watch('student')
  const selectedTraining = watch('training')
  
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(training?.id || null)
  
  const { data: selectedTrainingData } = useQuery({
    queryKey: ['trainings', selectedTrainingId],
    queryFn: async () => {
      const allTrainings = await trainingsApi.getTrainings()
      return allTrainings.find((t: any) => t.id === selectedTrainingId)
    },
    enabled: !!selectedTrainingId && !training,
  })
  
  const currentTraining = training || selectedTrainingData
  const studentGroup = student?.group
  const groupId = currentTraining?.group || studentGroup
  
  const { data: trainings, isLoading: trainingsLoading } = useQuery({
    queryKey: ['trainings', groupId],
    queryFn: async () => {
      const params: any = {}
      if (groupId) {
        params.group = groupId
      }
      return trainingsApi.getTrainings(params)
    },
    enabled: !training,
  })
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', groupId],
    queryFn: () => trainingsApi.getGroupStudents({ group: groupId, is_active: true }),
    enabled: !!groupId,
  })
  
  const students = groupStudents?.map((gs: any) => ({
    id: gs.student,
    name: gs.student_name || `${gs.student_first_name || ''} ${gs.student_last_name || ''}`.trim(),
  })) || []
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const students = groupStudents || []
      const trainingId = data.training && data.training !== '' ? parseInt(data.training) : undefined
      
      if (data.student === 'all') {
        if (students.length === 0) {
          throw new Error('В группе нет учеников')
        }
        const promises = students.map((gs: any) => {
          const homeworkData: any = {
            student: gs.student,
            task: data.task,
            deadline: data.deadline,
            completed: false,
          }
          if (trainingId) {
            homeworkData.training = trainingId
          }
          return trainingsApi.createHomework(homeworkData)
        })
        const results = await Promise.allSettled(promises)
        const successful = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected').length
        
        if (failed > 0) {
          throw new Error(`Создано для ${successful} из ${students.length} учеников`)
        }
        return results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean)
      } else {
        const homeworkData: any = {
          student: data.student,
          task: data.task,
          deadline: data.deadline,
          completed: false,
        }
        if (trainingId) {
          homeworkData.training = trainingId
        }
        return trainingsApi.createHomework(homeworkData)
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['homeworks'] })
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      const count = Array.isArray(result) ? result.length : 1
      toast.success(`Домашнее задание создано${count > 1 ? ` для ${count} учеников` : ''}`)
      if (onSuccess) {
        onSuccess()
      }
      onClose()
      reset()
    },
    onError: (error: any) => {
      const errorMessage = error.message || 
                          error.response?.data?.detail || 
                          error.response?.data?.task?.[0] ||
                          'Ошибка при создании домашнего задания'
      toast.error(errorMessage)
    },
  })
  
  const onSubmit = (data: any) => {
    if (data.student === 'all' && (!groupStudents || groupStudents.length === 0)) {
      toast.error('В группе нет учеников')
      return
    }
    mutation.mutate(data)
  }
  
  useEffect(() => {
    if (training) {
      setSelectedTrainingId(training.id)
      reset({
        training: training.id,
        student: student?.student || 'all',
        task: '',
        deadline: '',
        completed: false,
      })
    } else {
      setSelectedTrainingId(null)
      reset({
        training: '',
        student: student?.student || 'all',
        task: '',
        deadline: '',
        completed: false,
      })
    }
  }, [open, training, student, reset])
  
  const handleTrainingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const trainingId = e.target.value
    setValue('training', trainingId)
    setSelectedTrainingId(trainingId ? parseInt(trainingId) : null)
  }
  
  const availableTrainings = training ? [training] : (trainings || [])
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }} 
      title="Создать домашнее задание"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!training && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тренировка (необязательно)
            </label>
            <select
              value={selectedTraining || ''}
              onChange={handleTrainingChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              disabled={trainingsLoading}
            >
              <option value="">Без привязки к тренировке</option>
              {trainingsLoading ? (
                <option value="">Загрузка тренировок...</option>
              ) : availableTrainings.length > 0 ? (
                availableTrainings.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.group_name || t.group?.name} - {formatDate(t.date)} {formatTrainingTime(t.time_start, t.time_end)}
                  </option>
                ))
              ) : (
                <option value="">Нет доступных тренировок</option>
              )}
            </select>
            {errors.training && (
              <p className="text-red-600 text-sm mt-1">{errors.training.message as string}</p>
            )}
          </div>
        )}
        
        <Select 
          label="Ученик" 
          {...register('student', { 
            required: 'Выберите ученика или всю группу',
            validate: (value) => value !== '' || 'Выберите ученика или всю группу'
          })}
          error={errors.student?.message as string}
        >
          <option value="">Выберите ученика</option>
          {students.length > 0 && (
            <option value="all">Вся группа ({students.length} учеников)</option>
          )}
          {students.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        
        <Textarea
          label="Задание"
          placeholder="Опишите домашнее задание..."
          rows={4}
          {...register('task', { required: 'Введите задание' })}
          error={errors.task?.message as string}
        />
        
        <Input
          type="date"
          label="Срок выполнения"
          {...register('deadline', { required: 'Укажите срок выполнения' })}
          error={errors.deadline?.message as string}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Создать
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
