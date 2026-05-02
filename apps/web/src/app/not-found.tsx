import Image from 'next/image'
import Link from 'next/link'

import { FRONT_ASSET_URLS } from '@btshop/shared'

import { Eyebrow } from '@/components/ui'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <section className={styles.page}>
      <div className={styles.backgroundArtwork} aria-hidden='true'>
        <Image alt='' height={560} src={FRONT_ASSET_URLS.btEmptyCard} width={560} />
      </div>

      <Eyebrow className={styles.eyebrow}>404</Eyebrow>
      <h1>Страница не найдена</h1>
      <p>
        Похоже, такого адреса у нас нет. Вернитесь в магазин или откройте главную
        страницу.
      </p>
      <div className={styles.actions}>
        <Link href='/market'>Вернуться в магазин</Link>
        <Link className={styles.secondaryAction} href='/'>
          На главную
        </Link>
      </div>
    </section>
  )
}
