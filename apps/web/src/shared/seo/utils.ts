import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_URL } from './config'

export const stripHtml = (value?: string | null) =>
  (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const truncateText = (value?: string | null, maxLength = 160) => {
  const normalized = stripHtml(value)

  if (!normalized) {
    return ''
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}…`
}

export const withFallbackDescription = (value?: string | null) => {
  const normalized = truncateText(value)

  return normalized || DEFAULT_DESCRIPTION
}

export const getAbsoluteUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return new URL(path.startsWith('/') ? path : `/${path}`, SITE_URL).toString()
}

export const getAbsoluteImageUrl = (image?: string | null) => {
  if (!image) {
    return DEFAULT_OG_IMAGE
  }

  if (/^https?:\/\//i.test(image)) {
    return image
  }

  return getAbsoluteUrl(image)
}
