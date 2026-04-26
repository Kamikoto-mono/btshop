'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

import cartIcon from '@assets/icons/mobile-cart.svg'
import catalogIcon from '@assets/icons/mobile-catalog.svg'
import homeIcon from '@assets/icons/mobile-home.svg'
import profileIcon from '@assets/icons/mobile-profile.svg'

import { openAuthModal } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './MobileTabs.module.scss'

export const MobileTabs = () => {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { cartCount, userEmail } = useAppSelector((state) => ({
    cartCount: state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
    userEmail: state.auth.user?.email ?? ''
  }))

  const isCatalogPath = () => {
    if (pathname === '/market' || pathname === '/categories') {
      return true
    }

    if (
      pathname === '/cart' ||
      pathname === '/checkout' ||
      pathname === '/faq' ||
      pathname === '/reviews' ||
      pathname === '/profile'
    ) {
      return false
    }

    return pathname !== '/'
  }

  const tabs = [
    {
      icon: homeIcon,
      isActive: pathname === '/',
      label: 'Главная',
      onClick: () => router.push('/')
    },
    {
      icon: catalogIcon,
      isActive: isCatalogPath(),
      label: 'Каталог',
      onClick: () => router.push('/categories')
    },
    {
      badge: cartCount > 0 ? cartCount : null,
      icon: cartIcon,
      isActive: pathname === '/cart' || pathname === '/checkout',
      label: 'Корзина',
      onClick: () => router.push('/cart')
    },
    {
      icon: profileIcon,
      isActive: pathname.startsWith('/profile'),
      label: 'Профиль',
      onClick: () => {
        if (userEmail) {
          router.push('/profile')
          return
        }

        dispatch(openAuthModal('login'))
      }
    }
  ]

  return (
    <div className={styles.container}>
      {tabs.map((tab) => (
        <button
          className={tab.isActive ? `${styles.tab} ${styles.active}` : styles.tab}
          key={tab.label}
          onClick={tab.onClick}
          type='button'
        >
          <span className={styles.iconWrapper}>
            <Image alt='' aria-hidden='true' height={24} src={tab.icon} width={24} />
            {tab.badge ? <span className={styles.badge}>{tab.badge}</span> : null}
          </span>
          <span className={styles.text}>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
