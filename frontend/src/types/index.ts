export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface UserInfo {
  id: string
  username: string
  publicKey: string
  status: number
  createdAt: string
}

export interface KeyInfo {
  id: string
  userId: string
  publicKey: string
  status: number
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  detail: string
  ipAddress: string
  createdAt: string
}

export interface SystemStats {
  userCount: number
  keyCount: number
  activeSessions: number
  uptime: string
}

export interface HealthCheck {
  status: string
  timestamp: string
}

export interface LoginRequest {
  username: string
  password: string
  signature?: string
}

export interface LoginResponse {
  token: string
  userId: string
  expiresAt: string
}

export interface SignRequest {
  q1: string
  e: string
}

export interface SignResponse {
  r: string
  s2: string
  s3: string
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type UserRole = 'super_admin' | 'ops_admin' | 'security_admin' | 'user'

export interface UserState {
  token: string | null
  userId: string | null
  username: string | null
  role: UserRole | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  setUserInfo: (userId: string, username: string, role: UserRole) => void
  logout: () => void
}

export interface AppState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
}
