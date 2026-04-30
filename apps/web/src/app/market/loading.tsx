import { ProductCardSkeletonGrid } from '@/components/ui'
import styles from './loading.module.scss'

export default function MarketLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.shimmer} />
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className={`${styles.sidebarLine} ${index % 3 === 0 ? styles.sidebarLineShort : ''}`}
              key={index}
            >
              <div className={styles.shimmer} />
            </div>
          ))}
        </aside>

        <section className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarBlock}>
              <div className={styles.toolbarLabel}>
                <div className={styles.shimmer} />
              </div>
              <div className={styles.toolbarControls}>
                {Array.from({ length: 3 }, (_, index) => (
                  <div className={styles.control} key={index}>
                    <div className={styles.shimmer} />
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.toolbarBlock} ${styles.sortBlock}`}>
              <div className={styles.toolbarLabel}>
                <div className={styles.shimmer} />
              </div>
              <div className={styles.sortControl}>
                <div className={styles.shimmer} />
              </div>
            </div>
          </div>

          <ProductCardSkeletonGrid />
        </section>
      </div>
    </div>
  )
}
