import Image from 'next/image'
import Link from 'next/link'

import { TELEGRAM_CHAT_URL, TELEGRAM_OPERATOR_URL } from '@btshop/shared'

import logoIcon from '@assets/icons/logo.svg'
import mastercardIcon from '@assets/icons/mastercard-footer.svg'
import sbpIcon from '@assets/icons/sbp-footer.svg'
import telegramIcon from '@assets/icons/telegram.svg'
import usdtIcon from '@assets/icons/usdt-footer.svg'
import visaIcon from '@assets/icons/visa-footer.svg'

import styles from './Footer.module.scss'

export const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <Link className={styles.logo} href='/'>
        <Image alt='BTSHOP' src={logoIcon} />
      </Link>

      <div className={styles.navGroup}>
        <p className={styles.groupTitle}>Страницы</p>
        <Link href='/'>Главная</Link>
        <Link href='/market'>Магазин</Link>
      </div>

      <div className={styles.navGroup}>
        <p className={styles.groupTitle}>Информация</p>
        <Link href='/faq'>FAQ</Link>
        <Link href='/reviews'>Отзывы</Link>
      </div>

      <div className={styles.navGroup}>
        <p className={styles.groupTitle}>Контакты</p>

        <Link className={styles.contactLink} href={TELEGRAM_OPERATOR_URL}>
          <Image alt='' aria-hidden='true' src={telegramIcon} />
          <span>Оператор</span>
        </Link>

        <Link className={styles.contactLink} href={TELEGRAM_CHAT_URL}>
          <Image alt='' aria-hidden='true' src={telegramIcon} />
          <span>Чат</span>
        </Link>
      </div>
    </div>

    <div className={styles.bottomBar}>
      <div className={styles.bottomInner}>
        <p className={styles.copyright}>© Battletoads Shop, 2026.</p>

        <div className={styles.paymentMethods} aria-label='Способы оплаты'>
          <Image alt='СБП' src={sbpIcon} />
          <Image alt='Visa' src={visaIcon} />
          <Image alt='Mastercard' src={mastercardIcon} />
          <Image alt='USDT TRC-20' src={usdtIcon} />
        </div>
      </div>
    </div>
  </footer>
)
