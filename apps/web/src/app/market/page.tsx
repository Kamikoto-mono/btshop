import { getProducts, searchProducts } from '@btshop/shared'

import { CatalogView } from '@/components/catalog'

export default async function MarketPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string
  }>
}) {
  const { q = '' } = await searchParams
  const products = searchProducts(getProducts(), q)

  return (
    <CatalogView
      activeCategorySlug='injection'
      activeCompoundSlug='testosterone'
      breadcrumbs={[
        { href: '/', label: 'Главная' },
        { label: 'Магазин' }
      ]}
      description='Общий каталог со всеми текущими mock-позициями. Слева разложены категории, соединения и конкретные линии для дальнейшей реальной фильтрации.'
      products={products}
      searchQuery={q}
      title='Магазин'
    />
  )
}
