import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { journalApi } from '../../api/journal'
import { useAuth } from '../../hooks/useAuth'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { usersApi } from '../../api/users'

const journalSchema = z.object({
  student: z.string(),
  date: z.string(),
  attendance: z.boolean(),
  technique_score: z.number().optional(),
  kata_score: z.number().optional(),
  kumite_score: z.number().optional(),
  notes: z.string(),
})

type JournalFormData = z.infer<typeof journalSchema>

interface JournalFormProps {
  open: boolean
  onClose: () => void
}

export default function JournalForm({ open, onClose }: JournalFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [students, setStudents] = useState<any[]>([])
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      attendance: true,
      date: new Date().toISOString().split('T')[0],
    },
  })
  
  const mutation = useMutation({
    mutationFn: (data: JournalFormData) => 
      journalApi.createJournal({ ...data, coach: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] })
      onClose()
      reset()
    },
  })
  
  const loadStudents = async () => {
    if (students.length === 0) {
      const data = await usersApi.getUsers({ page_size: 200 })
      const list = (data?.results ?? []).filter((u: any) => u.is_student)
      setStudents(list)
    }
  }
  
  const onSubmit = (data: JournalFormData) => {
    mutation.mutate(data)
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
          reset()
        }
      }} 
      title="Новая запись в журнал"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Ученик"
          {...register('student')}
          error={errors.student?.message}
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
        </Select>
        
        <Input
          type="date"
          label="Дата"
          {...register('date')}
          error={errors.date?.message}
        />
        
        <Select label="Посещаемость" {...register('attendance')}>
          <option value="true">Присутствовал</option>
          <option value="false">Отсутствовал</option>
        </Select>
        
        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            label="Техника"
            {...register('technique_score', { valueAsNumber: true })}
            error={errors.technique_score?.message}
            min={1}
            max={10}
          />
          
          <Input
            type="number"
            label="Ката"
            {...register('kata_score', { valueAsNumber: true })}
            error={errors.kata_score?.message}
            min={1}
            max={10}
          />
          
          <Input
            type="number"
            label="Кумите"
            {...register('kumite_score', { valueAsNumber: true })}
            error={errors.kumite_score?.message}
            min={1}
            max={10}
          />
        </div>
        
        <Textarea
          label="Заметки"
          {...register('notes')}
          error={errors.notes?.message}
          rows={4}
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