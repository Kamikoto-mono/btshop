'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'

import { formatCurrency } from '@btshop/shared'

import emptyCartImage from '@assets/images/bt-empty-card.png'

import {
  createMockOrder,
  mockProfile,
  ORDER_STORAGE_KEY,
  PROFILE_STORAGE_KEY
} from '@/mocks'
import { Button, Modal } from '@/components/ui'
import {
  clearCart,
  closeCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CartModal.module.scss'

export const CartModal = () => {
  const dispatch = useAppDispatch()
  const { isCartOpen, items } = useAppSelector((state) => ({
    isCartOpen: state.cart.isOpen,
    items: state.cart.items
  }))

  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [telegram, setTelegram] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  useEffect(() => {
    const profile = window.localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!profile) {
      setFullName(mockProfile.fullName ?? '')
      setAddress(mockProfile.address ?? '')
      setPostalCode(mockProfile.postalCode ?? '')
      setTelegram(mockProfile.telegram ?? '')
      return
    }

    try {
      const parsedProfile = JSON.parse(profile) as {
        address?: string
        fullName?: string
        postalCode?: string
        telegram?: string
      }

      setFullName(parsedProfile.fullName ?? '')
      setAddress(parsedProfile.address ?? '')
      setPostalCode(parsedProfile.postalCode ?? '')
      setTelegram(parsedProfile.telegram ?? '')
    } catch {
      setFullName(mockProfile.fullName ?? '')
      setAddress(mockProfile.address ?? '')
      setPostalCode(mockProfile.postalCode ?? '')
      setTelegram(mockProfile.telegram ?? '')
    }
  }, [isCartOpen])

  const canSubmit = useMemo(
    () =>
      items.length > 0 &&
      fullName.trim() &&
      address.trim() &&
      postalCode.trim() &&
      telegram.trim(),
    [address, fullName, items.length, postalCode, telegram]
  )

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const hasItems = items.length > 0

  const handlePromoApply = () => {
    setPromoMessage(
      promoCode.trim()
        ? `Промокод "${promoCode.trim()}" сохранён как mock-применённый.`
        : 'Введите промокод.'
    )
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    const previousOrders = JSON.parse(
      window.localStorage.getItem(ORDER_STORAGE_KEY) ?? '[]'
    ) as Array<Record<string, unknown>>

    window.localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify([
        createMockOrder({
          address,
          customer: fullName,
          items,
          postalCode,
          promoCode: promoCode.trim() || null,
          status: 'Новый',
          telegram
        }),
        ...previousOrders
      ])
    )

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        address,
        fullName,
        postalCode,
        telegram
      })
    )

    setPromoCode('')
    setPromoMessage('')
    dispatch(clearCart())
  }

  return (
    <Modal
      isOpen={isCartOpen}
      modalClassName={styles.modal}
      onClose={() => dispatch(closeCart())}
      width={1180}
    >
      <div className={styles.header}>
        <h2>Корзина</h2>
        <button
          aria-label='Закрыть корзину'
          className={styles.closeButton}
          onClick={() => dispatch(closeCart())}
          type='button'
        >
          ×
        </button>
      </div>

      <div className={styles.content}>
        <section className={styles.itemsColumn}>
          {hasItems ? (
            <div className={styles.tableHeader}>
              <span />
              <span />
              <span>Название</span>
              <span>Количество</span>
              <span>Стоимость</span>
            </div>
          ) : null}

          <div className={styles.itemsList}>
            {hasItems ? (
              items.map((item) => (
                <article className={styles.itemRow} key={item.product.id}>
                  <button
                    className={styles.removeButton}
                    onClick={() => dispatch(removeItem(item.product.id))}
                    type='button'
                  >
                    ×
                  </button>

                  <div className={styles.itemImage}>
                    <span>{item.product.brand}</span>
                  </div>

                  <div className={styles.itemInfo}>
                    <strong>{item.product.name}</strong>
                    <p>{formatCurrency(item.product.price)}</p>
                  </div>

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
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                <Image alt='' aria-hidden='true' src={emptyCartImage} />
                <p>На данный момент в корзине нет товаров</p>
              </div>
            )}
          </div>

          {hasItems ? (
            <div className={styles.summaryRow}>
              <span>Итого</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
          ) : null}
        </section>

        <form className={styles.formColumn} onSubmit={handleSubmit}>
          <div className={styles.promoBlock}>
            <label>
              <span>Промокод</span>
              <input
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder='Введите промокод'
                value={promoCode}
              />
            </label>
            <Button
              className={styles.promoButton}
              onClick={handlePromoApply}
              type='button'
              variant='outlined'
            >
              Применить
            </Button>
          </div>

          {promoMessage ? <p className={styles.promoMessage}>{promoMessage}</p> : null}

          <label>
            <span>ФИО</span>
            <input
              onChange={(event) => setFullName(event.target.value)}
              placeholder='Иванов Иван Иванович'
              value={fullName}
            />
          </label>

          <label>
            <span>Адрес</span>
            <textarea
              onChange={(event) => setAddress(event.target.value)}
              placeholder='Город, улица, дом, квартира'
              rows={5}
              value={address}
            />
          </label>

          <div className={styles.formGrid}>
            <label>
              <span>Индекс</span>
              <input
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder='101000'
                value={postalCode}
              />
            </label>

            <label>
              <span>Telegram</span>
              <input
                onChange={(event) => setTelegram(event.target.value)}
                placeholder='@nickname'
                value={telegram}
              />
            </label>
          </div>

          <Button disabled={!canSubmit} fullWidth size='lg' type='submit'>
            Оформить заказ
          </Button>
        </form>
      </div>
    </Modal>
  )
}
