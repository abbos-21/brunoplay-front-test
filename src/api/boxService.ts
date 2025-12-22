import apiClient from './axios'
import type { ApiResponse, BoxResponse, BoxRewardResponse } from './types'

export const boxService = {
  getStatus: async (): Promise<ApiResponse<BoxResponse>> => {
    const response = await apiClient.get<ApiResponse<BoxResponse>>('/box/status')
    return response.data
  },

  payWithCoins: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/box/pay-with-coins')
    return response.data
  },

  getRewards: async (): Promise<ApiResponse<BoxRewardResponse>> => {
    const response = await apiClient.post<ApiResponse<BoxRewardResponse>>('/box/get-rewards')
    return response.data
  },

  rewardUser: async (payload: { rewardIds: number[] }): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/box/reward-user', payload)
    return response.data
  },
}
