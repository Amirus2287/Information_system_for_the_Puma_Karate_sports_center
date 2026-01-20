import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'

export default function ProtectedRoute() {
  const { isAuthenticated, setUser } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await authApi.getMe()
        setUser(user)
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Session check failed:', error)
        }
      } finally {
        setIsChecking(false)
      }
    }
    
    checkSession()
  }, [setUser])
  
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />
  }
  
  return <Outlet />
}