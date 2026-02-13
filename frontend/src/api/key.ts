import api from './index'
import { ApiResponse, KeyInfo, PaginatedResponse } from '@/types'

export const keyApi = {
  getList: async (): Promise<KeyInfo[]> => {
    const response = await api.get<ApiResponse<PaginatedResponse<KeyInfo>>>('/mapi/keys')
    return response.data.data.list || []
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse>(`/mapi/keys/${id}`)
  },
}
