import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogView } from '@/components/catalog'
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd'
import { buildCategoryPath, findCategoryNodesBySlugs } from '@/lib/catalogSlugs'
import { buildCatalogMetadata, loadCatalogData } from '@/lib/catalogPage'

export async function generateMetadata({
  params
}: {
  params: Promise<{
    categorySlug: string
    compoundSlug: string
    lineSlug: string
  }>
}): Promise<Metadata> {
  const { categorySlug, compoundSlug, lineSlug } = await params
  const { categories } = await loadCatalogData({
    searchParams: {}
  })
  const { category, line, subCategory } = findCategoryNodesBySlugs(categories, {
    categorySlug,
    compoundSlug,
    lineSlug
  })

  if (!category || !subCategory || !line) {
    return {
      description: 'Раздел не найден.',
      title: 'Раздел не найден'
    }
  }

  return buildCatalogMetadata({
    canonicalPath: buildCategoryPath({
      category,
      line,
      subCategory
    }),
    description: line.desc || `Каталог товаров раздела ${line.name}.`,
    title: line.name
  })
}

export default async function LinePage({
  params,
  searchParams
}: {
  params: Promise<{
    categorySlug: string
    compoundSlug: string
    lineSlug: string
  }>
  searchParams: Promise<{
    maxPrice?: string
    minPrice?: string
    page?: string
    q?: string
    sort?: 'priceAsc' | 'priceDesc'
  }>
}) {
  const { categorySlug, compoundSlug, lineSlug } = await params
  const resolvedSearchParams = await searchParams
  const data = await loadCatalogData({
    searchParams: resolvedSearchParams
  })
  const { category, line, subCategory } = findCategoryNodesBySlugs(data.categories, {
    categorySlug,
    compoundSlug,
    lineSlug
  })

  if (!category || !subCategory || !line) {
    notFound()
  }

  const breadcrumbs = [
    { href: '/', label: 'Главная' },
    { href: '/market', label: 'Магазин' },
    {
      href: buildCategoryPath({
        category
      }),
      label: category.name
    },
    {
      href: buildCategoryPath({
        category,
        subCategory
      }),
      label: subCategory.name
    },
    {
      href: buildCategoryPath({
        category,
        line,
        subCategory
      }),
      label: line.name
    }
  ]

  const catalogData = await loadCatalogData({
    categoryId: category.id,
    searchParams: resolvedSearchParams,
    subCategoryId: line.id
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
        currentSubCategoryId={line.id}
        meta={catalogData.productsResponse.meta}
        products={catalogData.products}
        searchQuery={catalogData.searchQuery}
        title={line.name}
      />
    </>
  )
}
