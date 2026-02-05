import { useAuth } from '../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Settings, Menu } from 'lucide-react'
import Avatar from '../ui/Avatar'
import logo from '../../assets/puma-logo.webp'

type HeaderProps = { onMenuClick?: () => void }

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  return (
    <header className="bg-white border-b-2 border-primary-500 shadow-elegant overflow-x-hidden">
      <div className="px-2 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4">
        <div className="flex justify-between items-center gap-1 sm:gap-2 max-w-full">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 min-w-0 flex-1">
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-700 touch-manipulation shrink-0"
              aria-label="Открыть меню"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 min-w-0 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src={logo}
                  alt="Пума-Каратэ"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight truncate leading-tight">
                  Пума-Каратэ
                </h1>
                <p className="text-xs sm:text-sm font-medium text-red-700 hidden sm:block truncate">
                  Спортивный центр
                </p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
            <div className="h-8 sm:h-10 w-px bg-gray-300 hidden sm:block"></div>
            
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 bg-gray-50 px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-200">
              <Avatar
                src={user?.avatar || undefined}
                alt={`${user?.first_name} ${user?.last_name}`}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 shrink-0"
                fallback={`${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`}
              />
              <div className="hidden md:block min-w-0">
                <p className="font-semibold text-gray-900 text-xs lg:text-sm truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs font-medium text-primary-600 truncate">
                  {user?.is_staff ? 'Администратор' : user?.is_coach ? 'Тренер' : 'Ученик'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/settings')}
              className="p-1.5 sm:p-2 lg:p-2.5 hover:bg-gray-100 rounded-lg transition-colors group touch-manipulation shrink-0"
              title="Настройки"
            >
              <Settings className="w-4 h-4 text-gray-700 group-hover:text-primary-600 transition-colors" />
            </button>
            
            <button 
              onClick={() => logout()}
              className="p-1.5 sm:p-2 lg:px-5 lg:py-2.5 bg-white border-2 border-primary-500 text-primary-600 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-sm hover:shadow-md touch-manipulation shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs lg:text-sm">Выйти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
