import Link from 'next/link'

import { Eyebrow } from '@/components/ui'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <section className={styles.page}>
      <Eyebrow className={styles.eyebrow}>404</Eyebrow>
      <h1>Страница не найдена</h1>
      <p>Похоже, такой URL не существует в текущем mock-каталоге.</p>
      <Link href='/market'>Вернуться в магазин</Link>
    </section>
  )
}
