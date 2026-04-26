import type { StaticImageData } from 'next/image'

export interface IBanner {
  _id: string
  photo: string | StaticImageData
  webUrl?: string | null
  position?: number | null
}
