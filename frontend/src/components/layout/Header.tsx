import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import { LogOut, Bell, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Пума-Каратэ</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  )
}