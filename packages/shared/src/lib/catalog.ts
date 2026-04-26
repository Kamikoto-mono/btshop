import { categories, ICategory, IProduct, products } from '../data/catalog'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value) + ' руб.'

export const getCategories = (): ICategory[] => categories

export const getProducts = (): IProduct[] => products

export const getFeaturedProducts = (): IProduct[] => products.slice(0, 4)

export const getCompoundProducts = (
  categorySlug: string,
  compoundSlug: string
): IProduct[] =>
  products.filter(
    (product) =>
      product.categorySlug === categorySlug &&
      product.compoundSlug === compoundSlug
  )

export const getLineProducts = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string
): IProduct[] =>
  products.filter(
    (product) =>
      product.categorySlug === categorySlug &&
      product.compoundSlug === compoundSlug &&
      product.lineSlug === lineSlug
  )

export const getRelatedProducts = (product: IProduct): IProduct[] =>
  products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.categorySlug === product.categorySlug &&
        item.compoundSlug === product.compoundSlug
    )
    .slice(0, 3)

export const getProductByRoute = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string,
  productId: string
): IProduct | undefined =>
  products.find(
    (product) =>
      product.categorySlug === categorySlug &&
      product.compoundSlug === compoundSlug &&
      product.lineSlug === lineSlug &&
      product.id === productId
  )

export const getCategoryBySlug = (categorySlug: string) =>
  categories.find((category) => category.slug === categorySlug)

export const getCompoundBySlug = (categorySlug: string, compoundSlug: string) =>
  getCategoryBySlug(categorySlug)?.compounds.find(
    (compound) => compound.slug === compoundSlug
  )

export const getLineBySlug = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string
) =>
  getCompoundBySlug(categorySlug, compoundSlug)?.lines.find(
    (line) => line.slug === lineSlug
  )

export const getLineCount = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string
) =>
  products.filter(
    (product) =>
      product.categorySlug === categorySlug &&
      product.compoundSlug === compoundSlug &&
      product.lineSlug === lineSlug
  ).length

const normalizeSearchValue = (value: string) => value.trim().toLowerCase()

export const searchProducts = (items: IProduct[], query: string): IProduct[] => {
  const normalizedQuery = normalizeSearchValue(query)

  if (!normalizedQuery) {
    return items
  }

  return items.filter((product) =>
    [
      product.name,
      product.categoryName,
      product.compoundName,
      product.lineName,
      product.brand,
      product.shortDescription,
      product.description
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  )
}
