import { create } from 'zustand'
import { api } from '../api'
import type {LoginCredentials, RegisterCredentials, User} from '../types/auth'
import { toast } from 'sonner'


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
      
      // 保存用户角色到本地存储
      localStorage.setItem('userRole', credentials.role)
      
      set({ user: response.data.user })
      
      toast.success("登录成功", {
        description: "正在跳转到首页...",
        duration: 3000,
      })
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