import styles from './ProductCardSkeleton.module.scss'

interface IProductCardSkeletonProps {
  className?: string
}

export const ProductCardSkeleton = ({ className }: IProductCardSkeletonProps) => (
  <article className={className ? `${styles.card} ${className}` : styles.card}>
    <div className={styles.artwork}>
      <div className={styles.shimmer} />
    </div>

    <div className={styles.body}>
      <div className={styles.meta}>
        <div className={styles.shimmer} />
      </div>

      <div className={styles.titleBlock}>
        <div className={styles.titleLine}>
          <div className={styles.shimmer} />
        </div>
        <div className={`${styles.titleLine} ${styles.short}`}>
          <div className={styles.shimmer} />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.price}>
          <div className={styles.shimmer} />
        </div>
        <div className={styles.button}>
          <div className={styles.shimmer} />
        </div>
      </div>
    </div>
  </article>
)
