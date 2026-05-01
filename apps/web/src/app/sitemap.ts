import type { MetadataRoute } from 'next'

import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import { buildCategoryPath } from '@/lib/catalogSlugs'
import { SITE_URL } from '@/shared/seo/config'

const now = new Date()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productsResponse] = await Promise.all([
    categoriesApi.getCategories().catch(() => []),
    productsApi
      .getProducts({
        limit: 10000,
        page: 1
      })
      .catch(() => ({
        items: [],
        meta: {
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10000,
          page: 1,
          total: 0,
          totalPages: 0
        }
      }))
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 1,
      url: SITE_URL
    },
    {
      changeFrequency: 'daily',
      lastModified: now,
      priority: 0.9,
      url: `${SITE_URL}market`
    },
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 0.8,
      url: `${SITE_URL}categories`
    },
    {
      changeFrequency: 'monthly',
      lastModified: now,
      priority: 0.6,
      url: `${SITE_URL}faq`
    },
    {
      changeFrequency: 'weekly',
      lastModified: now,
      priority: 0.6,
      url: `${SITE_URL}reviews`
    }
  ]

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((category) => [
    {
      changeFrequency: 'weekly' as const,
      lastModified: now,
      priority: 0.8,
      url: `${SITE_URL}${buildCategoryPath({ category }).replace(/^\//, '')}`
    },
    ...category.subCategories.flatMap((subCategory) => [
      {
        changeFrequency: 'weekly' as const,
        lastModified: now,
        priority: 0.7,
        url: `${SITE_URL}${buildCategoryPath({ category, subCategory }).replace(/^\//, '')}`
      },
      ...subCategory.childSubCategories.map((line) => ({
        changeFrequency: 'weekly' as const,
        lastModified: now,
        priority: 0.7,
        url: `${SITE_URL}${buildCategoryPath({
          category,
          line,
          subCategory
        }).replace(/^\//, '')}`
      }))
    ])
  ])

  const productPages: MetadataRoute.Sitemap = productsResponse.items.map((product) => ({
    changeFrequency: 'weekly' as const,
    lastModified: now,
    priority: 0.7,
    url: `${SITE_URL}products/${product.id}`
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
