import type { StaticImageData } from 'next/image'

import type { IProduct } from '@btshop/shared'

import balkanBanner from '@assets/images/balkan-pharmaceuticals-banner.png'
import canadabiolabsBanner from '@assets/images/canadabiolabs-banner.png'
import spLaboratoriesBanner from '@assets/images/sp-laboratories-banner.png'
import zphcBanner from '@assets/images/zphc-banner.png'

const PRODUCT_BANNERS: StaticImageData[] = [
  balkanBanner,
  canadabiolabsBanner,
  spLaboratoriesBanner,
  zphcBanner
]

const getBannerStartIndex = (productId: string) =>
  Array.from(productId).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
  PRODUCT_BANNERS.length

export const getProductGallery = (product: IProduct) => {
  const startIndex = getBannerStartIndex(product.id)
  const labels = [product.name, ...product.images]

  return labels.map((label, index) => ({
    label,
    src: PRODUCT_BANNERS[(startIndex + index) % PRODUCT_BANNERS.length]
  }))
}

export const getProductCardImage = (product: IProduct) =>
  getProductGallery(product)[0]?.src ?? PRODUCT_BANNERS[0]
