import api from './index'
import { ApiResponse, SignRequest, SignResponse } from '@/types'

export const signApi = {
  sign: async (data: SignRequest): Promise<SignResponse> => {
    const response = await api.post<ApiResponse<SignResponse>>('/api/sign', data)
    return response.data.data
  },
}
