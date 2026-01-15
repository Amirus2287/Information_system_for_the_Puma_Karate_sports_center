import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import Button from '../components/ui/Button'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  
  const handleLogin = async (data: any) => {
    try {
      await authApi.login(data.username, data.password)
      const user = await authApi.getMe()
      setUser(user)
      toast.success('Вход выполнен успешно!')
      navigate('/dashboard')
    } catch (error: any) {
      // Ошибка уже обработана в authApi.login
      console.error('Login error:', error)
    }
  }
  
  const handleRegister = async (data: any) => {
    try {
      const registerResponse = await authApi.register(data)
      
      // Если регистрация вернула пользователя, используем его
      if (registerResponse.user) {
        setUser(registerResponse.user)
        toast.success('Регистрация успешна!')
        navigate('/dashboard')
      } else {
        // Иначе пытаемся войти через JWT endpoint
        await handleLogin({ username: data.username, password: data.password })
      }
    } catch (error: any) {
      // Ошибка уже обработана в authApi.register
      console.error('Register error:', error)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Спортивный центр "Пума-Каратэ"
          </p>
        </div>
        
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={handleRegister} />
        )}
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </div>
      </div>
    </div>
  )
}