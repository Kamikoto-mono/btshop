'use client'

import { useMemo, useState } from 'react'

import { IProduct } from '@btshop/shared'

import { AddToCartButton } from '@/components/cart'
import { getProductGallery } from '@/lib/productImages'
import { Breadcrumbs, IBreadcrumbItem, ProductArtwork, StatusDot } from '@/components/ui'
import { ImageModal } from '../ImageModal/ImageModal'
import styles from './ProductDetails.module.scss'

export const ProductDetails = ({
  product,
  breadcrumbs
}: {
  product: IProduct
  breadcrumbs: IBreadcrumbItem[]
}) => {
  const galleryImages = useMemo(() => getProductGallery(product), [product])
  const [activeImage, setActiveImage] = useState(
    galleryImages[0]?.label ?? product.name
  )
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const activeImageIndex = galleryImages.findIndex(
    (image) => image.label === activeImage
  )
  const activeImageSrc =
    galleryImages[activeImageIndex]?.src ?? galleryImages[0]?.src ?? ''

  const handlePrevImage = () => {
    const nextIndex =
      activeImageIndex <= 0 ? galleryImages.length - 1 : activeImageIndex - 1

    setActiveImage(galleryImages[nextIndex]?.label ?? galleryImages[0].label)
  }

  const handleNextImage = () => {
    const nextIndex =
      activeImageIndex >= galleryImages.length - 1 ? 0 : activeImageIndex + 1

    setActiveImage(galleryImages[nextIndex]?.label ?? galleryImages[0].label)
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      <section className={styles.card}>
        <div className={styles.gallery}>
          <div className={styles.thumbs}>
            {galleryImages.map((image) => (
              <button
                className={styles.thumbButton}
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

          <div className={styles.preview}>
            <button
              className={styles.previewButton}
              onClick={() => setIsImageModalOpen(true)}
              type='button'
            >
              <ProductArtwork
                imageSrc={activeImageSrc}
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
            <h2>Описание</h2>
            <p>{product.description}</p>
          </div>

          <div className={styles.actions}>
            <AddToCartButton product={product} />
          </div>
        </div>
      </section>

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
