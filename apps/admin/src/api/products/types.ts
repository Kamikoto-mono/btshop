export interface IAdminProductDto {
  categoryId?: string | null
  c_price: number
  desc: string
  f_price?: number | null
  id: string
  inStock: number
  name: string
  photos: string[]
  price: number
  subCategory?: {
    categoryId?: string
    id: string
    name: string
    subCategoryId?: string | null
  } | null
  subCategoryId?: string | null
}

export interface IAdminProductsListDto {
  items: IAdminProductDto[]
  meta: {
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
    page: number
    total: number
    totalPages: number
  }
}

export interface IAdminProductsListResponse {
  items: IAdminProductDto[]
  meta: IAdminProductsListDto['meta']
}

export interface IAdminProductsQuery {
  categoryId?: string
  limit?: number
  maxPrice?: number
  minPrice?: number
  page?: number
  sort?: 'priceAsc' | 'priceDesc'
  subCategoryId?: string
}

interface IProductCategoryPayload {
  categoryId?: string
  subCategoryId?: string
}

export interface ICreateProductDto extends IProductCategoryPayload {
  c_price: number
  desc: string
  f_price?: number
  inStock: number
  name: string
  photos: File[]
  price: number
}

export interface IUpdateProductDto extends IProductCategoryPayload {
  c_price: number
  desc: string
  f_price?: number
  inStock: number
  name: string
  newPhotos?: File[]
  photos?: string[]
  price: number
}

export interface IDeleteProductResponseDto {
  message: string
}
