export interface IAdminOrderProductDto {
  name: string
  price: number
  productId: string
  quantity: number
}

export interface IAdminOrderDto {
  address: string
  amount: number
  createdAt: string
  delivery: string
  email: string
  fullName: string
  id: string
  index: number
  products: IAdminOrderProductDto[]
  status: string
  tel: string
  telegramUsername: string
  userId: string
}

export interface IAdminOrdersListDto {
  items: IAdminOrderDto[]
  meta: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export interface IAdminOrdersQuery {
  createdFrom?: string
  createdTo?: string
  limit?: number
  page?: number
  status?: string
}

export interface IUpdateOrderDto {
  address: string
  delivery: string
  email: string
  fullName: string
  index: number
  products: Array<{
    productId: string
    quantity: number
  }>
  status: string
  tel: string
  telegramUsername: string
}

export interface IDeleteOrderResponseDto {
  message: string
}
