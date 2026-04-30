export interface IProductDto {
  categoryId: string
  categoryName: string
  desc: string
  f_price?: number | null
  id: string
  inStock: number
  name: string
  photos: string[]
  price: number
  subCategoryId: string
  subCategoryName: string
}

export interface IProductsListDto {
  items: IProductDto[]
  meta: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export interface IProductsQuery {
  categoryId?: string
  limit?: number
  maxPrice?: number
  minPrice?: number
  page?: number
  sort?: 'priceAsc' | 'priceDesc'
  subCategoryId?: string
}

export interface IRandomProductsQuery {
  limit?: number
}
