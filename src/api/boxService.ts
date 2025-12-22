import apiClient from './axios'
import type { ApiResponse, BoxResponse } from './types'

export const boxService = {
  getStatus: async (): Promise<ApiResponse<BoxResponse>> => {
    const response = await apiClient.get<ApiResponse<BoxResponse>>('/box/status')
    return response.data
  },

  payWithCoins: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/box/pay-with-coins')
    return response.data
  },
}
