import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/shared/seo/config'

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_URL,
    rules: [
      {
        allow: '/',
        disallow: ['/api/', '/cart', '/checkout', '/profile'],
        userAgent: '*'
      }
    ],
    sitemap: `${SITE_URL}sitemap.xml`
  }
}
