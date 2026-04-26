'use client'

import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import closeIcon from '@assets/icons/close.svg'
import searchIcon from '@assets/icons/search.svg'

import { debounce } from '@/shared/utils'
import styles from './HeaderSearch.module.scss'

const SEARCH_DELAY = 350

const isCatalogRoute = (pathname: string) =>
  pathname === '/market' || /^\/[^/]+\/[^/]+(?:\/[^/]+)?$/.test(pathname)

export const HeaderSearch = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

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

  const debouncedApplySearch = useMemo(
    () => debounce((nextValue: string) => applySearch(nextValue), SEARCH_DELAY),
    [pathname, router, searchParams]
  )

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    debouncedApplySearch(value)

    return () => {
      debouncedApplySearch.cancel()
    }
  }, [debouncedApplySearch, value])

  const handleReset = () => {
    debouncedApplySearch.cancel()
    setValue('')
    applySearch('')
  }

  const handleSubmit = () => {
    debouncedApplySearch.cancel()
    applySearch(value)
  }

  return (
    <div className={mobile ? `${styles.wrapper} ${styles.mobileWrapper}` : styles.wrapper}>
      <Image alt='' aria-hidden='true' className={styles.searchIcon} src={searchIcon} />
      <input
        className={mobile ? `${styles.input} ${styles.mobileInput}` : styles.input}
        onChange={(event) => setValue(event.target.value)}
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
    </div>
  )
}
