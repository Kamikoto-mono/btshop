'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import {
  formatCurrency,
  getCategories,
  getLineCount,
  IProduct
} from '@btshop/shared'

import chevronDownIcon from '@assets/icons/chevron-down.svg'
import emptyCartImage from '@assets/images/bt-empty-card.png'

import { AddToCartButton } from '@/components/cart'
import { Breadcrumbs, IBreadcrumbItem, ProductArtwork } from '@/components/ui'
import { getProductCardImage } from '@/lib/productImages'
import { getCompoundHref, getLineHref, getProductHref } from '@/lib/routes'
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

                        <div
                          className={isOpened ? styles.lineListOpened : styles.lineListWrap}
                        >
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
                                  {line.name} ({getLineCount(category.slug, compound.slug, line.slug)})
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
                <article className={styles.card} key={product.id}>
                  <Link href={getProductHref(product)}>
                    <ProductArtwork
                      imageSrc={getProductCardImage(product)}
                      label={`${product.brand} • ${product.volume}`}
                    />
                  </Link>

                  <div className={styles.cardBody}>
                    <div>
                      <p className={styles.cardMeta}>
                        {product.categoryName} / {product.compoundName}
                      </p>
                      <Link className={styles.cardTitle} href={getProductHref(product)}>
                        {product.name}
                      </Link>
                      <p className={styles.cardDescription}>{product.shortDescription}</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <strong>{formatCurrency(product.price)}</strong>
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </article>
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
