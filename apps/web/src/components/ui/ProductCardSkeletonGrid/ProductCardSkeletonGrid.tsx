import { ProductCardSkeleton } from '../ProductCardSkeleton/ProductCardSkeleton'
import styles from './ProductCardSkeletonGrid.module.scss'

interface IProductCardSkeletonGridProps {
  className?: string
}

const skeletonItems = Array.from({ length: 9 }, (_, index) => index)

export const ProductCardSkeletonGrid = ({
  className
}: IProductCardSkeletonGridProps) => (
  <div className={className ? `${styles.grid} ${className}` : styles.grid}>
    {skeletonItems.map((item) => (
      <ProductCardSkeleton className={styles.card} key={item} />
    ))}
  </div>
)
