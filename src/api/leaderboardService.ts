import apiClient from './axios'
import type { ApiResponse, SeasonResponse, LeaderboardResponse } from './types'

export const leaderboardService = {
  getSeason: async (): Promise<ApiResponse<SeasonResponse>> => {
    const response = await apiClient.get<ApiResponse<SeasonResponse>>('/leaderboard/season/1')
    return response.data
  },

  getUsers: async (level: string | number): Promise<ApiResponse<LeaderboardResponse>> => {
    const response = await apiClient.get<ApiResponse<LeaderboardResponse>>(
      `/leaderboard/level/${level}`,
    )
    return response.data
  },
}
