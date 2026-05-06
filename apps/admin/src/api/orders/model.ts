import type { IAdminOrderDto } from './types'

export interface IAdminOrder {
  address: string
  amount: number
  createdAt: string
  delivery: string
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
  trackNumber: string
  userId: string
}

export const mapOrder = (dto: IAdminOrderDto): IAdminOrder => ({
  address: dto.address,
  amount: dto.amount,
  createdAt: dto.createdAt,
  delivery: dto.delivery,
  email: dto.email,
  fullName: dto.fullName,
  id: dto.id,
  postalCode: String(dto.index),
  products: dto.products,
  status: dto.status,
  tel: dto.tel,
  telegramUsername: dto.telegramUsername,
  trackNumber: dto.trackNumber ?? '',
  userId: dto.userId
})
