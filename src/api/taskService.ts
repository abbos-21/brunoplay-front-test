import apiClient from './axios'
import type { ApiResponse, TasksApiResponse } from './types'

export const taskService = {
  getTasks: async (): Promise<TasksApiResponse> => {
    const response = await apiClient.get<TasksApiResponse>('/task')
    return response.data
  },
  getAllTasks: async (): Promise<TasksApiResponse> => {
    const response = await apiClient.get<TasksApiResponse>('/task/all')
    return response.data
  },

  checkSubscription: async (channelUsername: string | null) => {
    if (channelUsername) {
      const response = await apiClient.post<ApiResponse<null>>('/task/check-subscription', {
        channelUsername,
      })
      return response.data
    }
  },
}
