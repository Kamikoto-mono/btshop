'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatCurrency, FRONT_ASSET_URLS } from '@btshop/shared'

import {
  createMockOrder,
  ORDER_STORAGE_KEY,
  PROFILE_STORAGE_KEY
} from '@/mocks'
import { Button, Input, Modal } from '@/components/ui'
import {
  clearCart,
  closeCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  normalizeTelegramField,
  normalizeText,
  validateRequired,
  validateTelegram
} from '@/shared/utils'
import styles from './CartModal.module.scss'

interface ICartFormValues {
  address: string
  fullName: string
  postalCode: string
  telegram: string
}

const defaultValues: ICartFormValues = {
  address: '',
  fullName: '',
  postalCode: '',
  telegram: ''
}

export const CartModal = () => {
  const dispatch = useAppDispatch()
  const isCartOpen = useAppSelector((state) => state.cart.isOpen)
  const items = useAppSelector((state) => state.cart.items)
  const user = useAppSelector((state) => state.auth.user)

  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [removingIds, setRemovingIds] = useState<string[]>([])

  const form = useForm<ICartFormValues>({
    defaultValues,
    mode: 'onChange'
  })

  useEffect(() => {
    if (!isCartOpen) {
      return
    }

    const profile = window.localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!profile) {
      form.reset({
        address: user?.address ?? '',
        fullName: user?.fullName ?? '',
        postalCode: user?.postalCode ?? '',
        telegram: user?.telegramUsername ?? ''
      })
      return
    }

    try {
      const parsedProfile = JSON.parse(profile) as {
        address?: string
        fullName?: string
        postalCode?: string
        telegram?: string
      }

      form.reset({
        address: parsedProfile.address ?? user?.address ?? '',
        fullName: parsedProfile.fullName ?? user?.fullName ?? '',
        postalCode: parsedProfile.postalCode ?? user?.postalCode ?? '',
        telegram: parsedProfile.telegram ?? user?.telegramUsername ?? ''
      })
    } catch {
      form.reset({
        address: user?.address ?? '',
        fullName: user?.fullName ?? '',
        postalCode: user?.postalCode ?? '',
        telegram: user?.telegramUsername ?? ''
      })
    }
  }, [form, isCartOpen, user])

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const hasItems = items.length > 0
  const canSubmit = hasItems && form.formState.isValid

  const handlePromoApply = () => {
    setPromoMessage(
      promoCode.trim()
        ? `Промокод "${promoCode.trim()}" сохранён как mock-применённый.`
        : 'Введите промокод.'
    )
  }

  const handleRemove = (productId: string) => {
    if (removingIds.includes(productId)) {
      return
    }

    setRemovingIds((current) => [...current, productId])

    window.setTimeout(() => {
      dispatch(removeItem(productId))
      setRemovingIds((current) => current.filter((id) => id !== productId))
    }, 280)
  }

  const handleSubmit = form.handleSubmit((values) => {
    const normalizedValues = {
      address: normalizeText(values.address),
      fullName: normalizeText(values.fullName),
      postalCode: normalizeText(values.postalCode),
      telegram: normalizeTelegramField(values.telegram)
    }

    const previousOrders = JSON.parse(
      window.localStorage.getItem(ORDER_STORAGE_KEY) ?? '[]'
    ) as Array<Record<string, unknown>>

    window.localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify([
        createMockOrder({
          address: normalizedValues.address,
          customer: normalizedValues.fullName,
          items,
          postalCode: normalizedValues.postalCode,
          promoCode: promoCode.trim() || null,
          status: 'Новый',
          telegram: normalizedValues.telegram
        }),
        ...previousOrders
      ])
    )

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(normalizedValues)
    )

    setPromoCode('')
    setPromoMessage('')
    dispatch(clearCart())
  })

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
              items.map((item) => {
                const isRemoving = removingIds.includes(item.product.id)

                return (
                  <article
                    className={
                      isRemoving
                        ? `${styles.itemRow} ${styles.itemRowRemoving}`
                        : styles.itemRow
                    }
                    key={item.product.id}
                  >
                    <button
                      className={styles.removeButton}
                      disabled={isRemoving}
                      onClick={() => handleRemove(item.product.id)}
                      type='button'
                    >
                      ×
                    </button>

                    <div className={styles.itemImage}>
                      {item.product.photo ? (
                        <img
                          alt={item.product.name}
                          className={styles.productImage}
                          decoding='async'
                          loading='lazy'
                          src={item.product.photo}
                        />
                      ) : (
                        <span>{item.product.brand}</span>
                      )}
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
                )
              })
            ) : (
              <div className={styles.emptyState}>
                <Image
                  alt=''
                  aria-hidden='true'
                  height={560}
                  src={FRONT_ASSET_URLS.btEmptyCard}
                  width={560}
                />
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
            <label className={styles.fieldGroup}>
              <span>Промокод</span>
              <Input
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

          <label className={styles.fieldGroup}>
            <span>ФИО</span>
            <Controller
              control={form.control}
              name='fullName'
              rules={{
                validate: (value) => validateRequired(value, 'Укажите ФИО')
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  invalid={fieldState.invalid}
                  placeholder='Иванов Иван Иванович'
                />
              )}
            />
            {form.formState.errors.fullName?.message ? (
              <small className={styles.fieldError}>
                {form.formState.errors.fullName.message}
              </small>
            ) : null}
          </label>

          <label className={styles.fieldGroup}>
            <span>Адрес</span>
            <Controller
              control={form.control}
              name='address'
              rules={{
                validate: (value) => validateRequired(value, 'Укажите адрес')
              }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  invalid={fieldState.invalid}
                  multiline
                  placeholder='Город, улица, дом, квартира'
                  rows={5}
                />
              )}
            />
            {form.formState.errors.address?.message ? (
              <small className={styles.fieldError}>
                {form.formState.errors.address.message}
              </small>
            ) : null}
          </label>

          <div className={styles.formGrid}>
            <label className={styles.fieldGroup}>
              <span>Индекс</span>
              <Controller
                control={form.control}
                name='postalCode'
                rules={{
                  validate: (value) => validateRequired(value, 'Укажите индекс')
                }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    invalid={fieldState.invalid}
                    placeholder='101000'
                  />
                )}
              />
              {form.formState.errors.postalCode?.message ? (
                <small className={styles.fieldError}>
                  {form.formState.errors.postalCode.message}
                </small>
              ) : null}
            </label>

            <label className={styles.fieldGroup}>
              <span>Telegram</span>
              <Controller
                control={form.control}
                name='telegram'
                rules={{ validate: (value) => validateTelegram(value) }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    invalid={fieldState.invalid}
                    placeholder='@nickname'
                  />
                )}
              />
              {form.formState.errors.telegram?.message ? (
                <small className={styles.fieldError}>
                  {form.formState.errors.telegram.message}
                </small>
              ) : null}
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
