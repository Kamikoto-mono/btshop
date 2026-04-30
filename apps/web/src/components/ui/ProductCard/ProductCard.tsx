import { forwardRef } from 'react'
import Link from 'next/link'

import { formatCurrency } from '@btshop/shared'

import type { IProduct } from '@/api/products/model'
import { AddToCartButton } from '@/components/cart'
import { getProductCardImage } from '@/lib/productImages'
import { getProductHref } from '@/lib/routes'
import { ProductArtwork } from '../ProductArtwork/ProductArtwork'
import styles from './ProductCard.module.scss'

interface IProductCardProps {
  artworkMeta?: string
  className?: string
  product: IProduct
}

export const ProductCard = forwardRef<HTMLElement, IProductCardProps>(
  ({ product, artworkMeta, className }, ref) => (
    <article className={className ? `${styles.card} ${className}` : styles.card} ref={ref}>
      <Link href={getProductHref(product)}>
        <ProductArtwork
          imageSrc={getProductCardImage(product) ?? undefined}
          label={`${product.brand} • ${artworkMeta ?? product.subCategoryName}`}
        />
      </Link>

      <div className={styles.cardBody}>
        <div>
          <p className={styles.cardMeta}>
            {product.categoryName} / {product.subCategoryName}
          </p>
          <Link className={styles.productTitle} href={getProductHref(product)}>
            {product.name}
          </Link>
        </div>

        <div className={styles.cardFooter}>
          <div>
            {typeof product.f_price === 'number' ? (
              <span className={styles.oldPrice}>{formatCurrency(product.f_price)}</span>
            ) : null}
            <strong>{formatCurrency(product.price)}</strong>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  )
)

ProductCard.displayName = 'ProductCard'
