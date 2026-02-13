import api from './index'
import { ApiResponse, UserInfo, PaginatedResponse } from '@/types'

export const userApi = {
  getList: async (): Promise<UserInfo[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<UserInfo>>>('/mapi/users')
    return response.data.data.list || []
  },

  getById: async (id: string): Promise<UserInfo> => {
    const response = await api.get<ApiResponse<UserInfo>>(`/mapi/users/${id}`)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/mapi/users/${id}`)
  },

  updateStatus: async (id: string, status: number): Promise<void> => {
    await api.put<ApiResponse>(`/mapi/users/${id}/status`, { status })
  },
}
