import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types/auth.types'
import { authApi } from '../api/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Logout error:', error)
          }
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },
      refetch: async () => {
        try {
          const user = await authApi.getMe()
          if (user) set({ user, isAuthenticated: true })
        } catch (_) {
        }
      },
    }),
    { name: 'auth' }
  )
)