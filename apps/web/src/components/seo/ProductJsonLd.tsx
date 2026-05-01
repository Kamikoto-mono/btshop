import type { IProduct } from '@/api/products/model'
import { getAbsoluteImageUrl, getAbsoluteUrl, withFallbackDescription } from '@/shared/seo/utils'

export const ProductJsonLd = ({
  product
}: {
  product: IProduct
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    availability:
      product.inStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    description: withFallbackDescription(product.description),
    image:
      product.photos.length > 0
        ? product.photos.map((image) => getAbsoluteImageUrl(image))
        : [getAbsoluteImageUrl()],
    name: product.name,
    offers: {
      '@type': 'Offer',
      availability:
        product.inStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: product.price,
      priceCurrency: 'RUB',
      url: getAbsoluteUrl(`/products/${product.id}`)
    }
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      type='application/ld+json'
    />
  )
}
