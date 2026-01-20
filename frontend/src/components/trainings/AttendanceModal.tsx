import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import { usersApi } from '../../api/users'
import Dialog from '../ui/Dialog'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

interface AttendanceModalProps {
  open: boolean
  onClose: () => void
  training: any
}

export default function AttendanceModal({ open, onClose, training }: AttendanceModalProps) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      student: '',
      present: true,
      notes: '',
    },
  })
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', training?.group],
    queryFn: () => trainingsApi.getGroupStudents({ group: training?.group, is_active: true }),
    enabled: !!training?.group,
  })
  
  const { data: existingAttendances } = useQuery({
    queryKey: ['attendances', training?.id],
    queryFn: () => trainingsApi.getAttendances({ training: training?.id }),
    enabled: !!training?.id,
  })
  
  const mutation = useMutation({
    mutationFn: (data: any) => {
      const existing = existingAttendances?.find(
        (att: any) => att.student === parseInt(data.student) && att.training === training?.id
      )
      
      if (existing) {
        return trainingsApi.updateAttendance(existing.id, {
          present: data.present === 'true' || data.present === true,
          notes: data.notes,
        })
      } else {
        return trainingsApi.createAttendance({
          training: training?.id,
          student: data.student,
          present: data.present === 'true' || data.present === true,
          notes: data.notes,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] })
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      toast.success('Посещаемость сохранена')
      onClose()
      reset()
    },
    onError: () => {
      toast.error('Ошибка при сохранении посещаемости')
    },
  })
  
  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }
  
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])
  
  const students = groupStudents?.map((gs: any) => ({
    id: gs.student,
    first_name: gs.student_first_name || gs.student_name?.split(' ')[0] || '',
    last_name: gs.student_last_name || gs.student_name?.split(' ').slice(1).join(' ') || '',
  })) || []
  
  return (
    <Dialog open={open} onOpenChange={onClose} title="Отметка посещаемости">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select 
          label="Ученик" 
          {...register('student', { required: 'Выберите ученика' })}
          error={errors.student?.message as string}
        >
          <option value="">Выберите ученика</option>
          {students.map((student: any) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
        </Select>
        
        <Select 
          label="Статус посещаемости"
          {...register('present')}
        >
          <option value="true">Присутствовал</option>
          <option value="false">Отсутствовал</option>
        </Select>
        
        <Textarea
          label="Заметки"
          placeholder="Дополнительная информация..."
          rows={3}
          {...register('notes')}
        />
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Сохранить
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
