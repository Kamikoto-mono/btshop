import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import { CatalogView } from '@/components/catalog'

const toNumber = (value?: string) => {
  if (!value) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
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
  )
}
