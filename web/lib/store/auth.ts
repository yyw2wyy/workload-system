import { create } from 'zustand'
import { api } from '../api'
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth'

interface User {
  id: number
  username: string
  email: string
  role: 'student' | 'mentor' | 'teacher'
}

interface AuthState {
  user: User | null
  token: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterCredentials) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  login: async (credentials) => {
    try {
      const response = await api.post('/user/login/', credentials)
      const { user } = response.data
      set({ user, token: null }) // 由于使用session认证，不需要token
    } catch (error: any) {
      throw error
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/user/register/', data)
      const { user } = response.data
      set({ user, token: null })
    } catch (error: any) {
      throw error
    }
  },

  logout: () => {
    set({ token: null, user: null })
  },
})) 