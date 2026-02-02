import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { competitionsApi } from '../../api/competitions'
import { trainingsApi } from '../../api/trainings'
import { useAuth } from '../../hooks/useAuth'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import toast from 'react-hot-toast'
import { Users, Plus, Trash2 } from 'lucide-react'

const competitionSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  location: z.string().min(1, 'Введите место проведения'),
  date: z.string(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  visible_groups: z.array(z.number()).optional(),
})

type CompetitionFormData = z.infer<typeof competitionSchema>

interface CompetitionFormProps {
  open: boolean
  onClose: () => void
  competition?: any
}

interface CategoryDraft {
  id?: number
  name: string
  age_min?: number
  age_max?: number
}

export default function CompetitionForm({ open, onClose, competition }: CompetitionFormProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [categories, setCategories] = useState<CategoryDraft[]>([])
  const isEditMode = !!competition
  
  const { data: competitionData } = useQuery({
    queryKey: ['competition', competition?.id],
    queryFn: () => competitionsApi.getCompetition(competition!.id),
    enabled: isEditMode && !!competition?.id && open,
  })
  
  const { data: allGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: open,
  })
  
  const { data: existingCategories } = useQuery({
    queryKey: ['competition-categories', competition?.id],
    queryFn: () => competitionsApi.getCategories(competition!.id),
    enabled: isEditMode && !!competition?.id && open,
  })
  
  const groups = user?.is_staff 
    ? allGroups 
    : allGroups?.filter((group: any) => {
        const coachId = typeof group.coach === 'object' ? group.coach?.id : group.coach
        return coachId === user?.id
      })
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      is_active: true,
      visible_groups: [],
    },
  })
  
  useEffect(() => {
    if (competitionData && open) {
      const dateStr = competitionData.date ? new Date(competitionData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      setValue('name', competitionData.name || '')
      setValue('location', competitionData.location || '')
      setValue('date', dateStr)
      setValue('description', competitionData.description || '')
      setValue('is_active', competitionData.is_active ?? true)
      
      if (competitionData.visible_groups && Array.isArray(competitionData.visible_groups)) {
        const groupIds = competitionData.visible_groups.map((g: any) => typeof g === 'object' ? g.id : g)
        setSelectedGroups(groupIds)
      } else {
        setSelectedGroups([])
      }
    } else if (!competition && open) {
      reset({
        date: new Date().toISOString().split('T')[0],
        is_active: true,
        visible_groups: [],
      })
      setSelectedGroups([])
      setCategories([])
    }
  }, [competitionData, competition, open, setValue, reset])
  
  useEffect(() => {
    if (existingCategories && open && isEditMode) {
      setCategories(existingCategories.map((c: any) => ({
        id: c.id,
        name: c.name || '',
        age_min: c.age_min ?? undefined,
        age_max: c.age_max ?? undefined,
      })))
    }
  }, [existingCategories, open, isEditMode])
  
  const createMutation = useMutation({
    mutationFn: async (data: CompetitionFormData) => {
      const submitData: any = { ...data }
      if (selectedGroups.length > 0) submitData.visible_groups = selectedGroups
      const created = await competitionsApi.createCompetition(submitData)
      for (const cat of categories.filter(c => c.name.trim())) {
        await competitionsApi.createCategory({
          competition: created.id,
          name: cat.name.trim(),
          age_min: cat.age_min ?? undefined,
          age_max: cat.age_max ?? undefined,
        })
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      toast.success('Соревнование успешно создано')
      onClose()
      reset()
      setSelectedGroups([])
      setCategories([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при создании соревнования')
    },
  })
  
  const updateMutation = useMutation({
    mutationFn: async (data: CompetitionFormData) => {
      const submitData: any = { ...data }
      submitData.visible_groups = selectedGroups.length > 0 ? selectedGroups : []
      await competitionsApi.updateCompetition(competition!.id, submitData)
      const existingIds = new Set((existingCategories || []).map((c: any) => c.id))
      const currentIds = new Set(categories.filter(c => c.id).map(c => c.id))
      for (const id of existingIds) {
        if (!currentIds.has(id)) await competitionsApi.deleteCategory(id!)
      }
      for (const cat of categories.filter(c => c.name.trim())) {
        if (cat.id) {
          await competitionsApi.updateCategory(cat.id, {
            name: cat.name.trim(),
            age_min: cat.age_min ?? undefined,
            age_max: cat.age_max ?? undefined,
          })
        } else {
          await competitionsApi.createCategory({
            competition: competition!.id,
            name: cat.name.trim(),
            age_min: cat.age_min ?? undefined,
            age_max: cat.age_max ?? undefined,
          })
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitions'] })
      queryClient.invalidateQueries({ queryKey: ['competition', competition!.id] })
      queryClient.invalidateQueries({ queryKey: ['competition-categories', competition!.id] })
      toast.success('Соревнование успешно обновлено')
      onClose()
      reset()
      setSelectedGroups([])
      setCategories([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении соревнования')
    },
  })
  
  const mutation = isEditMode ? updateMutation : createMutation
  
  const onSubmit = (data: CompetitionFormData) => {
    mutation.mutate(data)
  }
  
  const toggleGroup = (groupId: number) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }
  
  const handleClose = () => {
    reset()
    setSelectedGroups([])
    setCategories([])
    onClose()
  }
  
  const addCategory = () => {
    setCategories(prev => [...prev, { name: '', age_min: undefined, age_max: undefined }])
  }
  const updateCategory = (index: number, field: keyof CategoryDraft, value: string | number | undefined) => {
    setCategories(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value === '' ? undefined : value }
      return next
    })
  }
  const removeCategory = (index: number) => {
    setCategories(prev => prev.filter((_, i) => i !== index))
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }} 
      title={isEditMode ? "Редактировать соревнование" : "Новое соревнование"}
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Возрастные категории (для фильтрации соревнований по возрасту участников)
          </label>
          <div className="space-y-2 mb-2">
            {categories.map((cat, index) => (
              <div key={cat.id ?? index} className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Название категории"
                  value={cat.name}
                  onChange={e => updateCategory(index, 'name', e.target.value)}
                  className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-200 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Возраст от"
                  min={0}
                  value={cat.age_min ?? ''}
                  onChange={e => updateCategory(index, 'age_min', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
                <span className="text-gray-500">—</span>
                <input
                  type="number"
                  placeholder="до"
                  min={0}
                  value={cat.age_max ?? ''}
                  onChange={e => updateCategory(index, 'age_max', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                  title="Удалить категорию"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={addCategory}>
            Добавить возрастную категорию
          </Button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Видимость для групп (оставьте пустым, чтобы было видно всем)
          </label>
          <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 space-y-2">
            {groups && groups.length > 0 ? (
              groups.map((group: any) => (
                <label
                  key={group.id}
                  className="flex items-center gap-2 p-2 hover:bg-red-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => toggleGroup(group.id)}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Нет доступных групп</p>
            )}
          </div>
          {selectedGroups.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Выбрано групп: {selectedGroups.length}
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {isEditMode ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
