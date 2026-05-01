import { AxiosError } from 'axios'

import { privateApi, publicApi } from '../config'
import { mapOrder } from './model'
import type { ICreateOrderRequestDto, IOrderDto, IOrdersHistoryDto } from './types'

const createOrder = async (payload: ICreateOrderRequestDto) => {
  const { data } = await publicApi.post<IOrderDto>('/orders', payload)
  return mapOrder(data)
}

const getHistory = async (page = 1, limit = 15) => {
  const { data } = await privateApi.get<IOrdersHistoryDto>('/orders/history', {
    params: {
      limit,
      page
    }
  })

  return {
    items: data.items.map(mapOrder),
    meta: data.meta
  }
}

export const getOrderApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof AxiosError) {
    const responseMessage = (error.response?.data as { message?: string } | undefined)?.message

    if (responseMessage) {
      return responseMessage
    }
  }

  return fallbackMessage
}

export const ordersApi = {
  createOrder,
  getHistory
}
