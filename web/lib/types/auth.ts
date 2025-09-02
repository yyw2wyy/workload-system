// 角色映射表
export const roleMap: Record<string, string> = {
  student: '学生',
  mentor: '导师',
  teacher: '老师',
} as const

export const roleOptions = [
  { value: "student", label: "学生" },
  { value: "mentor", label: "导师" },
  { value: "teacher", label: "老师" },
] as const

// 类型定义
export type UserRole = keyof typeof roleMap

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
}

export interface LoginCredentials {
  username: string
  password: string
  role: UserRole
}

export interface RegisterCredentials {
  username: string
  password: string
  password2: string
  email: string
}

export interface AuthResponse {
  message: string
  user: User
}