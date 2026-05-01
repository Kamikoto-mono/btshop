import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { productsApi } from '@/api/products'
import { ProductDetails } from '@/components/product'
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd'
import { ProductJsonLd } from '@/components/seo/ProductJsonLd'
import { getMarketHref } from '@/lib/routes'
import { getAbsoluteImageUrl, withFallbackDescription } from '@/shared/seo/utils'

export async function generateMetadata({
  params
}: {
  params: Promise<{
    productId: string
  }>
}): Promise<Metadata> {
  const { productId } = await params

  try {
    const product = await productsApi.getProductById(productId)
    const description = withFallbackDescription(product.description)
    const image = getAbsoluteImageUrl(product.photo)

    return {
      alternates: {
        canonical: `/products/${product.id}`
      },
      description,
      openGraph: {
        description,
        images: [
          {
            alt: product.name,
            url: image
          }
        ],
        title: product.name,
        type: 'website'
      },
      title: product.name,
      twitter: {
        card: 'summary_large_image',
        description,
        images: [image],
        title: product.name
      }
    }
  } catch {
    return {
      description: 'Товар не найден или временно недоступен.',
      title: 'Товар не найден'
    }
  }
}

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
    const breadcrumbs = [
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
      { href: `/products/${product.id}`, label: product.name }
    ]

    return (
      <>
        <BreadcrumbsJsonLd items={breadcrumbs} />
        <ProductJsonLd product={product} />
        <ProductDetails
          breadcrumbs={breadcrumbs}
          product={product}
          relatedProducts={relatedProducts}
        />
      </>
    )
  } catch {
    notFound()
  }
}
