import api from './index'
import { ApiResponse, LoginRequest, LoginResponse, UserInfo } from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/login', data)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await api.post<ApiResponse>('/api/logout')
  },

  getUserInfo: async (): Promise<UserInfo> => {
    const response = await api.get<ApiResponse<UserInfo>>('/api/user/info')
    return response.data.data
  },
}
