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
      console.error('Login error:', error)
    }
  }
  
  const handleRegister = async (data: any) => {
    try {
      const registerResponse = await authApi.register(data)
      
      if (registerResponse.user) {
        setUser(registerResponse.user)
        toast.success('Регистрация успешна!')
        navigate('/dashboard')
      } else {
        const user = await authApi.getMe()
        setUser(user)
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Register error:', error)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23dc2626%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
      </div>
      
      <div className="relative max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-elegant-lg border-2 border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">ПК</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <p className="text-gray-600 font-medium">
            Спортивный центр "Пума-Каратэ"
          </p>
          <div className="mt-4 h-1 w-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto"></div>
        </div>
        
        {isLogin ? (
          <LoginForm onSubmit={handleLogin} />
        ) : (
          <RegisterForm onSubmit={handleRegister} />
        )}
        
        <div className="text-center pt-4 border-t border-gray-200">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </Button>
        </div>
      </div>
    </div>
  )
}