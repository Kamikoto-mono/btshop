'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { formatCurrency, FRONT_ASSET_URLS } from '@btshop/shared'

import { productsApi } from '@/api/products'
import type { IProduct } from '@/api/products/model'
import closeIcon from '@assets/icons/close.svg'
import searchIcon from '@assets/icons/search.svg'

import { getProductHref } from '@/lib/routes'
import styles from './HeaderSearch.module.scss'

const SEARCH_DELAY = 350
const SEARCH_RESULTS_LIMIT = 8

const isCatalogRoute = (pathname: string) =>
  pathname === '/market' || /^\/[^/]+\/[^/]+(?:\/[^/]+)?$/.test(pathname)

export const HeaderSearch = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const applySearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchProductsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<IProduct[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const trimmedValue = value.trim()

  const applySearch = (query: string) => {
    const currentQuery = searchParams.get('q') ?? ''
    const nextQuery = query.trim()

    if (!nextQuery && !isCatalogRoute(pathname)) {
      return
    }

    if (nextQuery === currentQuery && isCatalogRoute(pathname)) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (nextQuery) {
      params.set('q', nextQuery)
    } else {
      params.delete('q')
    }

    const nextPath = isCatalogRoute(pathname) ? pathname : '/market'
    const nextUrl = params.toString() ? `${nextPath}?${params}` : nextPath

    router.replace(nextUrl, { scroll: false })
  }

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    if (applySearchTimeoutRef.current) {
      clearTimeout(applySearchTimeoutRef.current)
      applySearchTimeoutRef.current = null
    }

    if (!isCatalogRoute(pathname)) {
      return
    }

    applySearchTimeoutRef.current = setTimeout(() => {
      applySearch(value)
    }, SEARCH_DELAY)

    return () => {
      if (applySearchTimeoutRef.current) {
        clearTimeout(applySearchTimeoutRef.current)
        applySearchTimeoutRef.current = null
      }
    }
  }, [pathname, searchParams, value])

  useEffect(() => {
    if (searchProductsTimeoutRef.current) {
      clearTimeout(searchProductsTimeoutRef.current)
      searchProductsTimeoutRef.current = null
    }

    if (!isFocused || !trimmedValue) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      return
    }

    searchProductsTimeoutRef.current = setTimeout(async () => {
      const normalizedQuery = trimmedValue.trim()

      if (!normalizedQuery) {
        setResults([])
        setHasSearched(false)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const response = await productsApi.searchProducts({
          limit: SEARCH_RESULTS_LIMIT,
          query: normalizedQuery
        })

        setResults(response.items)
      } catch {
        setResults([])
      } finally {
        setHasSearched(true)
        setIsLoading(false)
      }
    }, 250)

    return () => {
      if (searchProductsTimeoutRef.current) {
        clearTimeout(searchProductsTimeoutRef.current)
        searchProductsTimeoutRef.current = null
      }
    }
  }, [isFocused, trimmedValue])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const handleReset = () => {
    if (applySearchTimeoutRef.current) {
      clearTimeout(applySearchTimeoutRef.current)
      applySearchTimeoutRef.current = null
    }

    if (searchProductsTimeoutRef.current) {
      clearTimeout(searchProductsTimeoutRef.current)
      searchProductsTimeoutRef.current = null
    }

    setValue('')
    setResults([])
    setHasSearched(false)
    applySearch('')
  }

  const handleSubmit = () => {
    if (applySearchTimeoutRef.current) {
      clearTimeout(applySearchTimeoutRef.current)
      applySearchTimeoutRef.current = null
    }

    if (searchProductsTimeoutRef.current) {
      clearTimeout(searchProductsTimeoutRef.current)
      searchProductsTimeoutRef.current = null
    }

    setIsFocused(false)
    applySearch(value)
  }

  const handleProductSelect = () => {
    if (applySearchTimeoutRef.current) {
      clearTimeout(applySearchTimeoutRef.current)
      applySearchTimeoutRef.current = null
    }

    if (searchProductsTimeoutRef.current) {
      clearTimeout(searchProductsTimeoutRef.current)
      searchProductsTimeoutRef.current = null
    }

    setIsFocused(false)
  }

  const isDropdownVisible = isFocused && Boolean(trimmedValue)

  return (
    <div
      className={mobile ? `${styles.wrapper} ${styles.mobileWrapper}` : styles.wrapper}
      ref={wrapperRef}
    >
      <Image alt='' aria-hidden='true' className={styles.searchIcon} src={searchIcon} />
      <input
        className={mobile ? `${styles.input} ${styles.mobileInput}` : styles.input}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            handleSubmit()
          }

          if (event.key === 'Escape') {
            setIsFocused(false)
          }
        }}
        placeholder='Искать на BattleToads'
        type='text'
        value={value}
      />

      {!mobile && value ? (
        <button
          aria-label='Сбросить поиск'
          className={styles.resetButton}
          onClick={handleReset}
          type='button'
        >
          <Image alt='' aria-hidden='true' src={closeIcon} />
        </button>
      ) : null}

      {mobile ? (
        <button
          aria-label='Искать'
          className={styles.mobileSubmit}
          onClick={handleSubmit}
          type='button'
        >
          <Image alt='' aria-hidden='true' src={searchIcon} />
        </button>
      ) : null}

      {isDropdownVisible ? (
        <div className={mobile ? `${styles.dropdown} ${styles.mobileDropdown}` : styles.dropdown}>
          {isLoading ? (
            <div className={styles.stateBlock}>
              <p className={styles.stateTitle}>Ищем товары...</p>
            </div>
          ) : results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((product, index) => (
                <Link
                  className={styles.resultItem}
                  href={getProductHref(product)}
                  key={product.id}
                  onClick={handleProductSelect}
                >
                  <div className={styles.resultImage}>
                    {product.photo ? (
                      <Image
                        alt={product.name}
                        className={styles.resultPhoto}
                        fill
                        sizes='64px'
                        src={product.photo}
                      />
                    ) : (
                      <div className={styles.resultImageFallback}>{product.brand}</div>
                    )}
                  </div>

                  <div className={styles.resultContent}>
                    <span className={styles.resultName}>{product.name}</span>
                    <span className={styles.resultPrice}>{formatCurrency(product.price)}</span>
                  </div>

                  {index < results.length - 1 ? (
                    <span aria-hidden='true' className={styles.resultDivider} />
                  ) : null}
                </Link>
              ))}
            </div>
          ) : hasSearched ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyArtwork} aria-hidden='true'>
                <Image
                  alt=''
                  height={180}
                  src={FRONT_ASSET_URLS.btEmptyCard}
                  width={180}
                />
              </div>
              <p className={styles.stateTitle}>Поиск не дал результатов</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
