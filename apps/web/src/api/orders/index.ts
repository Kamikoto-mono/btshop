import { AxiosError } from 'axios'

import { privateApi, publicApi } from '../config'
import { mapOrder, mapValidatedPromoCode } from './model'
import type {
  ICreateOrderRequestDto,
  IOrderDto,
  IOrdersHistoryDto,
  IValidatePromoRequestDto,
  IValidatePromoResponseDto
} from './types'

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

const validatePromo = async (payload: IValidatePromoRequestDto) => {
  const { data } = await publicApi.post<IValidatePromoResponseDto>(
    '/orders/validate-promo',
    payload
  )

  return mapValidatedPromoCode(data)
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
  getHistory,
  validatePromo
}
