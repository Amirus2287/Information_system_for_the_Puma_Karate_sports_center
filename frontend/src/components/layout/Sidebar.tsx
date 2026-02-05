import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Calendar, BookOpen, Newspaper, UserCog, Users, FileText, MapPin, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

type SidebarProps = { open?: boolean; onClose?: () => void }

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  
  const baseNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Главная' },
    { to: '/competitions', icon: Trophy, label: 'Соревнования' },
    { to: '/trainings', icon: Calendar, label: 'Тренировки' },
    { to: '/homeworks', icon: FileText, label: 'Домашние задания' },
    { to: '/journal', icon: BookOpen, label: 'Журнал' },
  ]
  
  const coachNavItems = [
    { to: '/groups', icon: Users, label: 'Группы' },
    { to: '/admin/users', icon: UserCog, label: 'Пользователи' },
  ]
  
  const adminNavItems = [
    { to: '/admin/news', icon: Newspaper, label: 'Новости' },
    { to: '/admin/gyms', icon: MapPin, label: 'Залы' },
  ]
  
  let navItems = [...baseNavItems]
  if (isCoach) {
    navItems = [...baseNavItems, ...coachNavItems]
  }
  if (isAdmin) {
    navItems = [...navItems, ...adminNavItems]
  }

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const navContent = (
    <nav className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-6">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4">
          Навигация
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-200 text-gray-600 touch-manipulation"
          aria-label="Закрыть меню"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 font-medium touch-manipulation min-h-[44px] ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-700 hover:bg-red-50 hover:text-primary-600'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Backdrop для мобильного меню */}
      <div
        role="presentation"
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      <aside
        className={`
          w-72 bg-gradient-to-b from-white to-gray-50 border-r-2 border-primary-100 shadow-elegant
          h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-out lg:transform-none
          pt-4 lg:pt-0
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {navContent}
      </aside>
    </>
  )
}