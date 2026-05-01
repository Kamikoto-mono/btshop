import { AxiosError } from 'axios'

import { publicApi } from '../config'
import { mapOrder } from './model'
import type { ICreateOrderRequestDto, IOrderDto } from './types'

const createOrder = async (payload: ICreateOrderRequestDto) => {
  const { data } = await publicApi.post<IOrderDto>('/orders', payload)
  return mapOrder(data)
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
  createOrder
}
