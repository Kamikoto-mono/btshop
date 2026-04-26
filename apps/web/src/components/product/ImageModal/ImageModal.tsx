'use client'

import React from 'react'
import Image, { type StaticImageData } from 'next/image'

import arrowRightIcon from '@assets/icons/arrow-right.svg'
import styles from './ImageModal.module.scss'

const getImageKey = (image: string | StaticImageData) =>
  typeof image === 'string' ? image : image.src

interface IImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string | StaticImageData
  imageAlt: string
  imageOverrideSrc: string | StaticImageData
  onPrev: () => void
  onNext: () => void
  isNavigationEnabled: boolean
}

export const ImageModal: React.FC<IImageModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageAlt,
  imageOverrideSrc,
  onPrev,
  onNext,
  isNavigationEnabled
}) => {
  const touchStartX = React.useRef<number | null>(null)
  const touchCurrentX = React.useRef<number | null>(null)
  const isSwiping = React.useRef(false)
  const suppressClick = React.useRef(false)

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (!isNavigationEnabled) {
        return
      }

      if (event.key === 'ArrowLeft') {
        onPrev()
      } else if (event.key === 'ArrowRight') {
        onNext()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isNavigationEnabled, isOpen, onClose, onNext, onPrev])

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (suppressClick.current) {
      return
    }

    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isNavigationEnabled) {
      return
    }

    touchStartX.current = event.touches[0].clientX
    touchCurrentX.current = event.touches[0].clientX
    isSwiping.current = false
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isNavigationEnabled || touchStartX.current === null) {
      return
    }

    touchCurrentX.current = event.touches[0].clientX

    if (Math.abs(touchCurrentX.current - touchStartX.current) > 8) {
      isSwiping.current = true
    }
  }

  const handleTouchEnd = () => {
    if (
      !isNavigationEnabled ||
      touchStartX.current === null ||
      touchCurrentX.current === null ||
      !isSwiping.current
    ) {
      touchStartX.current = null
      touchCurrentX.current = null
      isSwiping.current = false
      return
    }

    const diffX = touchStartX.current - touchCurrentX.current

    if (Math.abs(diffX) >= 40) {
      suppressClick.current = true
      setTimeout(() => {
        suppressClick.current = false
      }, 120)

      if (diffX > 0) {
        onNext()
      } else {
        onPrev()
      }
    }

    touchStartX.current = null
    touchCurrentX.current = null
    isSwiping.current = false
  }

  if (!isOpen || !imageSrc) {
    return null
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={handleOverlayClick}>
        <button className={styles.closeButton} onClick={onClose} type='button'>
          ×
        </button>

        <div
          className={styles.imageContainer}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
          <div className={styles.imageFrame}>
            {isNavigationEnabled ? (
              <button
                aria-label='Предыдущее фото'
                className={`${styles.navButton} ${styles.navButtonLeft}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onPrev()
                }}
                type='button'
              >
                <Image alt='' className={styles.navIcon} src={arrowRightIcon} />
              </button>
            ) : null}

            <Image
              alt={imageAlt}
              className={styles.modalImage}
              draggable={false}
              height={1600}
              key={getImageKey(imageOverrideSrc || imageSrc)}
              sizes='100vw'
              src={imageOverrideSrc || imageSrc}
              unoptimized
              width={1600}
            />

            {isNavigationEnabled ? (
              <button
                aria-label='Следующее фото'
                className={`${styles.navButton} ${styles.navButtonRight}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onNext()
                }}
                type='button'
              >
                <Image alt='' className={styles.navIcon} src={arrowRightIcon} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
