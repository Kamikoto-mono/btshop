'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import cartIcon from '@assets/icons/cart.svg'
import logoIcon from '@assets/icons/logo.svg'
import profileIcon from '@assets/icons/profile.svg'

import { openAuthModal } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { HeaderSearch } from './HeaderSearch/HeaderSearch'
import styles from './Header.module.scss'

const navigationItems = [
  {
    href: '/',
    label: 'Главная'
  },
  {
    href: '/market',
    label: 'Магазин'
  }
]

export const Header = () => {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(true)
  const [showMobileBackground, setShowMobileBackground] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { totalCount, userEmail } = useAppSelector((state) => ({
    totalCount: state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    userEmail: state.auth.user?.email ?? ''
  }))

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 650) {
        return
      }

      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        setIsMobileSearchVisible(true)
        setShowMobileBackground(false)
        setLastScrollY(currentScrollY)
        return
      }

      const difference = Math.abs(currentScrollY - lastScrollY)

      if (difference > 5) {
        if (currentScrollY > lastScrollY) {
          setIsMobileSearchVisible(false)
        } else {
          setIsMobileSearchVisible(true)
          setShowMobileBackground(true)
        }
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className={styles.header}>
      <div className={styles.mainBar}>
        <div className={styles.container}>
          <Link className={styles.logo} href='/'>
            <Image alt='BTSHOP' priority src={logoIcon} />
          </Link>

          <Suspense fallback={<div className={styles.searchFallback} />}>
            <HeaderSearch />
          </Suspense>

          <nav className={styles.nav}>
            {navigationItems.map((item) => (
              <Link
                className={pathname === item.href ? styles.activeLink : styles.link}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              aria-label='Авторизация'
              className={
                pathname === '/profile' || userEmail
                  ? styles.iconButtonActive
                  : styles.iconButton
              }
              onClick={() => dispatch(openAuthModal('login'))}
              type='button'
            >
              <Image alt='' aria-hidden='true' src={profileIcon} />
            </button>

            <Link
              aria-label='Корзина'
              className={pathname === '/cart' ? styles.iconButtonActive : styles.iconButton}
              href='/cart'
            >
              <Image alt='' aria-hidden='true' src={cartIcon} />
              {totalCount > 0 ? <span className={styles.counter}>{totalCount}</span> : null}
            </Link>
          </div>
        </div>
      </div>

      <div
        className={
          showMobileBackground
            ? `${styles.mobileSearchBar} ${styles.mobileSearchBarBackground}`
            : styles.mobileSearchBar
        }
        style={{
          transform: isMobileSearchVisible ? 'translateY(0)' : 'translateY(-120%)'
        }}
      >
        <div className={styles.mobileSearchInner}>
          <Suspense fallback={<div className={styles.mobileSearchFallback} />}>
            <HeaderSearch mobile />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
