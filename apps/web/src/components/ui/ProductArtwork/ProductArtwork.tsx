import Image, { type StaticImageData } from 'next/image'

import styles from './ProductArtwork.module.scss'

export const ProductArtwork = ({
  label,
  imageSrc,
  variant = 'card',
  active = false
}: {
  label: string
  imageSrc?: string | StaticImageData
  variant?: 'card' | 'main' | 'thumb'
  active?: boolean
}) => (
  <div
    className={
      variant === 'main'
        ? styles.mainArtwork
        : variant === 'thumb'
          ? active
            ? styles.thumbArtworkActive
            : styles.thumbArtwork
          : styles.cardArtwork
    }
  >
    {imageSrc && isRemoteImage(imageSrc) ? (
      <img
        alt={label}
        className={styles.artworkImage}
        decoding='async'
        loading={variant === 'main' ? 'eager' : 'lazy'}
        src={imageSrc}
      />
    ) : imageSrc ? (
      <Image
        alt={label}
        className={styles.artworkImage}
        fill
        sizes={variant === 'main' ? '50vw' : variant === 'thumb' ? '120px' : '320px'}
        src={imageSrc}
      />
    ) : null}
  </div>
)
