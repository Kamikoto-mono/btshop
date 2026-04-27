import { notFound } from 'next/navigation'

import {
  getCategoryBySlug,
  getCategoryProducts,
  searchProducts
} from '@btshop/shared'

import { CatalogView } from '@/components/catalog'

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{
    categorySlug: string
  }>
  searchParams: Promise<{
    q?: string
  }>
}) {
  const { categorySlug } = await params
  const { q = '' } = await searchParams
  const category = getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  const products = searchProducts(getCategoryProducts(categorySlug), q)

  return (
    <CatalogView
      activeCategorySlug={categorySlug}
      breadcrumbs={[
        { href: '/', label: 'Главная' },
        { href: '/market', label: 'Магазин' },
        { label: category.name }
      ]}
      description={`Все позиции внутри категории "${category.name}" с последующим выбором соединения и подгруппы.`}
      products={products}
      searchQuery={q}
      title={category.name}
    />
  )
}
