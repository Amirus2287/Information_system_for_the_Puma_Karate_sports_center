import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../ui/Input'
import Button from '../ui/Button'

const registerSchema = z.object({
  username: z.string().min(3, 'Минимум 3 символа'),
  password: z.string().min(6, 'Минимум 6 символов'),
  password_confirm: z.string().min(6, 'Минимум 6 символов'),
  first_name: z.string().min(1, 'Введите имя'),
  last_name: z.string().min(1, 'Введите фамилию'),
  email: z.string().email('Введите корректный email'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Пароли не совпадают',
  path: ['password_confirm'],
})

type RegisterFormData = z.infer<typeof registerSchema>

type RegisterSubmitData = Omit<RegisterFormData, 'password_confirm'>

interface RegisterFormProps {
  onSubmit: (data: RegisterSubmitData) => void
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })
  
  const handleFormSubmit = (data: RegisterFormData) => {
    const { password_confirm, ...submitData } = data
    onSubmit(submitData)
  }
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
        label="Имя пользователя"
        {...register('username')}
        error={errors.username?.message}
      />
      
      <Input
        type="email"
        label="Email"
        {...register('email')}
        error={errors.email?.message}
      />
      
      <Input
        label="Телефон"
        {...register('phone')}
        error={errors.phone?.message}
      />
      
      <Input
        type="password"
        label="Пароль"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <Input
        type="password"
        label="Повторение пароля"
        {...register('password_confirm')}
        error={errors.password_confirm?.message}
      />
      
      <Button type="submit" loading={isSubmitting} className="w-full">
        Зарегистрироваться
      </Button>
    </form>
  )
}
