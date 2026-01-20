import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface TrainingFormProps {
  open: boolean
  onClose: () => void
  initialDate?: string
  initialTime?: string
}

export default function TrainingForm({ open, onClose, initialDate, initialTime }: TrainingFormProps) {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      group: '',
      date: initialDate || new Date().toISOString().split('T')[0],
      time: initialTime || '18:00',
      topic: '',
    },
  })
  
  React.useEffect(() => {
    if (initialDate || initialTime) {
      reset({
        group: '',
        date: initialDate || new Date().toISOString().split('T')[0],
        time: initialTime || '18:00',
        topic: '',
      })
    }
  }, [initialDate, initialTime, reset])
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
  })
  
  const mutation = useMutation({
    mutationFn: (data: any) => trainingsApi.createTraining(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      onClose()
      reset()
    },
  })
  
  const onSubmit = (data: any) => {
    mutation.mutate(data)
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose} title="Новая тренировка">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Группа" {...register('group')}>
          <option value="">Выберите группу</option>
          {groups?.map((group: any) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        
        <Input
          type="date"
          label="Дата"
          {...register('date')}
        />
        
        <Input
          type="time"
          label="Время"
          {...register('time')}
        />
        
        <Input
          label="Тема тренировки"
          {...register('topic')}
          placeholder="Например: Основы стойки и перемещения"
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