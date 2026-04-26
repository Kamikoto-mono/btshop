'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { formatCurrency } from '@btshop/shared'

import emptyCartImage from '@assets/images/bt-empty-card.png'

import { Breadcrumbs, Button } from '@/components/ui'
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CartPage.module.scss'

export const CartPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const hasItems = items.length > 0

  const handlePromoApply = () => {
    setPromoMessage(
      promoCode.trim()
        ? `Промокод "${promoCode.trim()}" сохранен как mock-примененный.`
        : 'Введите промокод.'
    )
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { href: '/', label: 'Главная' },
          { label: 'Корзина' }
        ]}
      />

      <section className={styles.shell}>
        <div className={styles.headerRow}>
                    <button className={styles.backButton} onClick={() => router.back()} type='button'>
              ← Назад
            </button></div>
        <div className={styles.header}>
          <div>

            <h1>Корзина</h1>
          </div>
        </div>

        {hasItems ? (
          <>
            <div className={styles.tableHeader}>
              <span>Товар</span>
              <span>Цена</span>
              <span>Кол-во</span>
              <span>Сумма</span>
              <span />
            </div>

            <div className={styles.itemsList}>
              {items.map((item) => (
                <article className={styles.itemRow} key={item.product.id}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemImage}>
                      <span>{item.product.brand}</span>
                    </div>
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>{item.product.categoryName} / {item.product.compoundName}</p>
                    </div>
                  </div>

                  <span className={styles.price}>{formatCurrency(item.product.price)}</span>

                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => dispatch(decreaseQuantity(item.product.id))}
                      type='button'
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => dispatch(increaseQuantity(item.product.id))}
                      type='button'
                    >
                      +
                    </button>
                  </div>

                  <strong className={styles.itemTotal}>
                    {formatCurrency(item.product.price * item.quantity)}
                  </strong>

                  <button
                    aria-label={`Удалить ${item.product.name}`}
                    className={styles.removeButton}
                    onClick={() => dispatch(removeItem(item.product.id))}
                    type='button'
                  >
                    ×
                  </button>
                </article>
              ))}
            </div>

            <div className={styles.promoBlock}>
              <input
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder='промокод'
                value={promoCode}
              />
              <Button onClick={handlePromoApply} type='button' variant='outlined'>
                применить
              </Button>
            </div>

            {promoMessage ? <p className={styles.promoMessage}>{promoMessage}</p> : null}

            <div className={styles.summaryCard}>
              <strong>Итого: {formatCurrency(totalPrice)}</strong>
              <p>Минимальный заказ от 5 000 руб.</p>
              <Button className={styles.summaryAction} href='/checkout' size='lg'>
                Оформить заказ
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Image alt='' aria-hidden='true' src={emptyCartImage} />
            <p>На данный момент в корзине нет товаров</p>
            <Button href='/market' size='lg'>
              Перейти в магазин
            </Button>
          </div>
        )}

        <Link className={styles.marketLink} href='/market'>
          Продолжить покупки
        </Link>
      </section>
    </div>
  )
}
