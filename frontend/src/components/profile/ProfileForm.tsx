import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usersApi } from '../../api/users'
import { useAuth } from '../../hooks/useAuth'
import Dialog from '../ui/Dialog'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'
import { User, Mail, Phone, MapPin, Award, Calendar, Users, Heart, Image as ImageIcon, X, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Введите имя'),
  last_name: z.string().min(1, 'Введите фамилию'),
  patronymic: z.string().optional(),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  grade: z.string().optional(),
  years_of_practice: z.number().min(0).optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  medical_notes: z.string().optional(),
  medical_insurance: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  open: boolean
  onClose: () => void
}

export default function ProfileForm({ open, onClose }: ProfileFormProps) {
  const queryClient = useQueryClient()
  const { user, refetch: refetchAuth } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null | undefined>(undefined)
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const profiles = await usersApi.getProfile(user!.id)
        return Array.isArray(profiles) ? profiles[0] : profiles
      } catch (error) {
        return null
      }
    },
    enabled: !!user && open,
  })
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      patronymic: '',
      email: '',
      phone: '',
      date_of_birth: '',
      bio: '',
      location: '',
      grade: '',
      years_of_practice: 0,
      parent_name: '',
      parent_phone: '',
      medical_notes: '',
      medical_insurance: '',
    },
  })
  
  useEffect(() => {
    if (user && open) {
      setValue('first_name', user.first_name || '')
      setValue('last_name', user.last_name || '')
      setValue('patronymic', (user as any).patronymic || '')
      setValue('email', user.email || '')
      setValue('phone', user.phone || '')
      const dob = user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : ''
      setValue('date_of_birth', dob)
      
      // Устанавливаем текущую аватарку
      if (user.avatar) {
        setAvatarPreview(user.avatar)
      } else {
        setAvatarPreview(null)
      }
      setSelectedAvatar(undefined)
    }
  }, [user, open, setValue])
  
  useEffect(() => {
    if (profile && open) {
      setValue('bio', profile.bio || '')
      setValue('location', profile.location || '')
      setValue('grade', profile.grade || '')
      setValue('years_of_practice', profile.years_of_practice || 0)
      setValue('parent_name', profile.parent_name || '')
      setValue('parent_phone', profile.parent_phone || '')
      setValue('medical_notes', profile.medical_notes || '')
      setValue('medical_insurance', (profile as any).medical_insurance || '')
    }
  }, [profile, open, setValue])
  
  const updateUserMutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => {
      const updateData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        patronymic: data.patronymic || '',
        email: data.email,
        phone: data.phone,
        date_of_birth: data.date_of_birth || null,
      }
      
      // Отправляем аватарку только если она была изменена
      if (selectedAvatar !== undefined) {
        updateData.avatar = selectedAvatar
      }
      
      return usersApi.updateUser(user!.id, updateData)
    },
  })
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileFormData>) => {
      const profileData = {
        bio: data.bio || '',
        location: data.location || '',
        grade: data.grade || '',
        years_of_practice: data.years_of_practice || 0,
        parent_name: data.parent_name || '',
        parent_phone: data.parent_phone || '',
        medical_notes: data.medical_notes || '',
        medical_insurance: data.medical_insurance || '',
      }
      
      if (profile?.id) {
        return usersApi.updateProfile(profile.id, profileData)
      } else {
        return usersApi.createProfile({ ...profileData, user: user!.id })
      }
    },
  })
  
  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateUserMutation.mutateAsync(data)
      await updateProfileMutation.mutateAsync(data)
      
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['user', user?.id] })
      if (typeof refetchAuth === 'function') {
        await refetchAuth().catch(() => {})
      }
      
      toast.success('Профиль успешно обновлен')
      setAvatarPreview(null)
      setSelectedAvatar(undefined)
      onClose()
      reset()
    } catch (error: any) {
      const message = error?.response?.data?.detail
        || (typeof error?.response?.data === 'object' && error?.response?.data
          ? Object.values(error.response.data).flat().filter(Boolean)[0] as string
          : null)
        || 'Ошибка при обновлении профиля'
      toast.error(typeof message === 'string' ? message : 'Ошибка при обновлении профиля')
    }
  }
  
  const handleClose = () => {
    reset()
    setAvatarPreview(null)
    setSelectedAvatar(undefined)
    onClose()
  }
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setSelectedAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview(null)
  }
  
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()} title="Редактировать профиль">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Dialog>
    )
  }
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }} 
      title="Редактировать профиль"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-y-auto pr-2">
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-primary-50 to-red-50 rounded-xl p-4 border-2 border-primary-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Основная информация</h3>
            </div>
            
            <div className="flex items-center gap-6 mb-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <Avatar
                      src={avatarPreview}
                      alt={`${user?.first_name} ${user?.last_name}`}
                      className="w-24 h-24"
                      fallback={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                      title="Удалить аватарку"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Аватарка
                </label>
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors w-fit">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {avatarPreview ? 'Изменить фото' : 'Загрузить фото'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF до 5 МБ</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Имя"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label="Фамилия"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
            <Input
              label="Отчество"
              {...register('patronymic')}
              error={errors.patronymic?.message}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Дата рождения"
                type="date"
                {...register('date_of_birth')}
                error={errors.date_of_birth?.message}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Контактная информация</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
              
              <div className="grid grid-cols-2 gap-4">
        <Input
          label="Телефон"
          {...register('phone')}
          error={errors.phone?.message}
        />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-green-600 p-2 rounded-lg">
                <Award className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Спортивная информация</h3>
            </div>
            
            <div className="space-y-4">
              <Textarea
                label="Биография"
                {...register('bio')}
                error={errors.bio?.message}
                rows={3}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Город"
                  {...register('location')}
                  error={errors.location?.message}
                />
                
                <Input
                  label="Разряд/Кю/Дан"
                  {...register('grade')}
                  error={errors.grade?.message}
                />
              </div>
              
              <Input
                label="Лет занятий каратэ"
                type="number"
                {...register('years_of_practice', { valueAsNumber: true })}
                error={errors.years_of_practice?.message}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Контактная информация родителей</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Имя родителя"
                {...register('parent_name')}
                error={errors.parent_name?.message}
              />
              
              <Input
                label="Телефон родителя"
                {...register('parent_phone')}
                error={errors.parent_phone?.message}
              />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-600 p-2 rounded-lg">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Медицинские показания</h3>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Мед. страховка"
                {...register('medical_insurance')}
                error={errors.medical_insurance?.message}
                placeholder="Номер полиса"
              />
              <Textarea
                label="Медицинские показания"
                {...register('medical_notes')}
                error={errors.medical_notes?.message}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 sticky bottom-0 bg-white">
          <Button type="button" variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            type="submit" 
            loading={updateUserMutation.isPending || updateProfileMutation.isPending}
          >
            Сохранить изменения
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
