import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usersApi } from '../../api/users'
import { trainingsApi } from '../../api/trainings'
import { useAuth } from '../../hooks/useAuth'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import { Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'

const achievementSchema = z.object({
  user: z.number().min(1, 'Выберите ученика'),
  title: z.string().min(1, 'Введите название достижения'),
  description: z.string().min(1, 'Введите описание'),
  date: z.string().min(1, 'Выберите дату'),
  image: z.instanceof(File).optional().or(z.null()),
})

type AchievementFormData = z.infer<typeof achievementSchema>

interface AchievementFormProps {
  open: boolean
  onClose: () => void
  studentId?: number
}

export default function AchievementForm({ open, onClose, studentId }: AchievementFormProps) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  
  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => trainingsApi.getGroups(),
    enabled: open && isCoach,
  })
  
  const coachGroups = groups?.filter((group: any) => {
    const coachId = typeof group.coach === 'object' ? group.coach?.id : group.coach
    return coachId === user?.id
  }) || []
  
  const { data: groupStudents } = useQuery({
    queryKey: ['group-students', selectedGroup],
    queryFn: () => trainingsApi.getGroupStudents({ group: selectedGroup!, is_active: true }),
    enabled: !!selectedGroup && open,
  })
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      user: studentId || 0,
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    },
  })
  
  const watchedUser = watch('user')
  
  useEffect(() => {
    if (studentId && open) {
      setValue('user', studentId)
    }
  }, [studentId, open, setValue])
  
  const mutation = useMutation({
    mutationFn: (data: AchievementFormData) => {
      return usersApi.createAchievement({
        user: data.user,
        title: data.title,
        description: data.description,
        date: data.date,
        image: selectedImage || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] })
      toast.success('Достижение успешно добавлено')
      onClose()
      reset()
      setSelectedGroup(null)
      setImagePreview(null)
      setSelectedImage(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Ошибка при добавлении достижения')
    },
  })
  
  const onSubmit = (data: AchievementFormData) => {
    mutation.mutate(data)
  }
  
  const handleClose = () => {
    reset()
    setSelectedGroup(null)
    setImagePreview(null)
    setSelectedImage(null)
    onClose()
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5 МБ')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Выберите файл изображения')
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }
  
  const students = groupStudents || []
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }} 
      title="Добавить достижение"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isCoach && !studentId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Группа
              </label>
              <select
                value={selectedGroup || ''}
                onChange={(e) => {
                  const groupId = e.target.value ? Number(e.target.value) : null
                  setSelectedGroup(groupId)
                  setValue('user', 0)
                }}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="">Выберите группу</option>
                {coachGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedGroup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ученик *
                </label>
                <select
                  {...register('user', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value={0}>Выберите ученика</option>
                  {students.map((gs: any) => {
                    const student = typeof gs.student === 'object' ? gs.student : null
                    if (!student) return null
                    return (
                      <option key={gs.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    )
                  })}
                </select>
                {errors.user && (
                  <p className="text-red-600 text-sm mt-1">{errors.user.message}</p>
                )}
              </div>
            )}
          </>
        )}
        
        {studentId && (
          <input type="hidden" {...register('user', { valueAsNumber: true })} value={studentId} />
        )}
        
        <Input
          label="Название достижения"
          {...register('title')}
          error={errors.title?.message}
        />
        
        <Textarea
          label="Описание"
          {...register('description')}
          error={errors.description?.message}
          rows={4}
        />
        
        <Input
          type="date"
          label="Дата"
          {...register('date')}
          error={errors.date?.message}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фото (необязательно)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Нажмите для загрузки</span> или перетащите файл
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF до 5 МБ</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Добавить
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
