import type { IAdminPromoCodeDto } from './types'

export interface IAdminPromoCode {
  code: string
  createdAt: string
  discountPercent: number
  id: string
  minOrderAmount: number
  status: string
}

export const mapPromoCode = (dto: IAdminPromoCodeDto): IAdminPromoCode => ({
  code: dto.code,
  createdAt: dto.createdAt,
  discountPercent: dto.discountPercent,
  id: dto.id,
  minOrderAmount: dto.minOrderAmount,
  status: dto.status
})
