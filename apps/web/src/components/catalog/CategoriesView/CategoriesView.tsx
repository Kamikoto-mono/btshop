'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import chevronDownIcon from '@assets/icons/chevron-down.svg'

import type { ICategoryNode, ISubCategoryNode } from '@/api/categories/model'
import { Breadcrumbs, Eyebrow } from '@/components/ui'
import { getMarketHref } from '@/lib/routes'
import styles from './CategoriesView.module.scss'

const hasChildren = (subCategory: ISubCategoryNode) =>
  subCategory.childSubCategories.length > 0

export const CategoriesView = ({
  categories
}: {
  categories: ICategoryNode[]
}) => {
  const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(null)
  const [openedSubCategoryIds, setOpenedSubCategoryIds] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setOpenedCategoryId((current) => (current === categoryId ? null : categoryId))
  }

  const toggleSubCategory = (subCategoryId: string) => {
    setOpenedSubCategoryIds((current) =>
      current.includes(subCategoryId)
        ? current.filter((item) => item !== subCategoryId)
        : [...current, subCategoryId]
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          {
            href: '/',
            label: 'Главная'
          },
          {
            label: 'Категории'
          }
        ]}
      />

      <section className={styles.content}>
        <div className={styles.header}>
          <Eyebrow className={styles.eyebrow}>Каталог</Eyebrow>
        </div>

        <div className={styles.tree}>
          {categories.map((category) => {
            const isOpened = openedCategoryId === category.id

            return (
              <section className={styles.section} key={category.id}>
                <div className={styles.sectionHeader}>
                  <Link
                    className={styles.sectionLink}
                    href={getMarketHref({
                      categoryId: category.id
                    })}
                  >
                    <span>{category.name}</span>
                    <small>{category.productsInStockCount}</small>
                  </Link>

                  <button
                    aria-expanded={isOpened}
                    className={isOpened ? styles.sectionToggleOpened : styles.sectionToggle}
                    onClick={() => toggleCategory(category.id)}
                    type='button'
                  >
                    <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                  </button>
                </div>

                <div className={isOpened ? styles.sectionBodyOpened : styles.sectionBody}>
                  <div className={styles.subList}>
                    {category.subCategories.map((subCategory) => {
                      const subOpened = openedSubCategoryIds.includes(subCategory.id)
                      const subHasChildren = hasChildren(subCategory)

                      return (
                    <div
                      className={
                        subHasChildren
                          ? styles.subItem
                          : `${styles.subItem} ${styles.subItemAligned}`
                      }
                      key={subCategory.id}
                    >
                          <div className={styles.subHeader}>
                            <Link
                              className={styles.subLink}
                              href={getMarketHref({
                                categoryId: category.id,
                                subCategoryId: subCategory.id
                              })}
                            >
                              <span>{subCategory.name}</span>
                              <small>{subCategory.productsInStockCount}</small>
                            </Link>

                            {subHasChildren ? (
                              <button
                                aria-expanded={subOpened}
                                className={
                                  subOpened ? styles.subToggleOpened : styles.subToggle
                                }
                                onClick={() => toggleSubCategory(subCategory.id)}
                                type='button'
                              >
                                <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                              </button>
                            ) : null}
                          </div>

                          {subHasChildren ? (
                            <div className={subOpened ? styles.childListOpened : styles.childList}>
                              <div className={styles.childListInner}>
                                {subCategory.childSubCategories.map((childSubCategory) => (
                                  <Link
                                    className={styles.childLink}
                                    href={getMarketHref({
                                      categoryId: category.id,
                                      subCategoryId: childSubCategory.id
                                    })}
                                    key={childSubCategory.id}
                                  >
                                    <span>{childSubCategory.name}</span>
                                    <small>{childSubCategory.productsInStockCount}</small>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </section>
    </div>
  )
}
