export interface IAdminUserDto {
  address: string
  email: string
  fullName: string
  id: string
  index: string
  role: string
  tel: string
  telegramUsername: string
}

export interface IAdminUsersListDto {
  items: IAdminUserDto[]
  meta: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export interface IAdminUsersQuery {
  limit?: number
  page?: number
}
