import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trainingsApi } from '../../api/trainings'
import Dialog from '../ui/Dialog'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface AttendanceModalProps {
  open: boolean
  onClose: () => void
  training: any
}

export default function AttendanceModal({ open, onClose, training }: AttendanceModalProps) {
  const [students, setStudents] = useState<any[]>([])
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: (data: any) => trainingsApi.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      onClose()
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Реализуйте логику отметки посещаемости
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose} title="Отметка посещаемости">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Ученик">
          <option value="">Выберите ученика</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
        </Select>
        
        <Select label="Статус">
          <option value="true">Присутствовал</option>
          <option value="false">Отсутствовал</option>
        </Select>
        
        <Textarea
          label="Заметки"
          placeholder="Дополнительная информация..."
          rows={3}
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