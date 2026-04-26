'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import {
  getCategories,
  getLineCount,
  type IProduct
} from '@btshop/shared'

import chevronDownIcon from '@assets/icons/chevron-down.svg'
import emptyCartImage from '@assets/images/bt-empty-card.png'

import { Breadcrumbs, type IBreadcrumbItem, ProductCard } from '@/components/ui'
import { getCompoundHref, getLineHref } from '@/lib/routes'
import styles from './CatalogView.module.scss'

interface ICatalogViewProps {
  title: string
  description: string
  products: IProduct[]
  breadcrumbs: IBreadcrumbItem[]
  activeCategorySlug?: string
  activeCompoundSlug?: string
  activeLineSlug?: string
  searchQuery?: string
}

export const CatalogView = ({
  products,
  breadcrumbs,
  activeCategorySlug,
  activeCompoundSlug,
  activeLineSlug,
  searchQuery
}: ICatalogViewProps) => {
  const categories = getCategories()
  const [openedCompounds, setOpenedCompounds] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      categories.flatMap((category) =>
        category.compounds.map((compound) => [
          `${category.slug}:${compound.slug}`,
          activeCategorySlug === category.slug && activeCompoundSlug === compound.slug
        ])
      )
    )
  )

  const handleCompoundToggle = (categorySlug: string, compoundSlug: string) => {
    const key = `${categorySlug}:${compoundSlug}`

    setOpenedCompounds((current) => ({
      ...current,
      [key]: !current[key]
    }))
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          {categories.map((category) => {
            const isCategoryActive = activeCategorySlug === category.slug

            return (
              <div className={styles.sidebarSection} key={category.slug}>
                <div className={styles.sidebarTitle}>{category.name}</div>

                <div className={styles.compounds}>
                  {category.compounds.map((compound) => {
                    const isActive =
                      isCategoryActive && activeCompoundSlug === compound.slug
                    const compoundKey = `${category.slug}:${compound.slug}`
                    const isOpened = openedCompounds[compoundKey]

                    return (
                      <div className={styles.compound} key={compound.slug}>
                        <div className={styles.compoundHeader}>
                          <Link
                            className={isActive ? styles.compoundActive : styles.compoundLink}
                            href={getCompoundHref(category.slug, compound.slug)}
                          >
                            {compound.name}
                          </Link>

                          <button
                            aria-expanded={isOpened}
                            aria-label={`${isOpened ? 'Скрыть' : 'Показать'} подкатегории ${compound.name}`}
                            className={
                              isOpened ? styles.compoundToggleOpened : styles.compoundToggle
                            }
                            onClick={() =>
                              handleCompoundToggle(category.slug, compound.slug)
                            }
                            type='button'
                          >
                            <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                          </button>
                        </div>

                        <div className={isOpened ? styles.lineListOpened : styles.lineListWrap}>
                          <div className={styles.lineList}>
                            {compound.lines.map((line) => {
                              const isLineActive =
                                isActive && activeLineSlug === line.slug

                              return (
                                <Link
                                  className={
                                    isLineActive ? styles.lineItemActive : styles.lineItem
                                  }
                                  href={getLineHref(category.slug, compound.slug, line.slug)}
                                  key={line.slug}
                                >
                                  {line.name} (
                                  {getLineCount(category.slug, compound.slug, line.slug)})
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </aside>

        <section className={styles.gridSection}>
          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard
                  artworkMeta={product.volume}
                  className={styles.card}
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Image alt='' aria-hidden='true' src={emptyCartImage} />
              <p>{searchQuery ? 'По запросу ничего не найдено' : 'Нет товаров'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
