'use client'

import Image from 'next/image'

import { FRONT_ASSET_URLS } from '@btshop/shared'

import type { IProduct } from '@/api/products/model'
import anonymityIcon from '@assets/icons/adv-anonymity.svg'
import honestyIcon from '@assets/icons/adv-honesty.svg'
import reliabilityIcon from '@assets/icons/adv-reliability.svg'
import safetyIcon from '@assets/icons/adv-safety.svg'
import packageStackIcon from '@assets/icons/package-stack.svg'
import routeNodeIcon from '@assets/icons/route-node.svg'
import shieldCheckIcon from '@assets/icons/shield-check.svg'
import firstBanner from '@assets/images/banners/first-banner.webp'
import secondBanner from '@assets/images/banners/second-banner.webp'
import thirdBanner from '@assets/images/banners/third-banner.webp'
import fourthBanner from '@assets/images/banners/fouth-banner.webp'

import { BloggersSection, PopularProductsSection } from '@/components/home'
import { HomeReviewsSection } from '@/components/reviews'
import { Button, Eyebrow } from '@/components/ui'
import { useInViewOnce } from '@/shared/hooks/useInViewOnce'
import { BannersCarousel } from '../BannersCarousel/BannersCarousel'
import styles from './HomePage.module.scss'

const highlights = [
  {
    description: 'Стабильная работа с 2021 года.',
    icon: shieldCheckIcon,
    title: '5 лет работы магазина'
  },
  {
    description: 'Тысячи заказов доставлены довольным клиентам.',
    icon: packageStackIcon,
    title: '15 000+ отправленных заказов'
  },
  {
    description: 'Качественная фармакология от брендов с мировым именем.',
    icon: routeNodeIcon,
    title: 'Поставки от брендов с мировой известностью'
  }
]

const advantageItems = [
  {
    description:
      'Многолетний опыт честной работы помогает держать стабильный уровень сервиса.',
    icon: reliabilityIcon,
    title: 'Надёжность'
  },
  {
    description:
      'Структура разделов понятная, а информация о товаре подаётся прямо и без лишних обещаний.',
    icon: honestyIcon,
    title: 'Честность'
  },
  {
    description:
      'Ваши личные данные не будут раскрыты третьим лицам или использованы для целей, не связанных с покупкой.',
    icon: anonymityIcon,
    title: 'Анонимность'
  },
  {
    description:
      'Проектируем весь путь покупки так, чтобы он оставался спокойным, понятным и безопасным.',
    icon: safetyIcon,
    title: 'Безопасность'
  }
]

const banners = [
  {
    _id: 'banner-1',
    photo: firstBanner,
    position: 1,
    webUrl: '/market'
  },
  {
    _id: 'banner-2',
    photo: secondBanner,
    position: 2,
    webUrl: '/market'
  },
  {
    _id: 'banner-3',
    photo: thirdBanner,
    position: 3,
    webUrl: '/market'
  },
  {
    _id: 'banner-4',
    photo: fourthBanner,
    position: 4,
    webUrl: '/market'
  }
]

export const HomePage = ({
  popularProducts
}: {
  popularProducts: IProduct[]
}) => {
  const { isInView: isHeroInView, ref: heroRef } = useInViewOnce<HTMLElement>({
    threshold: 0.12
  })
  const { isInView: isAdvantagesInView, ref: advantagesRef } =
    useInViewOnce<HTMLElement>({
      threshold: 0.16
    })

  return (
    <div className={styles.page}>
      <BannersCarousel banners={banners} />

      <section
        className={`${styles.hero} ${styles.heroReveal} ${
          isHeroInView ? styles.heroVisible : ''
        }`}
        ref={heroRef}
      >
        <div className={styles.heroCopy}>
          <Eyebrow className={styles.eyebrow} dot>
            BATTLETOADS SHOP
          </Eyebrow>
          <h1>Твой проводник в мир фармакологии</h1>

          <div className={styles.highlightsList}>
            {highlights.map((item) => (
              <div className={styles.highlightItem} key={item.title}>
                <div className={styles.highlightIcon}>
                  <Image alt='' aria-hidden='true' src={item.icon} />
                </div>

                <div className={styles.highlightText}>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <Button className={styles.actionButton} href='/market' size='lg'>
              Перейти в магазин
            </Button>
            <Button
              className={styles.actionButton}
              href='/faq'
              size='lg'
              variant='outlined'
            >
              FAQ
            </Button>
          </div>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            alt='Battletoads showcase'
            className={styles.heroImage}
            height={960}
            sizes='(max-width: 900px) 0px, 370px'
            src={FRONT_ASSET_URLS.mainToads}
            width={960}
          />
        </div>
      </section>

      <section
        className={`${styles.section} ${styles.advantagesSection} ${
          styles.advantagesReveal
        } ${isAdvantagesInView ? styles.advantagesVisible : ''}`}
        ref={advantagesRef}
      >
        <div className={styles.advantagesIntro}>
          <div className={styles.sectionHeader}>
            <Eyebrow className={styles.eyebrow} dot>
              Почему выбирают нас
            </Eyebrow>
            <h2>Преимущества Battletoads Shop</h2>
          </div>
        </div>

        <div className={styles.advantagesGrid}>
          {advantageItems.map((item) => (
            <div className={styles.advantageItem} key={item.title}>
              <div className={styles.advantageIcon}>
                <Image alt='' aria-hidden='true' src={item.icon} />
              </div>

              <div className={styles.advantageContent}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BloggersSection />

      <PopularProductsSection products={popularProducts} />

      <HomeReviewsSection />
    </div>
  )
}
