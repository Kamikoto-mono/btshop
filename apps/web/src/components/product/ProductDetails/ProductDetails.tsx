'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import chevronDownIcon from '@assets/icons/chevron-down.svg'

import type { IProduct } from '@/api/products/model'
import { AddToCartButton } from '@/components/cart'
import { PopularProductsSection } from '@/components/home'
import {
  Breadcrumbs,
  type IBreadcrumbItem,
  ProductArtwork,
  StatusDot
} from '@/components/ui'
import { getProductGallery } from '@/lib/productImages'
import { ImageModal } from '../ImageModal/ImageModal'
import styles from './ProductDetails.module.scss'

export const ProductDetails = ({
  breadcrumbs,
  product,
  relatedProducts = []
}: {
  breadcrumbs: IBreadcrumbItem[]
  product: IProduct
  relatedProducts?: IProduct[]
}) => {
  const galleryImages = useMemo(() => getProductGallery(product), [product])
  const hasMultipleImages = galleryImages.length > 1
  const [activeImage, setActiveImage] = useState(
    galleryImages[0]?.label ?? product.name
  )
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)

  const activeImageIndex = galleryImages.findIndex(
    (image) => image.label === activeImage
  )
  const activeImageSrc =
    galleryImages[activeImageIndex]?.src ?? galleryImages[0]?.src ?? ''

  const handlePrevImage = () => {
    const nextIndex =
      activeImageIndex <= 0 ? galleryImages.length - 1 : activeImageIndex - 1

    setActiveImage(galleryImages[nextIndex]?.label ?? galleryImages[0]?.label ?? product.name)
  }

  const handleNextImage = () => {
    const nextIndex =
      activeImageIndex >= galleryImages.length - 1 ? 0 : activeImageIndex + 1

    setActiveImage(galleryImages[nextIndex]?.label ?? galleryImages[0]?.label ?? product.name)
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      <section className={styles.card}>
        <div className={hasMultipleImages ? styles.gallery : styles.gallerySingle}>
          {hasMultipleImages ? (
            <div className={styles.thumbs}>
              {galleryImages.map((image) => (
                <button
                  className={
                    activeImage === image.label
                      ? `${styles.thumbButton} ${styles.thumbButtonActive}`
                      : styles.thumbButton
                  }
                  key={image.label}
                  onClick={() => setActiveImage(image.label)}
                  type='button'
                >
                  <ProductArtwork
                    active={activeImage === image.label}
                    imageSrc={image.src}
                    label={image.label}
                    variant='thumb'
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.preview}>
            <button
              className={styles.previewButton}
              onClick={() => setIsImageModalOpen(true)}
              type='button'
            >
              <ProductArtwork
                imageSrc={activeImageSrc || undefined}
                label={activeImage}
                variant='main'
              />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.category}>
            <StatusDot />
            {product.categoryName}
          </p>
          <h1>{product.name}</h1>

          <div className={styles.descriptionBlock}>
            <div className={styles.descriptionHeader}>
              <h2>Описание</h2>
              <button
                aria-expanded={isDescriptionOpen}
                className={
                  isDescriptionOpen
                    ? styles.descriptionToggleOpened
                    : styles.descriptionToggle
                }
                onClick={() => setIsDescriptionOpen((current) => !current)}
                type='button'
              >
                <Image alt='' aria-hidden='true' src={chevronDownIcon} />
              </button>
            </div>

            <div
              className={
                isDescriptionOpen
                  ? styles.descriptionContentOpened
                  : styles.descriptionContent
              }
            >
              <p className={styles.descriptionText}>{product.description}</p>
            </div>
          </div>

          <div className={styles.actions}>
            <AddToCartButton product={product} />
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? <PopularProductsSection products={relatedProducts} /> : null}

      <ImageModal
        imageAlt={product.name}
        imageOverrideSrc={activeImageSrc}
        imageSrc={activeImageSrc}
        isNavigationEnabled={galleryImages.length > 1}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  )
}
