export interface ICreateOrderProductDto {
  productId: string
  quantity: number
}

export interface ICreateOrderRequestDto {
  address: string
  delivery: 'cdek' | 'pochta'
  email: string
  fullName: string
  index: string
  products: ICreateOrderProductDto[]
  tel: string
  telegramUsername: string
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
