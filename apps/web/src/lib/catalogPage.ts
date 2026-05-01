import type { Metadata } from 'next'

import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import type { ICategoryNode } from '@/api/categories/model'
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/shared/seo/config'
import { withFallbackDescription } from '@/shared/seo/utils'

export interface ICatalogSearchParams {
  maxPrice?: string
  minPrice?: string
  page?: string
  q?: string
  sort?: 'priceAsc' | 'priceDesc'
}

export const toNumber = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const loadCatalogData = async (params: {
  categoryId?: string
  searchParams: ICatalogSearchParams
  subCategoryId?: string
}) => {
  const [categories, productsResponse] = await Promise.all([
    categoriesApi.getCategories().catch(() => [] as ICategoryNode[]),
    productsApi.getProducts({
      categoryId: params.categoryId,
      limit: 12,
      maxPrice: toNumber(params.searchParams.maxPrice),
      minPrice: toNumber(params.searchParams.minPrice),
      page: toNumber(params.searchParams.page) ?? 1,
      sort: params.searchParams.sort,
      subCategoryId: params.subCategoryId
    })
  ])

  const normalizedQuery = (params.searchParams.q ?? '').trim().toLowerCase()
  const products = normalizedQuery
    ? productsResponse.items.filter((product) =>
        `${product.name} ${product.description} ${product.categoryName} ${product.subCategoryName}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : productsResponse.items

  return {
    categories,
    currentMaxPrice: toNumber(params.searchParams.maxPrice),
    currentMinPrice: toNumber(params.searchParams.minPrice),
    currentPage: toNumber(params.searchParams.page) ?? 1,
    currentSort: params.searchParams.sort,
    products,
    productsResponse,
    searchQuery: params.searchParams.q ?? ''
  }
}

export const buildCatalogMetadata = (params: {
  canonicalPath: string
  description?: string | null
  title: string
}): Metadata => {
  const description = withFallbackDescription(params.description)

  return {
    alternates: {
      canonical: params.canonicalPath
    },
    description,
    openGraph: {
      description,
      images: [DEFAULT_OG_IMAGE],
      title: `${params.title} | ${SITE_NAME}`,
      type: 'website'
    },
    title: params.title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [DEFAULT_OG_IMAGE],
      title: `${params.title} | ${SITE_NAME}`
    }
  }
}
