import { notFound } from 'next/navigation'

import {
  getCategoryBySlug,
  getCompoundBySlug,
  getLineBySlug,
  getLineProducts,
  searchProducts
} from '@btshop/shared'

import { CatalogView } from '@/components/catalog'

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
    q?: string
  }>
}) {
  const { categorySlug, compoundSlug, lineSlug } = await params
  const { q = '' } = await searchParams
  const category = getCategoryBySlug(categorySlug)
  const compound = getCompoundBySlug(categorySlug, compoundSlug)
  const line = getLineBySlug(categorySlug, compoundSlug, lineSlug)

  if (!category || !compound || !line) {
    notFound()
  }

  const products = searchProducts(
    getLineProducts(categorySlug, compoundSlug, lineSlug),
    q
  )

  return (
    <CatalogView
      activeCategorySlug={categorySlug}
      activeCompoundSlug={compoundSlug}
      activeLineSlug={lineSlug}
      breadcrumbs={[
        { href: '/', label: 'Главная' },
        { href: '/market', label: 'Магазин' },
        { href: `/${category.slug}`, label: category.name },
        { href: `/${category.slug}/${compound.slug}`, label: compound.name },
        { label: line.name }
      ]}
      description={`Раздел ${line.name.toLowerCase()} внутри "${compound.name}" с переходом на отдельные страницы товаров.`}
      products={products}
      searchQuery={q}
      title={`${compound.name} / ${line.name}`}
    />
  )
}
