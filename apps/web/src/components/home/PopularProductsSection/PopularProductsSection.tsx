'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { getProducts, type IProduct } from '@btshop/shared'

import { AddToCartButton } from '@/components/cart'
import { ProductArtwork } from '@/components/ui'
import { getProductCardImage } from '@/lib/productImages'
import { getProductHref } from '@/lib/routes'
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

const buildPopularProducts = (): IProduct[] => {
  const items = getProducts()

  if (items.length >= 10) {
    return items.slice(0, 10)
  }

  const fillers = items.slice(0, Math.max(10 - items.length, 0)).map((product, index) => ({
    ...product,
    id: `${product.id}-popular-${index + 1}`,
    price: product.price + (index + 1) * 150
  }))

  return [...items, ...fillers].slice(0, 10)
}

const popularProducts = buildPopularProducts()

export const PopularProductsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(5)
  const [stepPx, setStepPx] = useState(0)
  const firstCardRef = useRef<HTMLElement | null>(null)

  const maxIndex = Math.max(popularProducts.length - visibleCards, 0)
  const canSlide = popularProducts.length > visibleCards

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
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>Популярные позиции</h2>

        {canSlide ? (
          <div className={styles.arrows}>
            <button
              aria-label='Предыдущие товары'
              className={styles.arrowButton}
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              type='button'
            >
              ←
            </button>

            <button
              aria-label='Следующие товары'
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

      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(${-currentIndex * stepPx}px)` }}>
          {popularProducts.map((product, index) => (
            <article
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
            >
              <Link href={getProductHref(product)}>
                <ProductArtwork
                  imageSrc={getProductCardImage(product)}
                  label={`${product.brand} • ${product.dosage}`}
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
                  <strong>{product.price.toLocaleString('ru-RU')} руб.</strong>
                  <AddToCartButton product={product} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
