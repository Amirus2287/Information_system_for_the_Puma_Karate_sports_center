import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  return (
    <header className="bg-white border-b-2 border-primary-500 shadow-elegant">
      <div className="px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="/logo.png" 
                alt="Пума-Каратэ" 
                className="w-14 h-14 rounded-lg shadow-lg object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Пума-Каратэ
              </h1>
              <p className="text-sm font-medium text-primary-600">
                Информационная система спортивного центра
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="h-10 w-px bg-gray-300"></div>
            
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="font-semibold text-gray-900 text-sm">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs font-medium text-primary-600">
                  {user?.is_staff ? 'Администратор' : user?.is_coach ? 'Тренер' : 'Ученик'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Настройки"
            >
              <Settings className="w-4 h-4 text-gray-700 group-hover:text-primary-600 transition-colors" />
            </button>
            
            <button 
              onClick={() => logout()}
              className="px-5 py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}