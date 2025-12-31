import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, Calendar, BookOpen, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/competitions', icon: Trophy, label: 'Соревнования' },
  { to: '/trainings', icon: Calendar, label: 'Тренировки' },
  { to: '/journal', icon: BookOpen, label: 'Журнал' },
  { to: '/profile', icon: User, label: 'Профиль' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}