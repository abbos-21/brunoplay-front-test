import apiClient from './axios'
import type { ApiResponse, BlockListResponse } from './types'

export const blockListService = {
  getBlockList: async (): Promise<ApiResponse<BlockListResponse>> => {
    const response = await apiClient.get<ApiResponse<BlockListResponse>>('/block-list')
    return response.data
  },
}
