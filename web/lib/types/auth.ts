export type UserRole = 'student' | 'mentor' | 'teacher'

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