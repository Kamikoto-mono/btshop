'use client'

import Image from 'next/image'
import Link from 'next/link'

import { YOUTUBE_ROGICH_URL, YOUTUBE_VAST_URL } from '@btshop/shared'

import youtubeIcon from '@assets/icons/youtube.svg'
import rogImage from '@assets/images/rog.png'
import vastImage from '@assets/images/vast.png'

import styles from './BloggersSection.module.scss'

const bloggers = [
  {
    description:
      'Обзоры, личный опыт и понятная подача для тех, кто следит за формой и результатом.',
    href: YOUTUBE_ROGICH_URL,
    image: rogImage,
    name: 'Игорь Рогич',
    views: '2 000 000+ просмотров'
  },
  {
    description:
      'Лфк, тренинг, реабилитация. Все что связано с телом и здоровьем.',
    href: YOUTUBE_VAST_URL,
    image: vastImage,
    name: 'Vast',
    views: '60 000+ просмотров'
  }
]

export const BloggersSection = () => (
  <section className={styles.section}>
    <h2 className={styles.title}>Блогеры рекомендуют</h2>

    <div className={styles.grid}>
      {bloggers.map((blogger) => (
        <Link
          className={styles.card}
          href={blogger.href}
          key={blogger.href}
          rel='noreferrer'
          target='_blank'
        >
          <div className={styles.cover}>
            <Image
              alt={blogger.name}
              className={styles.coverImage}
              fill
              sizes='(max-width: 900px) 100vw, 50vw'
              src={blogger.image}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.meta}>
              <strong className={styles.name}>{blogger.name}</strong>

              <span className={styles.iconBadge}>
                <Image alt='' aria-hidden='true' src={youtubeIcon} />
              </span>
            </div>

            <span className={styles.views}>{blogger.views}</span>
            <p className={styles.hint}>{blogger.description}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
)
