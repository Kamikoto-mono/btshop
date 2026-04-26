'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { mockReviews } from '../reviews.mock'
import styles from './ReviewsPage.module.scss'

const ITEMS_PER_PAGE = 12
const SKELETON_ITEMS_COUNT = 6

export const ReviewsPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [maxCardHeight, setMaxCardHeight] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  const totalPages = Math.ceil(mockReviews.length / ITEMS_PER_PAGE)
  const reviews = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE

    return mockReviews.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage])

  useEffect(() => {
    setIsLoading(true)

    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, 280)

    return () => window.clearTimeout(timer)
  }, [currentPage])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const measure = () => {
      if (!gridRef.current) {
        return
      }

      const cards = Array.from(
        gridRef.current.querySelectorAll<HTMLElement>(`.${styles.reviewCard}`)
      )

      if (cards.length === 0) {
        setMaxCardHeight(null)
        return
      }

      cards.forEach((card) => card.style.removeProperty('min-height'))

      const nextHeight = Math.max(
        ...cards.map((card) => Math.ceil(card.getBoundingClientRect().height))
      )

      setMaxCardHeight(nextHeight > 0 ? nextHeight : null)
    }

    const frame = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [isLoading, reviews])

  return (
    <section className={styles.pageSection}>
      <div className={styles.header}>
        <h1>Отзывы покупателей</h1>
      </div>

      <div className={styles.grid} ref={gridRef}>
        {isLoading
          ? Array.from({ length: SKELETON_ITEMS_COUNT }).map((_, index) => (
              <article className={styles.skeletonCard} key={`review-skeleton-${index}`}>
                <div className={styles.skeletonHeader}>
                  <span className={styles.skeletonAvatar} />
                  <div className={styles.skeletonAuthorBlock}>
                    <span className={styles.skeletonAuthor} />
                    <span className={styles.skeletonDate} />
                  </div>
                  <span className={styles.skeletonStars} />
                </div>
                <span className={styles.skeletonProduct} />
                <span className={styles.skeletonTextLine} />
                <span className={styles.skeletonTextLine} />
                <span className={styles.skeletonTextLineShort} />
              </article>
            ))
          : reviews.map((review) => (
              <article
                className={styles.reviewCard}
                key={review.id}
                style={maxCardHeight ? { minHeight: `${maxCardHeight}px` } : undefined}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <strong>{review.author}</strong>
                    <span>
                      {review.city} · {review.date}
                    </span>
                  </div>

                  <div className={styles.rating} aria-label={`Оценка ${review.rating} из 5`}>
                    {'★'.repeat(review.rating)}
                  </div>
                </div>

                <p className={styles.product}>{review.product}</p>
                <p className={styles.reviewText}>{review.text}</p>
              </article>
            ))}
      </div>

      <div className={styles.paginationWrap}>
        <Button
          disabled={currentPage === 1 || isLoading}
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          variant='outlined'
        >
          Назад
        </Button>

        <span className={styles.pageCounter}>
          {currentPage} / {totalPages}
        </span>

        <Button
          disabled={currentPage === totalPages || isLoading}
          onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
          variant='outlined'
        >
          Вперед
        </Button>
      </div>
    </section>
  )
}
