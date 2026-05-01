import type { Metadata } from 'next'

import { categoriesApi } from '@/api/categories'
import { CategoriesView } from '@/components/catalog'
import { BreadcrumbsJsonLd } from '@/components/seo/BreadcrumbsJsonLd'

export const metadata: Metadata = {
  alternates: {
    canonical: '/categories'
  },
  description: 'Категории товаров Battletoads Shop с быстрым переходом в каталог по нужному разделу.',
  openGraph: {
    description:
      'Категории товаров Battletoads Shop с быстрым переходом в каталог по нужному разделу.',
    title: 'Категории товаров | Battletoads Shop'
  },
  title: 'Категории товаров'
}

export default async function CategoriesPage() {
  const categories = await categoriesApi.getCategories().catch(() => [])

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { href: '/', label: 'Главная' },
          { href: '/categories', label: 'Категории' }
        ]}
      />
      <CategoriesView categories={categories} />
    </>
  )
}
