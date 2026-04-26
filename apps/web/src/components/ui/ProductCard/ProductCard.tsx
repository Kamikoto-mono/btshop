import { forwardRef } from 'react'
import Link from 'next/link'

import { formatCurrency, type IProduct } from '@btshop/shared'

import { AddToCartButton } from '@/components/cart'
import { getProductCardImage } from '@/lib/productImages'
import { getProductHref } from '@/lib/routes'
import { ProductArtwork } from '../ProductArtwork/ProductArtwork'
import styles from './ProductCard.module.scss'

interface IProductCardProps {
  product: IProduct
  artworkMeta?: string
  className?: string
}

export const ProductCard = forwardRef<HTMLElement, IProductCardProps>(
  ({ product, artworkMeta, className }, ref) => (
    <article className={className ? `${styles.card} ${className}` : styles.card} ref={ref}>
      <Link href={getProductHref(product)}>
        <ProductArtwork
          imageSrc={getProductCardImage(product)}
          label={`${product.brand} • ${artworkMeta ?? product.dosage}`}
        />
      </Link>

      <div className={styles.cardBody}>
        <div>
          <p className={styles.cardMeta}>
            {product.categoryName} / {product.compoundName}
          </p>
          <Link className={styles.productTitle} href={getProductHref(product)}>
            {product.name}
          </Link>
          <p className={styles.cardDescription}>{product.shortDescription}</p>
        </div>

        <div className={styles.cardFooter}>
          <strong>{formatCurrency(product.price)}</strong>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  )
)

ProductCard.displayName = 'ProductCard'
