import type { IStoredOrder } from '@/mocks'

import type { IOrderDto } from './types'

export interface IOrder {
  address: string
  amount: number
  createdAt: string
  email: string
  fullName: string
  id: string
  postalCode: string
  products: Array<{
    name: string
    price: number
    productId: string
    quantity: number
  }>
  status: string
  tel: string
  telegramUsername: string
  userId: string
}

export const mapOrder = (dto: IOrderDto): IOrder => ({
  address: dto.address,
  amount: dto.amount,
  createdAt: dto.createdAt,
  email: dto.email,
  fullName: dto.fullName,
  id: dto.id,
  postalCode: dto.index,
  products: dto.products,
  status: dto.status,
  tel: dto.tel,
  telegramUsername: dto.telegramUsername,
  userId: dto.userId
})

export const mapOrderToStoredOrder = (order: IOrder): IStoredOrder => ({
  address: order.address,
  createdAt: order.createdAt,
  customer: order.fullName,
  email: order.email,
  id: order.id,
  items: order.products.map((product) => ({
    id: product.productId,
    name: product.name,
    price: product.price,
    quantity: product.quantity
  })),
  phone: order.tel,
  postalCode: order.postalCode,
  status: order.status,
  telegram: order.telegramUsername,
  totalPrice: order.amount
})
