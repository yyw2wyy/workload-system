import { create } from 'zustand'
import { api } from '../api'

export interface User {
  id: number
  username: string
  email: string
  role: 'student' | 'mentor' | 'teacher'
}

interface LoginCredentials {
  username: string
  password: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null })
      const response = await api.post('/user/login/', credentials)
      set({
        user: response.data.user,
        isAuthenticated: true,
        error: null,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '登录失败',
        isAuthenticated: false,
      })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      await api.post('/user/logout/')
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || '登出失败',
      })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await api.get('/user/me/')
      set({
        user: response.data,
        isAuthenticated: true,
        error: null,
      })
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      })
    } finally {
      set({ isLoading: false })
    }
  },
})) 