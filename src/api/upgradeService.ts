import apiClient from './axios'
import type { UpgradeStatusApiResponse, UpgradeApiResponse } from './types'

export const upgradeService = {
  status: async (): Promise<UpgradeStatusApiResponse> => {
    const response = await apiClient.get<UpgradeStatusApiResponse>('/upgrades/status')
    return response.data
  },
  upgrade: async (name: string): Promise<UpgradeApiResponse> => {
    const response = await apiClient.post<UpgradeApiResponse>(`/upgrades/${name}`)
    return response.data
  },
}
