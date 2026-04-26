'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui'
import { mockReviews } from '../reviews.mock'
import styles from './HomeReviewsSection.module.scss'

const HOME_REVIEWS_LIMIT = 12
const CARD_GAP = 18

const getVisibleCards = (width: number) => {
  if (width < 760) {
    return 1
  }

  if (width < 1120) {
    return 2
  }

  return 3
}

const homeReviews = mockReviews.slice(0, HOME_REVIEWS_LIMIT)

export const HomeReviewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(3)
  const [stepPx, setStepPx] = useState(0)
  const firstCardRef = useRef<HTMLElement | null>(null)

  const maxIndex = Math.max(homeReviews.length - visibleCards, 0)
  const canSlide = homeReviews.length > visibleCards

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards(window.innerWidth))
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const recalculateStep = () => {
      const firstCardWidth = firstCardRef.current?.getBoundingClientRect().width || 0

      setStepPx(firstCardWidth + CARD_GAP)
    }

    recalculateStep()
    window.addEventListener('resize', recalculateStep)

    return () => window.removeEventListener('resize', recalculateStep)
  }, [visibleCards])

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  return (
    <section className={styles.reviewsSection}>
      <div className={styles.headerRow}>
        <div className={styles.sectionHeader}>
          <h2>Что говорят покупатели</h2>
        </div>

        {canSlide ? (
          <div className={styles.arrows}>
            <button
              aria-label='Предыдущие отзывы'
              className={styles.arrowButton}
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              type='button'
            >
              ←
            </button>

            <button
              aria-label='Следующие отзывы'
              className={styles.arrowButton}
              disabled={currentIndex >= maxIndex}
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))}
              type='button'
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.sliderViewport}>
        <div
          className={styles.cardsRow}
          style={{ transform: `translateX(${-currentIndex * stepPx}px)` }}
        >
          {homeReviews.map((review, index) => (
            <article
              className={`${styles.card} ${
                visibleCards === 1
                  ? styles.cardSingle
                  : visibleCards === 2
                    ? styles.cardDouble
                    : styles.cardTriple
              }`}
              key={review.id}
              ref={index === 0 ? firstCardRef : null}
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
      </div>

      <div className={styles.actions}>
        <Button
          className={styles.viewAllButton}
          href='/reviews'
          size='lg'
          variant='outlined'
        >
          Смотреть все отзывы
        </Button>

        {/*
        <Button size='lg'>
          Оставить отзыв
        </Button>
        */}
      </div>
    </section>
  )
}
