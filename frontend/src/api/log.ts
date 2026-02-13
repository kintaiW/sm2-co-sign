import api from './index'
import { ApiResponse, AuditLog, PaginatedResponse } from '@/types'

export interface LogQueryParams {
  userId?: string
  action?: string
  limit?: number
  page?: number
  pageSize?: number
}

export const logApi = {
  getList: async (params?: LogQueryParams): Promise<AuditLog[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>('/mapi/logs', { params })
    return response.data.data.list || []
  },
}
