import type { IProductDto } from './types'

export interface IProduct {
  brand: string
  categoryId: string
  categoryName: string
  description: string
  f_price?: number | null
  id: string
  inStock: number
  name: string
  photo: string | null
  photos: string[]
  price: number
  subCategoryId: string
  subCategoryName: string
}

export const mapProduct = (dto: IProductDto): IProduct => ({
  brand: dto.name.split(' ')[0] ?? dto.categoryName,
  categoryId: dto.categoryId,
  categoryName: dto.categoryName,
  description: dto.desc,
  f_price: dto.f_price ?? null,
  id: dto.id,
  inStock: dto.inStock,
  name: dto.name,
  photo: dto.photos[0] ?? null,
  photos: dto.photos,
  price: dto.price,
  subCategoryId: dto.subCategoryId,
  subCategoryName: dto.subCategoryName
})
