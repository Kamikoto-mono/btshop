import { notFound } from 'next/navigation'

import { productsApi } from '@/api/products'
import { ProductDetails } from '@/components/product'
import { getMarketHref } from '@/lib/routes'

export default async function ProductPage({
  params
}: {
  params: Promise<{
    productId: string
  }>
}) {
  const { productId } = await params

  try {
    const [product, randomProducts] = await Promise.all([
      productsApi.getProductById(productId),
      productsApi.getRandomProducts({ limit: 15 }).catch(() => [])
    ])
    const relatedProducts = randomProducts.filter((item) => item.id !== product.id)

    return (
      <ProductDetails
        breadcrumbs={[
          { href: '/', label: 'Главная' },
          { href: '/market', label: 'Магазин' },
          {
            href: getMarketHref({
              categoryId: product.categoryId
            }),
            label: product.categoryName
          },
          {
            href: getMarketHref({
              categoryId: product.categoryId,
              subCategoryId: product.subCategoryId
            }),
            label: product.subCategoryName
          },
          { label: product.name }
        ]}
        product={product}
        relatedProducts={relatedProducts}
      />
    )
  } catch {
    notFound()
  }
}
