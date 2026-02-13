import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserState, UserRole } from '@/types'

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      role: null,
      isAuthenticated: false,
      setToken: (token: string) => {
        localStorage.setItem('token', token)
        set({ token, isAuthenticated: true })
      },
      setUserInfo: (userId: string, username: string, role: UserRole) => {
        localStorage.setItem('userId', userId)
        localStorage.setItem('username', username)
        set({ userId, username, role })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        set({
          token: null,
          userId: null,
          username: null,
          role: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        token: state.token,
        userId: state.userId,
        username: state.username,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
