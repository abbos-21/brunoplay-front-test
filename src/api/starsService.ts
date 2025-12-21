import apiClient from './axios'
import type { ApiResponse, InvoiceLinkResponse } from './types'

export const starsService = {
  getInvoiceLink: async (): Promise<ApiResponse<InvoiceLinkResponse>> => {
    const response = await apiClient.post<ApiResponse<InvoiceLinkResponse>>('/stars/create-invoice')
    return response.data
  },
}
