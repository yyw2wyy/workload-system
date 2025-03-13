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
}

export interface RegisterCredentials extends LoginCredentials {
  email: string
  role: UserRole
}

export interface AuthResponse {
  message: string
  user: User
} 