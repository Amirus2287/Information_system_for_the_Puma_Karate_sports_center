import { useAuth } from '../../hooks/useAuth'
import { Bell, User, LogOut, Settings } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ПК</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Панель управления</h1>
              <p className="text-sm text-gray-600">Спортивный центр "Пума-Каратэ"</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="h-8 w-px bg-gray-200"></div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-600">
                  {user?.is_coach ? 'Тренер' : 'Ученик'}
                </p>
              </div>
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            
            <button 
              onClick={logout}
              className="px-4 py-2 border border-red-200 text-primary-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}