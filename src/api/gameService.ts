import apiClient from './axios'
import type {
  GameStartMiningApiResponse,
  GameCollectCoinsApiResponse,
  GameSyncApiResponse,
  GameRecoveryApiResponse,
  GameSpinWheelSpinApiResponse,
  GameSpinWheelStatusApiResponse,
} from './types'

export const gameService = {
  mine: async (): Promise<GameStartMiningApiResponse> => {
    const response = await apiClient.post<GameStartMiningApiResponse>('/game/start-mining')
    return response.data
  },
  collect: async (): Promise<GameCollectCoinsApiResponse> => {
    const response = await apiClient.post<GameCollectCoinsApiResponse>('/game/collect-coins')
    return response.data
  },
  sync: async (): Promise<GameSyncApiResponse> => {
    const response = await apiClient.post<GameSyncApiResponse>('/game/sync')
    return response.data
  },
  recoverHealth: async (): Promise<GameRecoveryApiResponse> => {
    const response = await apiClient.post<GameRecoveryApiResponse>('/game/recover-health')
    return response.data
  },
  recoverEnergy: async (): Promise<GameRecoveryApiResponse> => {
    const response = await apiClient.post<GameRecoveryApiResponse>('/game/recover-energy')
    return response.data
  },

  recoverHealthByAd: async (): Promise<GameRecoveryApiResponse> => {
    const response = await apiClient.post<GameRecoveryApiResponse>('/game/recover-health-by-ad')
    return response.data
  },
  recoverEnergyByAd: async (): Promise<GameRecoveryApiResponse> => {
    const response = await apiClient.post<GameRecoveryApiResponse>('/game/recover-energy-by-ad')
    return response.data
  },

  getSpinWheelStatus: async (): Promise<GameSpinWheelStatusApiResponse> => {
    const response = await apiClient.get<GameSpinWheelStatusApiResponse>('/game/spin-wheel/status')
    return response.data
  },
  spinWheel: async (): Promise<GameSpinWheelSpinApiResponse> => {
    const response = await apiClient.post<GameSpinWheelSpinApiResponse>('/game/spin-wheel')
    return response.data
  },
}
