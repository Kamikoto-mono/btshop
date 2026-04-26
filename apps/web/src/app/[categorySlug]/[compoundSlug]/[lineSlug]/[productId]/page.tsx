import { notFound } from 'next/navigation'

import { getProductByRoute } from '@btshop/shared'

import { ProductDetails } from '@/components/product'

export default async function ProductPage({
  params
}: {
  params: Promise<{
    categorySlug: string
    compoundSlug: string
    lineSlug: string
    productId: string
  }>
}) {
  const { categorySlug, compoundSlug, lineSlug, productId } = await params
  const product = getProductByRoute(categorySlug, compoundSlug, lineSlug, productId)

  if (!product) {
    notFound()
  }

  return (
    <ProductDetails
      breadcrumbs={[
        { href: '/', label: 'Главная' },
        { href: '/market', label: 'Магазин' },
        { href: `/${product.categorySlug}/${product.compoundSlug}`, label: product.categoryName },
        {
          href: `/${product.categorySlug}/${product.compoundSlug}`,
          label: product.compoundName
        },
        {
          href: `/${product.categorySlug}/${product.compoundSlug}/${product.lineSlug}`,
          label: product.lineName
        },
        { label: product.id }
      ]}
      product={product}
    />
  )
}
