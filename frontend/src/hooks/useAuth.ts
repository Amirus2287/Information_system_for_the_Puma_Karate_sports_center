import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/auth.types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth' }
  )
)