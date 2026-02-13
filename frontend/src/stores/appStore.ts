import { create } from 'zustand'
import { AppState } from '@/types'

export const useAppStore = create<AppState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => set({ collapsed }),
  theme: 'light',
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
}))
