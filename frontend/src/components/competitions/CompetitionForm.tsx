import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { competitionsApi } from '../../api/competitions'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

const competitionSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  location: z.string().min(1, 'Введите место проведения'),
  date: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

type CompetitionFormData = z.infer<typeof competitionSchema>

interface CompetitionFormProps {
  open: boolean
  onClose: () => void
}

export default function CompetitionForm({ open, onClose }: CompetitionFormProps) {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      is_active: true,
    },
  })
  
  const mutation = useMutation({
    mutationFn: (data: CompetitionFormData) => competitionsApi.createCompetition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      onClose()
      reset()
    },
  })
  
  const onSubmit = (data: CompetitionFormData) => {
    mutation.mutate(data)
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }} 
      title="Новое соревнование"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Название"
          {...register('name')}
          error={errors.name?.message}
        />
        
        <Input
          label="Место проведения"
          {...register('location')}
          error={errors.location?.message}
        />
        
        <Input
          type="date"
          label="Дата"
          {...register('date')}
          error={errors.date?.message}
        />
        
        <Textarea
          label="Описание"
          {...register('description')}
          error={errors.description?.message}
          rows={3}
        />
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            {...register('is_active')}
            className="h-4 w-4 text-primary-600 rounded"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Соревнование активно
          </label>
        </div>
        
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