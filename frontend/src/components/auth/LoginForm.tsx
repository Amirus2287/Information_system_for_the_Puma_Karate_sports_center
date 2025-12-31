import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../ui/Input'
import Button from '../ui/Button'

const loginSchema = z.object({
  username: z.string().min(1, 'Введите имя пользователя'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Имя пользователя"
        {...register('username')}
        error={errors.username?.message}
      />
      
      <Input
        type="password"
        label="Пароль"
        {...register('password')}
        error={errors.password?.message}
      />
      
      <Button type="submit" loading={isSubmitting} className="w-full">
        Войти
      </Button>
    </form>
  )
}