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

const PRODUCT_IMAGES_ORIGIN =
  'https://battletoads.ams3.digitaloceanspaces.com'

const PRODUCT_IMAGES_CDN =
  'https://battletoads.ams3.cdn.digitaloceanspaces.com'

const normalizeProductPhoto = (photo: string) =>
  photo.startsWith(PRODUCT_IMAGES_ORIGIN)
    ? `${PRODUCT_IMAGES_CDN}${photo.slice(PRODUCT_IMAGES_ORIGIN.length)}`
    : photo

export const mapProduct = (dto: IProductDto): IProduct => ({
  brand: dto.name.split(' ')[0] ?? dto.categoryName,
  categoryId: dto.categoryId,
  categoryName: dto.categoryName,
  description: dto.desc,
  f_price: dto.f_price ?? null,
  id: dto.id,
  inStock: dto.inStock,
  name: dto.name,
  photo: dto.photos[0] ? normalizeProductPhoto(dto.photos[0]) : null,
  photos: dto.photos.map(normalizeProductPhoto),
  price: dto.price,
  subCategoryId: dto.subCategoryId,
  subCategoryName: dto.subCategoryName
})
