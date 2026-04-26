import { IProduct } from '@btshop/shared'

export const getProductHref = (product: IProduct) =>
  `/${product.categorySlug}/${product.compoundSlug}/${product.lineSlug}/${product.id}`

export const getCompoundHref = (categorySlug: string, compoundSlug: string) =>
  `/${categorySlug}/${compoundSlug}`

export const getLineHref = (
  categorySlug: string,
  compoundSlug: string,
  lineSlug: string
) => `/${categorySlug}/${compoundSlug}/${lineSlug}`
