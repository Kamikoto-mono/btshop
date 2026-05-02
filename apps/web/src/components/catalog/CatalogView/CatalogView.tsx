'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { FRONT_ASSET_URLS } from '@btshop/shared'

import chevronDownIcon from '@assets/icons/chevron-down.svg'

import type { ICategoryNode, ISubCategoryNode } from '@/api/categories/model'
import type { IProduct } from '@/api/products/model'
import type { IProductsListDto } from '@/api/products/types'
import {
  Breadcrumbs,
  Button,
  Input,
  type IBreadcrumbItem,
  ProductCard
} from '@/components/ui'
import { resolveCatalogPathByIds } from '@/lib/catalogSlugs'
import styles from './CatalogView.module.scss'

interface ICatalogViewProps {
  breadcrumbs: IBreadcrumbItem[]
  categories: ICategoryNode[]
  currentCategoryId?: string
  currentMaxPrice?: number
  currentMinPrice?: number
  currentPage: number
  currentSort?: 'priceAsc' | 'priceDesc'
  currentSubCategoryId?: string
  meta: IProductsListDto['meta']
  products: IProduct[]
  searchQuery?: string
  title: string
}

const buildVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
}

const buildPaginationItems = (pages: number[]) => {
  const items: Array<number | string> = []

  pages.forEach((page, index) => {
    const previous = pages[index - 1]

    if (typeof previous === 'number' && page - previous > 1) {
      items.push(`ellipsis-${previous}-${page}`)
    }

    items.push(page)
  })

  return items
}

const hasSelectedChild = (subCategory: ISubCategoryNode, currentSubCategoryId?: string) =>
  subCategory.childSubCategories.some((child) => child.id === currentSubCategoryId)

const getOpenedSubCategoryId = (
  categories: ICategoryNode[],
  currentSubCategoryId?: string
) => {
  for (const category of categories) {
    for (const subCategory of category.subCategories) {
      if (
        subCategory.id === currentSubCategoryId ||
        hasSelectedChild(subCategory, currentSubCategoryId)
      ) {
        return subCategory.id
      }
    }
  }

  return null
}

const getOpenedCategoryId = (
  categories: ICategoryNode[],
  currentCategoryId?: string,
  currentSubCategoryId?: string
) => {
  if (currentCategoryId) {
    return currentCategoryId
  }

  if (!currentSubCategoryId) {
    return null
  }

  for (const category of categories) {
    if (
      category.subCategories.some(
        (subCategory) =>
          subCategory.id === currentSubCategoryId ||
          hasSelectedChild(subCategory, currentSubCategoryId)
      )
    ) {
      return category.id
    }
  }

  return null
}

export const CatalogView = ({
  breadcrumbs,
  categories,
  currentCategoryId,
  currentMaxPrice,
  currentMinPrice,
  currentPage,
  currentSort,
  currentSubCategoryId,
  meta,
  products,
  searchQuery,
  title
}: ICatalogViewProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sortDropdownRef = useRef<HTMLDivElement | null>(null)
  const [minPriceInput, setMinPriceInput] = useState(
    currentMinPrice ? String(currentMinPrice) : ''
  )
  const [maxPriceInput, setMaxPriceInput] = useState(
    currentMaxPrice ? String(currentMaxPrice) : ''
  )
  const [openedCategoryId, setOpenedCategoryId] = useState<string | null>(() =>
    getOpenedCategoryId(categories, currentCategoryId, currentSubCategoryId)
  )
  const [openedSubCategoryId, setOpenedSubCategoryId] = useState<string | null>(() =>
    getOpenedSubCategoryId(categories, currentSubCategoryId)
  )
  const [sortOpened, setSortOpened] = useState(false)

  useEffect(() => {
    setMinPriceInput(currentMinPrice ? String(currentMinPrice) : '')
    setMaxPriceInput(currentMaxPrice ? String(currentMaxPrice) : '')
  }, [currentMaxPrice, currentMinPrice])

  useEffect(() => {
    setOpenedCategoryId(getOpenedCategoryId(categories, currentCategoryId, currentSubCategoryId))
    setOpenedSubCategoryId(getOpenedSubCategoryId(categories, currentSubCategoryId))
  }, [categories, currentCategoryId, currentSubCategoryId])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!sortDropdownRef.current?.contains(event.target as Node)) {
        setSortOpened(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const visiblePages = useMemo(
    () => buildVisiblePages(currentPage, meta.totalPages),
    [currentPage, meta.totalPages]
  )
  const paginationItems = useMemo(() => buildPaginationItems(visiblePages), [visiblePages])

  const pushWithParams = (
    updates: Record<string, string | undefined>,
    resetPage = true,
    pathnameOverride?: string
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    })

    if (resetPage) {
      nextParams.set('page', '1')
    }

    const query = nextParams.toString()
    const nextPathname = pathnameOverride ?? pathname

    router.push(query ? `${nextPathname}?${query}` : nextPathname, { scroll: false })
  }

  const handleCategorySelect = (categoryId?: string) => {
    setOpenedCategoryId(categoryId ?? null)
    setOpenedSubCategoryId(null)
    const nextPathname = resolveCatalogPathByIds(categories, {
      categoryId
    })

    pushWithParams({
      categoryId: undefined,
      subCategoryId: undefined
    }, true, nextPathname)
  }

  const handleSubCategorySelect = (categoryId: string, subCategoryId: string) => {
    setOpenedCategoryId(categoryId)
    const nextPathname = resolveCatalogPathByIds(categories, {
      categoryId,
      subCategoryId
    })

    pushWithParams({
      categoryId: undefined,
      subCategoryId: undefined
    }, true, nextPathname)
  }

  const handleSortChange = (value: string) => {
    setSortOpened(false)
    pushWithParams({
      sort: value || undefined
    })
  }

  const handleApplyPrice = () => {
    pushWithParams({
      maxPrice: maxPriceInput || undefined,
      minPrice: minPriceInput || undefined
    })
  }

  const handlePageChange = (page: number) => {
    pushWithParams({ page: String(page) }, false)
  }

  const handleToggleCategory = (categoryId: string) => {
    setOpenedCategoryId((current) => (current === categoryId ? null : categoryId))
    setOpenedSubCategoryId(null)
  }

  const handleToggleSubCategory = (subCategoryId: string) => {
    setOpenedSubCategoryId((current) => (current === subCategoryId ? null : subCategoryId))
  }

  const allProductsActive = !currentCategoryId && !currentSubCategoryId
  const currentSortLabel =
    currentSort === 'priceAsc'
      ? 'Цена: по возрастанию'
      : currentSort === 'priceDesc'
        ? 'Цена: по убыванию'
        : 'По умолчанию'

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      <section className={styles.shell}>
        <div className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
        </div>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <button
              className={allProductsActive ? styles.allProductsActive : styles.allProductsButton}
              onClick={() => handleCategorySelect(undefined)}
              type='button'
            >
              Все товары
            </button>

            {categories.map((category) => {
              const isCategoryOpened = openedCategoryId === category.id
              const isCategoryActive =
                currentCategoryId === category.id ||
                category.subCategories.some(
                  (subCategory) =>
                    subCategory.id === currentSubCategoryId ||
                    hasSelectedChild(subCategory, currentSubCategoryId)
                )

              return (
                <div className={styles.sidebarSection} key={category.id}>
                  <div className={styles.sectionHeader}>
                    <button
                      className={isCategoryActive ? styles.sidebarTitleActive : styles.sidebarTitle}
                      onClick={() => handleCategorySelect(category.id)}
                      type='button'
                    >
                      {category.name}
                    </button>

                    <button
                      aria-expanded={isCategoryOpened}
                      className={
                        isCategoryOpened ? styles.sectionToggleOpened : styles.sectionToggle
                      }
                      onClick={() => handleToggleCategory(category.id)}
                      type='button'
                    >
                      <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                    </button>
                  </div>

                  {isCategoryOpened ? (
                    <div className={styles.compounds}>
                      {category.subCategories.map((subCategory) => {
                        const isActive = currentSubCategoryId === subCategory.id
                        const hasChildren = subCategory.childSubCategories.length > 0
                        const hasSelectedNestedChild = hasSelectedChild(
                          subCategory,
                          currentSubCategoryId
                        )
                        const isOpened = openedSubCategoryId === subCategory.id

                        return (
                          <div
                            className={
                              isActive || hasSelectedNestedChild
                                ? hasChildren
                                  ? `${styles.compound} ${styles.compoundMarkedLine}`
                                  : `${styles.compound} ${styles.compoundMarkedDot}`
                                : styles.compound
                            }
                            key={subCategory.id}
                          >
                            <div className={styles.compoundHeader}>
                              <button
                                className={
                                  isActive || hasSelectedNestedChild
                                    ? styles.compoundActive
                                    : styles.compoundLink
                                }
                                onClick={() =>
                                  handleSubCategorySelect(category.id, subCategory.id)
                                }
                                type='button'
                              >
                                {subCategory.name}
                              </button>

                              {hasChildren ? (
                                <button
                                  aria-expanded={isOpened}
                                  className={
                                    isOpened
                                      ? styles.compoundToggleOpened
                                      : styles.compoundToggle
                                  }
                                  onClick={() => handleToggleSubCategory(subCategory.id)}
                                  type='button'
                                >
                                  <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                                </button>
                              ) : null}
                            </div>

                            {hasChildren ? (
                              <div
                                className={isOpened ? styles.lineListOpened : styles.lineListWrap}
                              >
                                <div className={styles.lineList}>
                                  {subCategory.childSubCategories.map((childSubCategory) => {
                                    const isChildActive =
                                      currentSubCategoryId === childSubCategory.id

                                    return (
                                      <button
                                        className={
                                          isChildActive
                                            ? styles.lineItemActive
                                            : styles.lineItem
                                        }
                                        key={childSubCategory.id}
                                        onClick={() =>
                                          handleSubCategorySelect(
                                            category.id,
                                            childSubCategory.id
                                          )
                                        }
                                        type='button'
                                      >
                                        {childSubCategory.name}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </aside>

          <section className={styles.main}>
            <div className={styles.toolbar}>
              <div className={styles.filterBlock}>
                <span>Цена</span>
                <div className={styles.priceRange}>
                  <Input
                    className={styles.priceInput}
                    inputMode='numeric'
                    onChange={(event) => setMinPriceInput(event.target.value)}
                    placeholder='От'
                    value={minPriceInput}
                  />
                  <Input
                    className={styles.priceInput}
                    inputMode='numeric'
                    onChange={(event) => setMaxPriceInput(event.target.value)}
                    placeholder='До'
                    value={maxPriceInput}
                  />
                  <Button
                    className={styles.applyButton}
                    onClick={handleApplyPrice}
                    variant='outlined'
                  >
                    Применить
                  </Button>
                </div>
              </div>

              <div className={`${styles.filterBlock} ${styles.sortBlock}`}>
                <span>Сортировка</span>
                <div className={styles.sortDropdown} ref={sortDropdownRef}>
                  <button
                    aria-expanded={sortOpened}
                    className={sortOpened ? styles.sortTriggerOpened : styles.sortTrigger}
                    onClick={() => setSortOpened((current) => !current)}
                    type='button'
                  >
                    <span>{currentSortLabel}</span>
                    <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                  </button>

                  {sortOpened ? (
                    <div className={styles.sortMenu}>
                      <button
                        className={!currentSort ? styles.sortOptionActive : styles.sortOption}
                        onClick={() => handleSortChange('')}
                        type='button'
                      >
                        По умолчанию
                      </button>
                      <button
                        className={
                          currentSort === 'priceAsc'
                            ? styles.sortOptionActive
                            : styles.sortOption
                        }
                        onClick={() => handleSortChange('priceAsc')}
                        type='button'
                      >
                        Цена: по возрастанию
                      </button>
                      <button
                        className={
                          currentSort === 'priceDesc'
                            ? styles.sortOptionActive
                            : styles.sortOption
                        }
                        onClick={() => handleSortChange('priceDesc')}
                        type='button'
                      >
                        Цена: по убыванию
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <div className={styles.grid}>
                  {products.map((product) => (
                    <ProductCard className={styles.card} key={product.id} product={product} />
                  ))}
                </div>

                {meta.totalPages > 1 ? (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageButton}
                      disabled={!meta.hasPrevPage}
                      onClick={() => handlePageChange(currentPage - 1)}
                      type='button'
                    >
                      Назад
                    </button>

                    <div className={styles.pageList}>
                      {paginationItems.map((item) =>
                        typeof item === 'number' ? (
                          <button
                            className={
                              item === currentPage
                                ? `${styles.pageButton} ${styles.pageButtonActive}`
                                : styles.pageButton
                            }
                            key={item}
                            onClick={() => handlePageChange(item)}
                            type='button'
                          >
                            {item}
                          </button>
                        ) : (
                          <span aria-hidden='true' className={styles.ellipsis} key={item}>
                            ...
                          </span>
                        )
                      )}
                    </div>

                    <button
                      className={styles.pageButton}
                      disabled={!meta.hasNextPage}
                      onClick={() => handlePageChange(currentPage + 1)}
                      type='button'
                    >
                      Вперёд
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyState}>
                <Image
                  alt=''
                  aria-hidden='true'
                  height={560}
                  src={FRONT_ASSET_URLS.btEmptyCard}
                  width={560}
                />
                <p>{searchQuery ? 'По запросу ничего не найдено' : 'Нет товаров'}</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  )
}
