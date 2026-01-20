import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Calendar, BookOpen, Newspaper, UserCog, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const { user } = useAuth()
  const isAdmin = user?.is_staff
  const isCoach = user?.is_coach || isAdmin
  
  const baseNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
    { to: '/competitions', icon: Trophy, label: 'Соревнования' },
    { to: '/trainings', icon: Calendar, label: 'Тренировки' },
    { to: '/journal', icon: BookOpen, label: 'Журнал' },
  ]
  
  const coachNavItems = [
    { to: '/groups', icon: Users, label: 'Группы' },
  ]
  
  const adminNavItems = [
    { to: '/admin/news', icon: Newspaper, label: 'Новости' },
    { to: '/admin/users', icon: UserCog, label: 'Пользователи' },
  ]
  
  let navItems = [...baseNavItems]
  if (isCoach) {
    navItems = [...baseNavItems, ...coachNavItems]
  }
  if (isAdmin) {
    navItems = [...navItems, ...adminNavItems]
  }
  return (
    <aside className="w-72 bg-gradient-to-b from-white to-gray-50 border-r-2 border-primary-100 h-[calc(100vh-4rem)] shadow-elegant">
      <nav className="p-6">
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
            Навигация
          </h2>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200 transform scale-[1.02]'
                      : 'text-gray-700 hover:bg-red-50 hover:text-primary-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}