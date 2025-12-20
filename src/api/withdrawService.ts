import apiClient from './axios'
import type {
  ApiResponse,
  WithdrawalApiResponse,
  WithdrawalHistoryResponse,
  WithdrawalDataApiResponse,
} from './types'

export const withdrawService = {
  getWithdrawalData: async (): Promise<WithdrawalDataApiResponse> => {
    const response = await apiClient.get<WithdrawalDataApiResponse>('/withdrawals/data')
    return response.data
  },

  getWithdrawalHistory: async (): Promise<ApiResponse<WithdrawalHistoryResponse>> => {
    const response =
      await apiClient.get<ApiResponse<WithdrawalHistoryResponse>>('/withdrawals/history')
    return response.data
  },

  withdrawCoins: async (
    amountCoins: number | null,
    targetAddress: string | null,
  ): Promise<WithdrawalApiResponse | undefined> => {
    if (amountCoins && targetAddress) {
      const response = await apiClient.post<WithdrawalApiResponse>('/withdrawals', {
        amountCoins,
        targetAddress,
      })
      return response.data
    } else {
      console.log('Coins and address are possibly null')
    }
  },
}
