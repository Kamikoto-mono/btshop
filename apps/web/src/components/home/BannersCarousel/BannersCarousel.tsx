'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import shortArrowLeft from '@assets/icons/short-arrow-left.svg'
import shortArrowRight from '@assets/icons/short-arrow-right.svg'

import { IBanner } from '@/models/app'
import { IMAGES_URL } from '@/shared/constants/urls'
import styles from './BannersCarousel.module.scss'

const getBannerSrc = (photo: IBanner['photo']) =>
  typeof photo === 'string' ? `${IMAGES_URL}${photo}` : photo

export const BannersCarousel: React.FC<{ banners: IBanner[] }> = ({
  banners
}) => {
  const router = useRouter()

  const sortedBanners = useMemo(() => {
    return [...banners].sort((a, b) => {
      const aPosition = a.position ?? Number.MAX_SAFE_INTEGER
      const bPosition = b.position ?? Number.MAX_SAFE_INTEGER

      return aPosition - bPosition
    })
  }, [banners])

  const [offset, setOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const isDragging = useRef(false)
  const hasDragged = useRef(false)
  const suppressClick = useRef(false)

  const getBannerWidth = useCallback(() => {
    if (typeof window === 'undefined') {
      return 541
    }

    const width = window.innerWidth

    if (width <= 550) {
      return 276
    }

    if (width <= 800) {
      return 347
    }

    return 541
  }, [])

  const handleNext = useCallback(() => {
    if (isAnimating || sortedBanners.length <= 1) {
      return
    }

    isDragging.current = false
    hasDragged.current = false
    startX.current = 0
    currentX.current = 0
    setDragOffset(0)

    setIsAnimating(true)
    setOffset((prev) => prev + 1)
  }, [isAnimating, sortedBanners.length])

  const handlePrev = useCallback(() => {
    if (isAnimating || sortedBanners.length <= 1) {
      return
    }

    isDragging.current = false
    hasDragged.current = false
    startX.current = 0
    currentX.current = 0
    setDragOffset(0)

    setIsAnimating(true)
    setOffset((prev) => prev - 1)
  }, [isAnimating, sortedBanners.length])

  useEffect(() => {
    if (sortedBanners.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      if (!isAnimating) {
        handleNext()
      }
    }, 9000)

    return () => clearInterval(interval)
  }, [handleNext, isAnimating, sortedBanners.length])

  const handleBannerClick = (banner: IBanner) => {
    if (suppressClick.current) {
      return
    }

    router.push(banner?.webUrl ?? '/')
  }

  const handleSwipe = (clientX: number, isStart: boolean) => {
    if (isStart) {
      startX.current = clientX
      currentX.current = clientX
      isDragging.current = true
      hasDragged.current = false
      setDragOffset(0)
      return
    }

    currentX.current = clientX
    hasDragged.current =
      hasDragged.current || Math.abs(clientX - startX.current) > 8
    setDragOffset(clientX - startX.current)
  }

  const handleSwipeEnd = () => {
    if (!isDragging.current) {
      return
    }

    isDragging.current = false
    const diff = startX.current - currentX.current
    const bannerWidth = getBannerWidth()
    const itemsScrolled = Math.round(diff / bannerWidth)

    if (hasDragged.current) {
      suppressClick.current = true
      window.setTimeout(() => {
        suppressClick.current = false
      }, 0)
    }

    if (Math.abs(diff) > 5) {
      setIsAnimating(true)

      if (itemsScrolled !== 0) {
        setOffset((prev) => prev + itemsScrolled)
      } else {
        setIsAnimating(false)
      }
    }

    startX.current = 0
    currentX.current = 0
    hasDragged.current = false
    setDragOffset(0)
  }

  const extendedBanners = [
    ...sortedBanners,
    ...sortedBanners,
    ...sortedBanners,
    ...sortedBanners,
    ...sortedBanners
  ]
  const centerIndex = sortedBanners.length * 2

  if (sortedBanners.length === 0) {
    return <div style={{ paddingTop: 15 }} />
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div
          ref={trackRef}
          className={styles.track}
          style={{
            transform: `translateX(calc(-${
              centerIndex + offset
            } * var(--banner-step) + 50% - var(--banner-center-width) / 2 + ${dragOffset}px))`,
            transition:
              isDragging.current || !isAnimating
                ? 'none'
                : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onTransitionEnd={() => {
            if (offset >= sortedBanners.length) {
              if (trackRef.current) {
                trackRef.current.style.transition = 'none'
              }

              requestAnimationFrame(() => {
                setOffset((prev) => prev - sortedBanners.length)
                requestAnimationFrame(() => {
                  if (trackRef.current) {
                    trackRef.current.style.transition =
                      'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }

                  setIsAnimating(false)
                })
              })

              return
            }

            if (offset <= -sortedBanners.length) {
              if (trackRef.current) {
                trackRef.current.style.transition = 'none'
              }

              requestAnimationFrame(() => {
                setOffset((prev) => prev + sortedBanners.length)
                requestAnimationFrame(() => {
                  if (trackRef.current) {
                    trackRef.current.style.transition =
                      'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }

                  setIsAnimating(false)
                })
              })

              return
            }

            setIsAnimating(false)
          }}
          onTouchEnd={handleSwipeEnd}
          onTouchMove={(event) => handleSwipe(event.touches[0].clientX, false)}
          onTouchStart={(event) => handleSwipe(event.touches[0].clientX, true)}
          onMouseDown={(event) => {
            event.preventDefault()
            handleSwipe(event.clientX, true)
          }}
          onMouseMove={(event) => {
            if (startX.current === 0) {
              return
            }

            event.preventDefault()
            handleSwipe(event.clientX, false)
          }}
          onMouseUp={(event) => {
            if (startX.current === 0) {
              return
            }

            event.preventDefault()
            handleSwipeEnd()
          }}
          onMouseLeave={() => {
            if (isDragging.current) {
              handleSwipeEnd()
            }
          }}
        >
          {extendedBanners.map((banner, index) => {
            const isCenter = index === centerIndex + offset
            const isInitiallyVisible =
              offset === 0 && Math.abs(index - centerIndex) <= 1
            const shouldPreload = index === centerIndex && offset === 0

            return (
              <div
                key={`${banner._id}-${index}`}
                className={isCenter ? styles.centerBanner : styles.sideBanner}
                onClick={
                  isCenter && banner?.webUrl
                    ? () => handleBannerClick(banner)
                    : undefined
                }
              >
                <Image
                  alt=''
                  fill
                  className={styles.bannerImage}
                  fetchPriority={isInitiallyVisible ? 'high' : undefined}
                  loading={isInitiallyVisible ? 'eager' : 'lazy'}
                  priority={shouldPreload}
                  sizes='(max-width: 550px) 300px, (max-width: 800px) 380px, 600px'
                  src={getBannerSrc(banner.photo)}
                />
              </div>
            )
          })}
        </div>

        {sortedBanners.length > 1 ? (
          <button
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={handlePrev}
            disabled={isAnimating}
            aria-label='Предыдущий баннер'
            type='button'
          >
            <Image src={shortArrowLeft} alt='' width={14} height={14} />
          </button>
        ) : null}

        {sortedBanners.length > 1 ? (
          <button
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={handleNext}
            disabled={isAnimating}
            aria-label='Следующий баннер'
            type='button'
          >
            <Image src={shortArrowRight} alt='' width={14} height={14} />
          </button>
        ) : null}
      </div>
    </section>
  )
}
