import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { journalApi } from '../../api/journal'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface TechniqueRecordFormProps {
  open: boolean
  onClose: () => void
}

export default function TechniqueRecordForm({ open, onClose }: TechniqueRecordFormProps) {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      technique: '',
      mastery_level: 1,
      notes: '',
    },
  })
  
  const mutation = useMutation({
    mutationFn: (data: any) => journalApi.createTechniqueRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technique-records'] })
      onClose()
      reset()
    },
  })
  
  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose} title="Новая запись техники">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Техника"
          {...register('technique')}
          placeholder="Например: Маэ-гери (Прямой удар ногой)"
        />
        
        <Input
          type="number"
          label="Уровень мастерства (1-10)"
          {...register('mastery_level', { valueAsNumber: true })}
          min={1}
          max={10}
        />
        
        <Textarea
          label="Заметки"
          {...register('notes')}
          rows={3}
          placeholder="Опишите технику и особенности выполнения..."
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