import { Breadcrumbs } from '@/components/ui'
import { ReviewsPage } from '../ReviewsPage/ReviewsPage'
import styles from './ReviewsView.module.scss'

export const ReviewsView = () => (
  <div className={styles.page}>
    <Breadcrumbs
      items={[
        { href: '/', label: 'Главная' },
        { label: 'Отзывы' }
      ]}
    />

    <ReviewsPage />
  </div>
)
