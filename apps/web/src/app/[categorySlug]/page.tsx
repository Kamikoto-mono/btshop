import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogView } from '@/components/catalog'
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd'
import { findCategoryNodesBySlugs } from '@/lib/catalogSlugs'
import { buildCatalogMetadata, loadCatalogData } from '@/lib/catalogPage'

export async function generateMetadata({
  params
}: {
  params: Promise<{
    categorySlug: string
  }>
}): Promise<Metadata> {
  const { categorySlug } = await params
  const { categories } = await loadCatalogData({
    searchParams: {}
  })
  const { category } = findCategoryNodesBySlugs(categories, {
    categorySlug
  })

  if (!category) {
    return {
      description: 'Категория не найдена.',
      title: 'Категория не найдена'
    }
  }

  return buildCatalogMetadata({
    canonicalPath: `/${categorySlug}`,
    description: category.desc || `Каталог товаров категории ${category.name}.`,
    title: category.name
  })
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{
    categorySlug: string
  }>
  searchParams: Promise<{
    maxPrice?: string
    minPrice?: string
    page?: string
    q?: string
    sort?: 'priceAsc' | 'priceDesc'
  }>
}) {
  const { categorySlug } = await params
  const resolvedSearchParams = await searchParams
  const data = await loadCatalogData({
    searchParams: resolvedSearchParams
  })
  const { category } = findCategoryNodesBySlugs(data.categories, {
    categorySlug
  })

  if (!category) {
    notFound()
  }

  const breadcrumbs = [
    { href: '/', label: 'Главная' },
    { href: '/market', label: 'Магазин' },
    { href: `/${categorySlug}`, label: category.name }
  ]

  const catalogData = await loadCatalogData({
    categoryId: category.id,
    searchParams: resolvedSearchParams
  })

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <CatalogView
        breadcrumbs={breadcrumbs}
        categories={catalogData.categories}
        currentCategoryId={category.id}
        currentMaxPrice={catalogData.currentMaxPrice}
        currentMinPrice={catalogData.currentMinPrice}
        currentPage={catalogData.currentPage}
        currentSort={catalogData.currentSort}
        meta={catalogData.productsResponse.meta}
        products={catalogData.products}
        searchQuery={catalogData.searchQuery}
        title={category.name}
      />
    </>
  )
}
