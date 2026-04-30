'use client'

import { useEffect, useRef, useState } from 'react'

import type { IProduct } from '@/api/products/model'
import { ProductCard } from '@/components/ui'
import styles from './PopularProductsSection.module.scss'

const CARD_GAP = 18

const getVisibleCards = (width: number) => {
  if (width < 700) {
    return 2
  }

  if (width < 980) {
    return 3
  }

  if (width < 1280) {
    return 4
  }

  return 5
}

export const PopularProductsSection = ({
  products
}: {
  products: IProduct[]
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(5)
  const [stepPx, setStepPx] = useState(0)
  const firstCardRef = useRef<HTMLElement | null>(null)

  const canSlide = products.length > visibleCards

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
  }, [visibleCards, products.length])

  useEffect(() => {
    const nextMaxIndex = Math.max(products.length - visibleCards, 0)

    if (currentIndex > nextMaxIndex) {
      setCurrentIndex(nextMaxIndex)
    }
  }, [currentIndex, products.length, visibleCards])

  if (products.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Популярные позиции</h2>

        {canSlide ? (
          <div className={styles.arrows}>
            <button
              aria-label='Предыдущие товары'
              className={styles.arrowButton}
              onClick={() =>
                setCurrentIndex((prev) => {
                  const maxIndex = Math.max(products.length - visibleCards, 0)
                  return prev <= 0 ? maxIndex : prev - 1
                })
              }
              type='button'
            >
              ←
            </button>

            <button
              aria-label='Следующие товары'
              className={styles.arrowButton}
              onClick={() =>
                setCurrentIndex((prev) => {
                  const maxIndex = Math.max(products.length - visibleCards, 0)
                  return prev >= maxIndex ? 0 : prev + 1
                })
              }
              type='button'
            >
              →
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(${-currentIndex * stepPx}px)` }}>
          {products.map((product, index) => (
            <ProductCard
              className={`${styles.card} ${
                visibleCards === 2
                  ? styles.cardTwo
                  : visibleCards === 3
                    ? styles.cardThree
                    : visibleCards === 4
                      ? styles.cardFour
                      : styles.cardFive
              }`}
              key={product.id}
              ref={index === 0 ? firstCardRef : null}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
