/\*_ @type {import('next-sitemap').IConfig} _/
module.exports = {
siteUrl: 'https://horsesmart.store',
changefreq: 'daily',
exclude: ['/server-sitemap.xml'],
generateRobotsTxt: true,
robotsTxtOptions: {
policies: [
{
userAgent: '_',
disallow: [
'/private/',
'/api/',
'/cart/',
'/profile/',
'/catalog/',
'/landing_',
'/?amp',
'/_?utm_',
'/?method*',
'/*?etext*',
'/*?orders*',
'/*?yprqee*',
'/*?ybaip*',
'/*?source*'
]
},
{
userAgent: 'GoogleBot',
disallow: [
'/private/',
'/api/',
'/cart/',
'/profile/',
'/catalog/',
'/landing*',
'/?amp',
'/_?utm_',
'/_?method_',
'/_?etext_',
'/_?orders_',
'/_?yprqee_',
'/_?source_'
]
},
{
userAgent: 'Yandex',
disallow: [
'/private/',
'/api/',
'/cart/',
'/profile/',
'/catalog/',
'/landing*',
'/?amp',
'/*?orders*'
],
'Clean-param':
'click_id&utmb&erid&\_ym_debug&gtm_debug&utm_mixed&utm_medium_db&region_name&ios_ifa&phrase_id&method&etext&yprqee&ybaip&source'
}
],
additionalSitemaps: [
'https://horsesmart.store/server-sitemap.xml',
'https://horsesmart.store/blog/sitemap_index.xml'
]
}
}

# \*

User-agent: _
Disallow: /private/
Disallow: /api/
Disallow: /cart/
Disallow: /profile/
Disallow: /catalog/
Disallow: /landing_
Disallow: /?amp
Disallow: /_?utm_
Disallow: /_?method_
Disallow: /_?etext_
Disallow: /_?orders_
Disallow: /_?yprqee_

# GoogleBot

User-agent: GoogleBot
Disallow: /private/
Disallow: /api/
Disallow: /cart/
Disallow: /profile/
Disallow: /catalog/
Disallow: /landing*
Disallow: /?amp
Disallow: /*?utm*
Disallow: /*?method*
Disallow: /*?etext*
Disallow: /*?orders*
Disallow: /*?yprqee\*

# Yandex

User-agent: Yandex
Disallow: /private/
Disallow: /api/
Disallow: /cart/
Disallow: /profile/
Disallow: /catalog/
Disallow: /landing*
Disallow: /?amp
Disallow: /*?orders\*
Clean-param: click_id&utmb&erid&\_ym_debug&gtm_debug&utm_mixed&utm_medium_db&region_name&ios_ifa&phrase_id&method&etext&yprqee

# Host

Host: https://horsesmart.store

# Sitemaps

Sitemap: https://horsesmart.store/server-sitemap.xml

// app/server-sitemap.xml/route.ts
import { getServerSideSitemap, ISitemapField } from 'next-sitemap'
import { IMAGES_URL, PRODUCTION_URL } from '@/shared/constants/urls'
import { productApi } from '@/api/productApi'
import { sellerApi } from '@/api/sellerApi'

type TSitemapType = 'category' | 'product' | 'seller'

const formatDate = (date: Date | string) => new Date(date).toISOString()

const getSitemapDataArray = (
type: TSitemapType,
item: {
slug: string
updatedAt: Date | string
imageUrls?: string[]
}
): ISitemapField => {
const images = item?.imageUrls?.filter(Boolean)?.map((url) => ({
loc: new URL(`${IMAGES_URL}${url}`)
}))

return {
loc: `${PRODUCTION_URL}${type}/${item.slug}`,
lastmod: formatDate(item.updatedAt),
changefreq: 'daily',
priority: 0.8,
...(images?.length ? { images } : {})
}
}

export async function GET(request: Request) {
const [categories, subCategories, products, sellers, seoTypeFilters] = await Promise.all([
productApi.getCategories(),
productApi.getSubCategories(),
productApi.getProducts({ skip: '0', limit: '100000' }),
sellerApi.getSellersSlugs(),
productApi.getSeoTypeFilters()
])

const sitemapCategories = categories.map((item) =>
getSitemapDataArray('category', {
slug: item.slug,
updatedAt: item.updatedAt,
imageUrls: [item.photo]
})
)

const sitemapSubCategories = subCategories.map((item) =>
getSitemapDataArray('category', {
slug: item.slug,
updatedAt: item.updatedAt
})
)

const sitemapProducts = products.products.map((item) =>
getSitemapDataArray('product', {
slug: item.slug,
updatedAt: item.updatedAt,
imageUrls: item.photo
})
)

const sitemapSellers = sellers.map((item) =>
getSitemapDataArray('seller', {
slug: item.slug,
updatedAt: item.updatedAt,
imageUrls: [item.shop_details?.banner]
})
)

const sitemapSeoFilters = seoTypeFilters.map((item) => ({
loc: item.url,
lastmod: formatDate(item.updatedAt),
changefreq: 'daily' as const,
priority: 0.7
}))

return getServerSideSitemap([
{
loc: PRODUCTION_URL,
lastmod: formatDate(categories[0].updatedAt),
changefreq: 'daily',
priority: 1
},
{
loc: `${PRODUCTION_URL}landing`,
lastmod: '2024-12-07T00:00:00.000Z',
changefreq: 'daily',
priority: 0.5
},
{
loc: `${PRODUCTION_URL}user-agreement`,
lastmod: '2024-12-07T00:00:00.000Z',
changefreq: 'daily',
priority: 0.1
},
{
loc: `${PRODUCTION_URL}privacy-policy`,
lastmod: '2024-12-07T00:00:00.000Z',
changefreq: 'daily',
priority: 0.1
},
...sitemapCategories,
...sitemapSubCategories,
...sitemapProducts,
...sitemapSellers,
...sitemapSeoFilters
])
}
