import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { journalApi } from '../../api/journal'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface ProgressNoteFormProps {
  open: boolean
  onClose: () => void
}

export default function ProgressNoteForm({ open, onClose }: ProgressNoteFormProps) {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      category: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
    },
  })
  
  const mutation = useMutation({
    mutationFn: (data: any) => journalApi.createProgressNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-notes'] })
      onClose()
      reset()
    },
  })
  
  const onSubmit = (data: any) => {
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
      title="Новая заметка о прогрессе"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Категория"
          {...register('category')}
          placeholder="Например: Техника ударов"
        />
        
        <Input
          type="date"
          label="Дата"
          {...register('date')}
        />
        
        <Textarea
          label="Содержание"
          {...register('content')}
          rows={4}
          placeholder="Опишите прогресс ученика..."
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