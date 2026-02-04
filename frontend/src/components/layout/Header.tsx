import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, Menu } from 'lucide-react'
import Avatar from '../ui/Avatar'

type HeaderProps = { onMenuClick?: () => void }

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  return (
    <header className="bg-white border-b-2 border-primary-500 shadow-elegant">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700 touch-manipulation"
              aria-label="Открыть меню"
            >
              <Menu className="w-6 h-6 shrink-0" />
            </button>
            <img
              src="/logo.png"
              alt=""
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg shadow-lg object-contain shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                Пума-Каратэ
              </h1>
              <p className="text-xs sm:text-sm font-medium text-primary-600 hidden sm:block">
                Информационная система спортивного центра
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            <div className="h-8 sm:h-10 w-px bg-gray-300 hidden sm:block"></div>
            
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-2 sm:px-4 py-2 rounded-lg border border-gray-200">
              <Avatar
                src={user?.avatar || undefined}
                alt={`${user?.first_name} ${user?.last_name}`}
                className="w-8 h-8 sm:w-10 sm:h-10 shrink-0"
                fallback={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
              />
              <div className="hidden md:block">
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
              className="p-2 sm:p-2.5 hover:bg-gray-100 rounded-lg transition-colors group touch-manipulation"
              title="Настройки"
            >
              <Settings className="w-4 h-4 text-gray-700 group-hover:text-primary-600 transition-colors" />
            </button>
            
            <button 
              onClick={() => logout()}
              className="p-2 sm:px-5 sm:py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md touch-manipulation"
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