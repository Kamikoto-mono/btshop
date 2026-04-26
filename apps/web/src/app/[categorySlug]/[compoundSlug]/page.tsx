import { notFound } from 'next/navigation'

import {
  getCategoryBySlug,
  getCompoundBySlug,
  getCompoundProducts,
  searchProducts
} from '@btshop/shared'

import { CatalogView } from '@/components/catalog'

export default async function CompoundPage({
  params,
  searchParams
}: {
  params: Promise<{
    categorySlug: string
    compoundSlug: string
  }>
  searchParams: Promise<{
    q?: string
  }>
}) {
  const { categorySlug, compoundSlug } = await params
  const { q = '' } = await searchParams
  const category = getCategoryBySlug(categorySlug)
  const compound = getCompoundBySlug(categorySlug, compoundSlug)

  if (!category || !compound) {
    notFound()
  }

  const products = searchProducts(getCompoundProducts(categorySlug, compoundSlug), q)

  return (
    <CatalogView
      activeCategorySlug={categorySlug}
      activeCompoundSlug={compoundSlug}
      breadcrumbs={[
        { href: '/', label: 'Главная' },
        { href: '/market', label: 'Магазин' },
        { label: category.name },
        { label: compound.name }
      ]}
      description={`Раздел ${compound.name.toLowerCase()} внутри категории "${category.name}". Карточки ниже используют итоговые slug-ветки и позволяют дальше углубляться в конкретную внутреннюю подкатегорию.`}
      products={products}
      searchQuery={q}
      title={`${category.name} / ${compound.name}`}
    />
  )
}
