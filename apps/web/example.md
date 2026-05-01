import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { productApi } from '@/api/productApi'
import { CategoryWrapper } from '@/components/pages/category/CategoryWrapper/CategoryWrapper'
import { ICategoryPageData, IParsedCategory } from '@/models/product'
import { getIdFromSlug } from '@/shared/utils/getIdFromSlug'
import { getCategoryPath } from '@/shared/routing/getCategoryPath'
import { PRODUCTION_URL, IMAGES_URL } from '@/shared/constants/urls'
import { collectionApi } from '@/api/collection'

interface IPageProps {
params: { categorySlug: string }
searchParams: { [key: string]: string | string[] | undefined }
}

// Функция для поиска категории и подкатегории
const findValueInCategories = (
categories: IParsedCategory[],
valueToFind: string
): ICategoryPageData => {
for (const category of categories) {
if (category.value === valueToFind) {
return { category, subCategory: null }
}

    for (const subCategory of category.children) {
      if (subCategory.value === valueToFind) {
        return {
          category,
          subCategory
        }
      }
    }

}

return { category: null, subCategory: null }
}

// Генерация метаданных
export async function generateMetadata({
params
}: IPageProps): Promise<Metadata> {
try {
const categories = (await productApi.getCategories(
true
)) as IParsedCategory[]
const categoryId = getIdFromSlug(params.categorySlug)
const data = findValueInCategories(categories, categoryId)

    if (!data.category && !data.subCategory) {
      // Если категория не найдена, возвращаем метаданные для страницы 404
      return {
        title: 'Категория не найдена',
        description: 'К сожалению, категория не была найдена на HorseSmart.'
      }
    }

    const defaultImage =
      'https://horsesmart.store/_next/static/media/logo.06032b0f.svg'

    if (data.category && !data.subCategory) {
      return {
        title: data.category?.seoInfo?.title ?? data.category.title,
        description:
          data.category?.seoInfo?.desc ??
          'HorseSmart — ваш идеальный маркетплейс для конного мира и верховой езды',
        alternates: {
          canonical: `${PRODUCTION_URL}category/${data.category.slug}`
        },
        other: {
          'og:title': data.category.title,
          'og:description': `Товары из категории "${data.category.title}" – покупайте в HorseSmart по выгодным ценам! Широкий ассортимент товаров для конного спорта с доставкой по России.`,
          'og:image': data.category.photo
            ? `${IMAGES_URL}${data.category.photo}`
            : defaultImage,
          'og:url': `${PRODUCTION_URL}category/${data.category.slug}`,
          'og:locale': 'ru_RU',
          'og:type': 'website',
          'og:site_name': 'HorseSmart'
        }
      }
    }

    if (data.subCategory) {
      const subCategoryPhoto = data.category?.photo
        ? `${IMAGES_URL}${data.category.photo}`
        : defaultImage

      return {
        title: data.subCategory?.seoInfo?.title ?? data.subCategory.title,
        description:
          data.subCategory?.seoInfo?.desc ??
          'HorseSmart — ваш идеальный маркетплейс для конного мира и верховой езды',
        alternates: {
          canonical: `${PRODUCTION_URL}category/${data.subCategory.slug}`
        },
        other: {
          'og:title': data.subCategory.title,
          'og:description': `Товары из подкатегории "${data.subCategory.title}" – покупайте в HorseSmart по выгодным ценам! Широкий ассортимент товаров для конного спорта с доставкой по России.`,
          'og:image': subCategoryPhoto,
          'og:url': `${PRODUCTION_URL}category/${data.subCategory.slug}`,
          'og:locale': 'ru_RU',
          'og:type': 'website',
          'og:site_name': 'HorseSmart'
        }
      }
    }

    return {
      title:
        'HorseSmart | Маркетплейс товаров для Конного спорта и Верховой езды',
      description:
        'HorseSmart — ваш идеальный маркетплейс для конного мира и верховой езды'
    }

} catch (error) {
// Обработка ошибок и возврат метаданных по умолчанию
return {
title:
'HorseSmart | Маркетплейс товаров для Конного спорта и Верховой езды',
description:
'HorseSmart — ваш идеальный маркетплейс для конного мира и верховой езды'
}
}
}

// Основная функция для рендеринга страницы
export default async function Category({ params, searchParams }: IPageProps) {
try {
const categories = (await productApi.getCategories(
true
)) as IParsedCategory[]
const thematicCollections = await collectionApi.getThematicCollections()
const categoryId = getIdFromSlug(params.categorySlug)
const data = findValueInCategories(categories, categoryId)

    // Если ни категория, ни подкатегория не найдены, возвращаем 404
    if (!data.category && !data.subCategory) {
      return notFound()
    }

    // Редирект, если slug подкатегории не совпадает
    if (data.subCategory && data.subCategory.slug !== params.categorySlug) {
      return redirect(getCategoryPath(data.subCategory.slug))
    }

    // Редирект, если slug категории не совпадает и подкатегория отсутствует
    if (
      !data.subCategory &&
      data.category &&
      data.category.slug !== params.categorySlug
    ) {
      return redirect(getCategoryPath(data.category.slug))
    }

    // Обрабатываем URL параметры для фильтров
    const initialFilters: any = {}

    // Обрабатываем ценовые фильтры
    if (searchParams.priceMin) {
      initialFilters.priceMin = searchParams.priceMin
    }
    if (searchParams.priceMax) {
      initialFilters.priceMax = searchParams.priceMax
    }

    // Обрабатываем динамические фильтры
    const isTrackingParam = (k: string) => {
      const lower = k.toLowerCase()
      return (
        lower.startsWith('utm_') ||
        lower === 'gclid' ||
        lower === 'fbclid' ||
        lower === 'yclid' ||
        lower === '_openstat'
      )
    }

    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'priceMin' || key === 'priceMax') return
      if (isTrackingParam(key)) return
      if (!value) return
      // Конвертируем строку с запятыми в массив и обратно в строку
      const values = typeof value === 'string' ? value.split(',') : value
      initialFilters[key] = Array.isArray(values) ? values.join(',') : values
    })

    return (
      <main>
        <CategoryWrapper
          data={data}
          categories={categories}
          thematicCollections={thematicCollections}
          initialFilters={
            Object.keys(initialFilters).length > 0 ? initialFilters : undefined
          }
        />
      </main>
    )

} catch (error) {
return notFound() // В случае ошибки возвращаем 404
}
}

import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import { productApi } from '@/api/productApi'
import { ProductDescription } from '@/components/pages/product/ProductDescription/ProductDescription'
import { ProductMainContent } from '@/components/pages/product/ProductMainContent/ProductMainContent'
import { ProductReviews } from '@/components/pages/product/ProductReviews/ProductReviews'
import { ProductList } from '@/components/product/ProductsList/ProductList'
import { getProductPath } from '@/shared/routing/getProductPath'
import { PRODUCTION_URL, IMAGES_URL } from '@/shared/constants/urls'
import { getIdFromSlug } from '@/shared/utils/getIdFromSlug'
import { IPossibleCombinations, IProductWithReviews } from '@/models/product'
import { IS_PROD } from '@/shared/constants/app'

interface IPageProps {
params: { productSlug: string }
}

// Генерация метаданных
export async function generateMetadata({
params
}: IPageProps): Promise<Metadata> {
try {
const productId = getIdFromSlug(params.productSlug)
const product = await productApi.getProduct(productId)

    if (!product) {
      // Если продукт не найден, генерируем метаданные для страницы 404
      return {
        title: 'Продукт не найден',
        description: 'К сожалению, продукт не был найден на HorseSmart.'
      }
    }

    const defaultImage =
      'https://horsesmart.store/_next/static/media/logo.06032b0f.svg'
    const productImage =
      product.product.photo && product.product.photo.length > 0
        ? `${IMAGES_URL}${product.product.photo[0]}`
        : defaultImage

    return {
      title: `${product.product.name} (арт. ${product.product.article}) — купить на HorseSmart`,
      description: `${product.product.name} (арт. ${product.product.article}) по цене ${product.product.price} руб. в магазине HorseSmart. На нашем маркетплейсе представлены товары для лошадей, всадников, ветеринария, оборудование для конюшни и ухода.`,
      alternates: product?.product?.slug
        ? {
          canonical: `${PRODUCTION_URL}product/${product.product.slug}`
        }
        : {},
      other: {
        'og:title': `${product.product.name} (арт. ${product.product.article}) — купить на HorseSmart`,
        'og:description': `${product.product.name} (арт. ${product.product.article}) по цене ${product.product.price} руб. в магазине HorseSmart. На нашем маркетплейсе представлены товары для лошадей, всадников, ветеринария, оборудование для конюшни и ухода.`,
        'og:image': productImage,
        'og:url': `${PRODUCTION_URL}product/${product.product.slug}`,
        'og:locale': 'ru_RU',
        'og:type': 'product',
        'og:site_name': 'HorseSmart'
      }
    }

} catch (error) {
// Возвращаем метаданные по умолчанию при ошибке
return {
title:
'HorseSmart | Маркетплейс товаров для Конного спорта и Верховой езды',
description:
'HorseSmart — ваш идеальный маркетплейс для конного мира и верховой езды'
}
}
}

const getProductJsonLd = (product: IProductWithReviews) => ({
'@context': 'http://schema.org/',
'@type': 'Product',
name: product.product.name,
image: product.product.photo.map((photo: string) => `${IMAGES_URL}${photo}`),
description:
product.product.desc ||
`${product.product.name} - купить в маркетплейсе HorseSmart. Широкий выбор товаров для конного спорта. Доставка по России.`,
sku: product.product.article,
brand: {
'@type': 'Brand',
name: product.product.seller_id?.shop_details.shop_name || 'Без названия'
},
offers: {
'@type': 'Offer',
priceCurrency: 'RUB',
price: product.product.price,
availability:
product.product.dimension.in_stock > 0
? 'http://schema.org/InStock'
: 'http://schema.org/OutOfStock',
url: `${PRODUCTION_URL}product/${product.product.slug}`,
...(product.reviewsData?.sellerName && {
seller: {
'@type': 'Organization',
name:
product.product.seller_id?.shop_details.shop_name || 'Без названия'
}
})
},
...(product.reviewsData?.count > 0 && {
aggregateRating: {
'@type': 'AggregateRating',
ratingValue: parseFloat(product.reviewsData.averageRating),
reviewCount: product.reviewsData.count
}
}),
...(product.product.characteristic.length > 0 && {
additionalProperty: product.product.characteristic.map((char) => ({
'@type': 'PropertyValue',
name: char.name,
value: char.value
}))
})
})

export default async function Product({ params }: IPageProps) {
const productId = getIdFromSlug(params.productSlug)

// Получение данных продукта
let product
let productCombinations: IPossibleCombinations
try {
product = await productApi.getProduct(productId || '0')

    // Проверка, если продукт не найден (например, 404)
    if (!product) {
      return notFound() // Вернем страницу 404
    }

    const combinationFetchId = product.product.parent_id || product.product._id
    productCombinations = await productApi.getProductCombinations(
      combinationFetchId
    )

    // Проверка на slug, если slug не совпадает, перенаправляем
    if (product?.product?.slug !== params.productSlug) {
      return redirect(getProductPath(product.product.slug))
    }

} catch (error) {
if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
return redirect(getProductPath(product?.product?.slug as string))
}
// Ловим любые другие ошибки (например, 500) и обрабатываем их.
return notFound() // Или можно отобразить кастомную страницу ошибки
}

const productJsonLd = getProductJsonLd(product)

return (
<>
{IS_PROD && (

<script
id='product-jsonld'
type='application/ld+json'
dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
/>
)}
<main>
{/_ <MobileAppPromo /> _/}
<ProductMainContent
          product={product}
          productCombinations={productCombinations}
          productSlug={params.productSlug}
        />
<ProductDescription product={product} />
<ProductReviews
          entityId={product.product._id}
          averageRating={Number(product.reviewsData.averageRating)}
          reviewsCount={product.reviewsData.count}
        />
<ProductList
          title='Похожие товары'
          size={5}
          subCategoryId={product.product.subCategory_id._id}
          showFavoriteButtons={true}
          mobileWhiteBackground={true}
        />
</main>
</>
)
}

import React from 'react'
import localFont from 'next/font/local'
import { GoogleTagManager } from '@next/third-parties/google'
import { ToastContainer } from 'react-toastify'
import { OrganizationSchema } from '@/components/JSON-LD/OrganizationSchema'
import { SearchSchema } from '@/components/JSON-LD/SearchSchema'
import { Wrapper } from '@/components/layout/Wrapper/Wrapper'
import { GuestToken } from '@/components/auth/GuestToken'
import { TopMailRu } from '@/components/analytics/TopMailRu'
import { YandexMetrica } from '@/components/analytics/YandexMetrica'
// import { VarioqubExperiments } from '@/components/analytics/VarioqubExperiments'
import { GOOGLE_GTM_CONTAINER_ID, IS_PROD } from '@/shared/constants/app'
import Providers from '../components/HOC/Providers'
import type { Metadata, Viewport } from 'next'
import 'react-toastify/dist/ReactToastify.css'
import '@/styles/index.scss'
import '@mivis/petmart-api'

const montserrat = localFont({
src: [
{
path: '../fonts/Montserrat-Regular.ttf',
weight: '400',
style: 'normal'
},
{
path: '../fonts/Montserrat-Medium.ttf',
weight: '500',
style: 'normal'
},
{
path: '../fonts/Montserrat-SemiBold.ttf',
weight: '600',
style: 'normal'
},
{
path: '../fonts/Montserrat-Bold.ttf',
weight: '700',
style: 'normal'
}
]
})

export const metadata: Metadata = {
title: 'HorseSmart | Маркетплейс товаров для Конного спорта и Верховой езды',
description:
'На сайте HorseSmart вы найдёте всё для лошадей: корма, амуницию, попоны, вальтрапы и средства ухода. Большой выбор товаров для всадников. Доставка по РФ.',
itunes: {
appId: '6450919003'
},
other: {
'og:title': 'HorseSmart | Маркетплейс товаров для Конного спорта',
'og:description':
'Покупайте товары для конного спорта и верховой езды в маркетплейсе HorseSmart. Амуниция, экипировка, корма и средства по уходу с доставкой по России',
'og:image':
'https://horsesmart.store/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fheader-banner-tablet.a42c94ad.png&w=1200&q=75',
'og:url': 'https://horsesmart.store',
'og:locale': 'ru_RU',
'og:type': 'website',
'og:site_name': 'HorseSmart'
}
}

export const viewport: Viewport = {
initialScale: 1,
maximumScale: 1
}

export default function RootLayout({
children
}: Readonly<{
children: React.ReactNode
}>) {
return (
<html lang='ru'>
<head>
<OrganizationSchema />
<SearchSchema />
{IS_PROD && <TopMailRu />}
{IS_PROD && <YandexMetrica />}
{/_ {IS_PROD && <VarioqubExperiments />} _/}
</head>
{IS_PROD && <GoogleTagManager gtmId={GOOGLE_GTM_CONTAINER_ID} />}
<body className={montserrat.className}>
<Providers>
<Wrapper>{children}</Wrapper>
</Providers>
<ToastContainer
className={montserrat.className}
style={{ fontSize: 14, fontWeight: 600 }}
position='bottom-right'
pauseOnHover={false}
pauseOnFocusLoss={false}
autoClose={700}
hideProgressBar
closeOnClick
/>
<GuestToken />
</body>
</html>
)
}



import { PRODUCTION_URL } from '@/shared/constants/urls'

interface IBreadcrumb {
  name: string
  href: string
}

interface IBreadcrumbsSchemaProps {
  items: IBreadcrumb[]
}

export const BreadcrumbsSchema: React.FC<IBreadcrumbsSchemaProps> = ({
  items
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(
        item.href,
        PRODUCTION_URL
      ).toString()
    }))
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}


export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Horse Smart',
    url: 'https://horsesmart.store/',
    description:
      'HorseSmart — маркетплейс товаров для конного спорта. Амуниция для лошадей, экипировка для всадников, корма, средства по уходу и другие товары для конного спорта с доставкой по России',
    logo: 'https://horsesmart.store/_next/static/media/logo.06032b0f.svg',
    email: 'info@horsesmart.store',
    telephone: '+7 (495) 004-10-20',
    taxID: '9724049198',
    vatID: '504701001',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'мкр. Сходня, ул Некрасова, д. 2, помещ. 25',
      addressLocality: 'Московская область, г.о. Химки, г.Химки',
      postalCode: '141420',
      addressCountry: 'RU'
    }
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
