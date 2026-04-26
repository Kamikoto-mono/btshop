import Image from 'next/image'
import Link from 'next/link'

import homeIcon from '@assets/icons/mobile-home.svg'

import styles from './Breadcrumbs.module.scss'

export interface IBreadcrumbItem {
  href?: string
  label: string
}

export const Breadcrumbs = ({ items }: { items: IBreadcrumbItem[] }) => (
  <nav aria-label='Хлебные крошки' className={styles.wrapper}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1
      const isHome = index === 0 && item.href === '/'
      const content = isHome ? (
        <Image alt='' aria-hidden='true' src={homeIcon} />
      ) : (
        item.label
      )

      return (
        <span className={styles.item} key={`${item.label}-${index}`}>
          {item.href && !isLast ? (
            <Link
              aria-label={isHome ? 'Главная' : undefined}
              className={isHome ? styles.homeLink : undefined}
              href={item.href}
            >
              {content}
            </Link>
          ) : (
            <span className={isHome ? styles.homeCurrent : styles.current}>
              {content}
            </span>
          )}

          {!isLast ? <span className={styles.separator}>&gt;</span> : null}
        </span>
      )
    })}
  </nav>
)
