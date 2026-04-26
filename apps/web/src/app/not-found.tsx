import Link from 'next/link'

import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <section className={styles.page}>
      <p className={styles.eyebrow}>404</p>
      <h1>Страница не найдена</h1>
      <p>Похоже, такой URL не существует в текущем mock-каталоге.</p>
      <Link href='/market'>Вернуться в магазин</Link>
    </section>
  )
}
