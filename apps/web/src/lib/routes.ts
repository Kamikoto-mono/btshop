import type { IProduct } from '@/api/products/model'

export const getCategoryHref = (categorySlug: string) => `/${categorySlug}`

export const getCompoundHref = (categorySlug: string, compoundSlug: string) =>
  `/${categorySlug}/${compoundSlug}`

export const getLineHref = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string
) => `/${categorySlug}/${compoundSlug}/${lineSlug}`

export const getProductHref = (product: IProduct) => `/products/${product.id}`

export const getMarketHref = (params?: {
  categoryId?: string
  maxPrice?: number
  minPrice?: number
  q?: string
  sort?: 'priceAsc' | 'priceDesc'
  subCategoryId?: string
}) => {
  const searchParams = new URLSearchParams()

  if (params?.q) {
    searchParams.set('q', params.q)
  }

  if (params?.categoryId) {
    searchParams.set('categoryId', params.categoryId)
  }

  if (params?.subCategoryId) {
    searchParams.set('subCategoryId', params.subCategoryId)
  }

  if (typeof params?.minPrice === 'number') {
    searchParams.set('minPrice', String(params.minPrice))
  }

  if (typeof params?.maxPrice === 'number') {
    searchParams.set('maxPrice', String(params.maxPrice))
  }

  if (params?.sort) {
    searchParams.set('sort', params.sort)
  }

  const query = searchParams.toString()

  return query ? `/market?${query}` : '/market'
}
