import { adminApi } from '../config'
import { mapOrder } from './model'
import type {
  IAdminOrderDto,
  IAdminOrdersListDto,
  IAdminOrdersQuery,
  IDeleteOrderResponseDto,
  IUpdateOrderDto
} from './types'

const getOrders = async (params?: IAdminOrdersQuery) => {
  const { data } = await adminApi.get<IAdminOrdersListDto>('/admin/orders', {
    params: {
      createdFrom: params?.createdFrom,
      createdTo: params?.createdTo,
      limit: params?.limit ?? 10,
      page: params?.page ?? 1,
      status: params?.status
    }
  })

  return {
    items: data.items.map(mapOrder),
    meta: data.meta
  }
}

const getOrdersByUserId = async (userId: string, params?: IAdminOrdersQuery) => {
  const { data } = await adminApi.get<IAdminOrdersListDto>(
    `/admin/orders/users/${userId}`,
    {
      params: {
        limit: params?.limit ?? 10,
        page: params?.page ?? 1
      }
    }
  )

  return {
    items: data.items.map(mapOrder),
    meta: data.meta
  }
}

const getOrderById = async (id: string) => {
  const { data } = await adminApi.get<IAdminOrderDto>(`/admin/orders/${id}`)
  return mapOrder(data)
}

const updateOrder = async (id: string, payload: IUpdateOrderDto) => {
  const { data } = await adminApi.patch<IAdminOrderDto>(`/admin/orders/${id}`, payload)
  return mapOrder(data)
}

const deleteOrder = async (id: string) => {
  const { data } = await adminApi.delete<IDeleteOrderResponseDto>(`/admin/orders/${id}`)
  return data
}

export const ordersApi = {
  deleteOrder,
  getOrderById,
  getOrdersByUserId,
  getOrders,
  updateOrder
}
