export interface ICreateOrderProductDto {
  productId: string
  quantity: number
}

export interface ICreateOrderRequestDto {
  address: string
  delivery: 'cdek' | 'почта'
  email: string
  fullName: string
  index: string
  promoCode?: string
  products: ICreateOrderProductDto[]
  tel: string
  telegramUsername: string
}

export interface IValidatePromoRequestDto {
  amount: number
  promoCode: string
}

export interface IValidatePromoResponseDto {
  finalAmount: number
  isValid: boolean
  originalAmount: number
  promoCode: string
  promoDiscount: number
}

export interface IOrderProductDto {
  name: string
  price: number
  productId: string
  quantity: number
}

export interface IOrderDto {
  address: string
  amount: number
  createdAt: string
  delivery: string
  email: string
  fullName: string
  id: string
  index: string
  products: IOrderProductDto[]
  status: string
  tel: string
  telegramUsername: string
  userId: string
}

export interface IOrdersHistoryDto {
  items: IOrderDto[]
  meta: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    total: number
    totalPages: number
  }
}
