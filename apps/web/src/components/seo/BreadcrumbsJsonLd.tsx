import type { IBreadcrumbItem } from '@/components/ui'
import { getAbsoluteUrl } from '@/shared/seo/utils'

export const BreadcrumbsJsonLd = ({
  items
}: {
  items: IBreadcrumbItem[]
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: getAbsoluteUrl(item.href ?? '/'),
      name: item.label,
      position: index + 1
    }))
  }

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      type='application/ld+json'
    />
  )
}
