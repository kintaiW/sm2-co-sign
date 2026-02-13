import api from './index'
import { ApiResponse, HealthCheck } from '@/types'

export interface SystemStatsResponse {
  users: number
  keys: number
  sessions: number
}

export const monitorApi = {
  getStats: async (): Promise<SystemStatsResponse> => {
    const response = await api.get<ApiResponse<SystemStatsResponse>>('/mapi/stats')
    return response.data.data
  },

  getHealth: async (): Promise<HealthCheck> => {
    const response = await api.get<ApiResponse<HealthCheck>>('/mapi/health')
    return response.data.data
  },
}
