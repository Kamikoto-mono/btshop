import type { Metadata } from 'next'

import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import { CatalogView } from '@/components/catalog'
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd'
import { findCategoryContext } from '@/lib/categoryTree'
import { getMarketHref } from '@/lib/routes'
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/shared/seo/config'
import { withFallbackDescription } from '@/shared/seo/utils'

const toNumber = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const buildMarketMetadata = ({
  categoryLabel,
  query,
  subCategoryLabel
}: {
  categoryLabel?: string
  query?: string
  subCategoryLabel?: string
}) => {
  if (subCategoryLabel) {
    return {
      description: withFallbackDescription(
        `Подборка товаров в разделе ${subCategoryLabel} магазина ${SITE_NAME}.`
      ),
      title: subCategoryLabel
    }
  }

  if (categoryLabel) {
    return {
      description: withFallbackDescription(
        `Каталог товаров категории ${categoryLabel} в магазине ${SITE_NAME}.`
      ),
      title: categoryLabel
    }
  }

  if (query) {
    return {
      description: withFallbackDescription(
        `Результаты поиска по запросу «${query}» в каталоге ${SITE_NAME}.`
      ),
      title: `Поиск: ${query}`
    }
  }

  return {
    description: withFallbackDescription(`Каталог товаров ${SITE_NAME}.`),
    title: 'Каталог товаров'
  }
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<{
    categoryId?: string
    maxPrice?: string
    minPrice?: string
    page?: string
    q?: string
    sort?: 'priceAsc' | 'priceDesc'
    subCategoryId?: string
  }>
}): Promise<Metadata> {
  const { categoryId, q = '', subCategoryId } = await searchParams
  const categories = await categoriesApi.getCategories().catch(() => [])
  const { category, subCategory } = findCategoryContext(categories, {
    categoryId,
    subCategoryId
  })
  const normalizedQuery = q.trim()
  const metadataSource = buildMarketMetadata({
    categoryLabel: category?.name,
    query: normalizedQuery || undefined,
    subCategoryLabel: subCategory?.name
  })

  return {
    alternates: {
      canonical: getMarketHref({
        categoryId,
        q: normalizedQuery || undefined,
        subCategoryId
      })
    },
    description: metadataSource.description,
    openGraph: {
      description: metadataSource.description,
      images: [DEFAULT_OG_IMAGE],
      title: `${metadataSource.title} | ${SITE_NAME}`,
      type: 'website'
    },
    title: metadataSource.title,
    twitter: {
      card: 'summary_large_image',
      description: metadataSource.description,
      images: [DEFAULT_OG_IMAGE],
      title: `${metadataSource.title} | ${SITE_NAME}`
    }
  }
}

export default async function MarketPage({
  searchParams
}: {
  searchParams: Promise<{
    categoryId?: string
    maxPrice?: string
    minPrice?: string
    page?: string
    q?: string
    sort?: 'priceAsc' | 'priceDesc'
    subCategoryId?: string
  }>
}) {
  const {
    categoryId,
    maxPrice,
    minPrice,
    page,
    q = '',
    sort,
    subCategoryId
  } = await searchParams

  const [categories, productsResponse] = await Promise.all([
    categoriesApi.getCategories().catch(() => []),
    productsApi.getProducts({
      categoryId,
      limit: 12,
      maxPrice: toNumber(maxPrice),
      minPrice: toNumber(minPrice),
      page: toNumber(page) ?? 1,
      sort,
      subCategoryId
    })
  ])

  const normalizedQuery = q.trim().toLowerCase()
  const products = normalizedQuery
    ? productsResponse.items.filter((product) =>
        `${product.name} ${product.description} ${product.categoryName} ${product.subCategoryName}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : productsResponse.items

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { href: '/', label: 'Главная' },
          { href: '/market', label: 'Магазин' }
        ]}
      />
      <CatalogView
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { label: 'Магазин' }
        ]}
        categories={categories}
        currentCategoryId={categoryId}
        currentMaxPrice={toNumber(maxPrice)}
        currentMinPrice={toNumber(minPrice)}
        currentPage={toNumber(page) ?? 1}
        currentSort={sort}
        currentSubCategoryId={subCategoryId}
        meta={productsResponse.meta}
        products={products}
        searchQuery={q}
        title='Магазин'
      />
    </>
  )
}
