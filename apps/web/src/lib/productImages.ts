import type { IProduct } from '@/api/products/model'

export const getProductGallery = (product: IProduct) =>
  product.photos.map((src, index) => ({
    label: `${product.name}-${index + 1}`,
    src
  }))

export const getProductCardImage = (product: IProduct) => product.photo
