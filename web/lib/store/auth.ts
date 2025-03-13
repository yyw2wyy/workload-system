import { create } from 'zustand'
import { api } from '../api'
import type { LoginCredentials, RegisterCredentials } from '../types/auth'

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterCredentials) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
  changePassword: (data: { currentPassword: string; newPassword: string; confirm_password: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,

  login: async (credentials) => {
    try {
      const response = await api.post('/user/login/', credentials)
      const { user } = response.data
      // 确保所有必要的字段都存在
      const userData: User = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role || '教师', // 设置默认角色
      }
      set({ user: userData })
    } catch (error: any) {
      throw error
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/user/register/', data)
      const { user } = response.data
      const userData: User = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role || '教师',
      }
      set({ user: userData })
    } catch (error: any) {
      throw error
    }
  },

  logout: () => {
    set({ token: null, user: null })
  },

  updateUser: async (data) => {
    try {
      const response = await api.put('/user/update/', data)
      const { user } = response.data
      set((state) => ({
        user: state.user ? { ...state.user, ...user } : null,
      }))
      return user
    } catch (error) {
      throw error
    }
  },

  changePassword: async (data) => {
    try {
      const requestData = {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirm_password
      }
      await api.post('/user/change-password/', requestData)
    } catch (error) {
      throw error
    }
  },
})) 