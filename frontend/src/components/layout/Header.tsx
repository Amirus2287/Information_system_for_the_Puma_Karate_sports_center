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
            <Link
              to="/dashboard"
              className="flex items-center gap-3 sm:gap-4 min-w-0 hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border-2 border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src={logo}
                  alt="Пума-Каратэ"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate leading-tight">
                  Пума-Каратэ
                </h1>
                <p className="text-xs sm:text-sm font-medium text-red-700 hidden sm:block truncate">
                  Спортивный центр
                </p>
              </div>
            </Link>
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
