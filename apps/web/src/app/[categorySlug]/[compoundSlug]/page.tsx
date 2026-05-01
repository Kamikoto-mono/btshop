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
  }>
}): Promise<Metadata> {
  const { categorySlug, compoundSlug } = await params
  const { categories } = await loadCatalogData({
    searchParams: {}
  })
  const { category, subCategory } = findCategoryNodesBySlugs(categories, {
    categorySlug,
    compoundSlug
  })

  if (!category || !subCategory) {
    return {
      description: 'Подкатегория не найдена.',
      title: 'Подкатегория не найдена'
    }
  }

  return buildCatalogMetadata({
    canonicalPath: buildCategoryPath({
      category,
      subCategory
    }),
    description: subCategory.desc || `Каталог товаров раздела ${subCategory.name}.`,
    title: subCategory.name
  })
}

export default async function CompoundPage({
  params,
  searchParams
}: {
  params: Promise<{
    categorySlug: string
    compoundSlug: string
  }>
  searchParams: Promise<{
    maxPrice?: string
    minPrice?: string
    page?: string
    q?: string
    sort?: 'priceAsc' | 'priceDesc'
  }>
}) {
  const { categorySlug, compoundSlug } = await params
  const resolvedSearchParams = await searchParams
  const data = await loadCatalogData({
    searchParams: resolvedSearchParams
  })
  const { category, subCategory } = findCategoryNodesBySlugs(data.categories, {
    categorySlug,
    compoundSlug
  })

  if (!category || !subCategory) {
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
    }
  ]

  const catalogData = await loadCatalogData({
    categoryId: category.id,
    searchParams: resolvedSearchParams,
    subCategoryId: subCategory.id
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
        currentSubCategoryId={subCategory.id}
        meta={catalogData.productsResponse.meta}
        products={catalogData.products}
        searchQuery={catalogData.searchQuery}
        title={subCategory.name}
      />
    </>
  )
}
