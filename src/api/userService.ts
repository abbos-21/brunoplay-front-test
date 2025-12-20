import apiClient from './axios'
import type { ApiResponse, UserDataResponse, InviteLinkResponse, ReferralsResponse } from './types'

export const userService = {
  getCurrentUser: async (): Promise<ApiResponse<UserDataResponse>> => {
    const response = await apiClient.get<ApiResponse<UserDataResponse>>('/user/me')
    return response.data
  },

  getReferralLink: async (): Promise<ApiResponse<InviteLinkResponse>> => {
    const response = await apiClient.get<ApiResponse<InviteLinkResponse>>('/user/invite-link')
    return response.data
  },

  getAllReferrals: async (): Promise<ApiResponse<ReferralsResponse>> => {
    const response = await apiClient.get<ApiResponse<ReferralsResponse>>('/user/referrals')
    return response.data
  },
}
