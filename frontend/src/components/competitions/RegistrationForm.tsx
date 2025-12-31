import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { competitionsApi } from '../../api/competitions'
import Dialog from '../ui/Dialog'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface RegistrationFormProps {
  open: boolean
  onClose: () => void
  competitionId: number
}

export default function RegistrationForm({ open, onClose, competitionId }: RegistrationFormProps) {
  const [selectedCategory, setSelectedCategory] = useState('')
  const queryClient = useQueryClient()
  
  const { data: categories } = useQuery({
    queryKey: ['competition-categories', competitionId],
    queryFn: () => competitionsApi.getCompetitions(),
  })
  
  const mutation = useMutation({
    mutationFn: () => competitionsApi.registerForCompetition({
      competition: competitionId,
      category: parseInt(selectedCategory),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      onClose()
    },
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCategory) {
      mutation.mutate()
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose} title="Регистрация на соревнование">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Категория"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Выберите категорию</option>
          {categories?.map((category: any) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={mutation.isPending} disabled={!selectedCategory}>
            Зарегистрироваться
          </Button>
        </div>
      </form>
    </Dialog>
  )
}