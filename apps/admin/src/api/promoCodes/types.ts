export interface IAdminPromoCodeDto {
  code: string
  createdAt: string
  discountPercent: number
  id: string
  minOrderAmount: number
  status: string
}

export type IAdminPromoCodesListDto = IAdminPromoCodeDto[]

export interface IUpsertPromoCodeDto {
  code: string
  discountPercent: number
  minOrderAmount: number
  status: string
}

export interface IDeletePromoCodeResponseDto {
  message: string
}
