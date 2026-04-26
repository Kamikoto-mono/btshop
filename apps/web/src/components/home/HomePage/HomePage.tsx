'use client'

import Image from 'next/image'

import anonymityIcon from '@assets/icons/adv-anonymity.svg'
import honestyIcon from '@assets/icons/adv-honesty.svg'
import reliabilityIcon from '@assets/icons/adv-reliability.svg'
import safetyIcon from '@assets/icons/adv-safety.svg'
import packageStackIcon from '@assets/icons/package-stack.svg'
import routeNodeIcon from '@assets/icons/route-node.svg'
import shieldCheckIcon from '@assets/icons/shield-check.svg'
import balkanBanner from '@assets/images/balkan-pharmaceuticals-banner.png'
import canadabiolabsBanner from '@assets/images/canadabiolabs-banner.png'
import mainToadsImage from '@assets/images/main-toads.png'
import spLaboratoriesBanner from '@assets/images/sp-laboratories-banner.png'
import zphcBanner from '@assets/images/zphc-banner.png'

import { HomeReviewsSection } from '@/components/reviews'
import { Button, StatusDot } from '@/components/ui'
import { useInViewOnce } from '@/shared/hooks/useInViewOnce'
import { BannersCarousel } from '../BannersCarousel/BannersCarousel'
import { PopularProductsSection } from '../PopularProductsSection/PopularProductsSection'
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
    description: 'Качественная фармакология для высоких спортивных результатов.',
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
    _id: 'balkan-pharmaceuticals',
    photo: balkanBanner,
    position: 1,
    webUrl: '/market'
  },
  {
    _id: 'canadabiolabs',
    photo: canadabiolabsBanner,
    position: 2,
    webUrl: '/market'
  },
  {
    _id: 'sp-laboratories',
    photo: spLaboratoriesBanner,
    position: 3,
    webUrl: '/market'
  },
  {
    _id: 'zphc',
    photo: zphcBanner,
    position: 4,
    webUrl: '/market'
  }
]

export const HomePage = () => {
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
          <p className={styles.eyebrow}>
            <StatusDot />
            BATTLETOADS SHOP
          </p>
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
            priority
            src={mainToadsImage}
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
            <p className={styles.eyebrow}>
              <StatusDot />
              Почему выбирают нас
            </p>
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

      <PopularProductsSection />

      <HomeReviewsSection />
    </div>
  )
}
