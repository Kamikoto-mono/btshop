'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatCurrency } from '@btshop/shared'

import chevronDownIcon from '@assets/icons/chevron-down.svg'

import {
  mockOrderHistory,
  mockProfile,
  ORDER_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  type IStoredOrder,
  type IStoredProfile
} from '@/mocks'
import { Breadcrumbs, Button, Eyebrow, Input } from '@/components/ui'
import {
  normalizeTelegramField,
  normalizeText,
  validateRequired,
  validateTelegram
} from '@/shared/utils'
import styles from './ProfileView.module.scss'

interface IProfileFormValues {
  address: string
  fullName: string
  postalCode: string
  telegram: string
}

const defaultValues: IProfileFormValues = {
  address: '',
  fullName: '',
  postalCode: '',
  telegram: ''
}

export const ProfileView = () => {
  const [orders, setOrders] = useState<IStoredOrder[]>([])
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState('')

  const form = useForm<IProfileFormValues>({
    defaultValues,
    mode: 'onChange'
  })

  useEffect(() => {
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    const storedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY)

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile) as IStoredProfile

      form.reset({
        address: parsedProfile.address ?? '',
        fullName: parsedProfile.fullName ?? '',
        postalCode: parsedProfile.postalCode ?? '',
        telegram: parsedProfile.telegram ?? ''
      })
    } else {
      form.reset({
        address: mockProfile.address ?? '',
        fullName: mockProfile.fullName ?? '',
        postalCode: mockProfile.postalCode ?? '',
        telegram: mockProfile.telegram ?? ''
      })
    }

    const nextOrders = storedOrders
      ? (JSON.parse(storedOrders) as IStoredOrder[])
      : mockOrderHistory

    setOrders(nextOrders)
    setOpenedOrderId(nextOrders[0]?.id ?? null)
  }, [form])

  const orderTotals = useMemo(
    () =>
      Object.fromEntries(
        orders.map((order) => [
          order.id,
          order.totalPrice ??
            order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        ])
      ),
    [orders]
  )

  const handleSubmit = form.handleSubmit((values) => {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        address: normalizeText(values.address),
        fullName: normalizeText(values.fullName),
        postalCode: normalizeText(values.postalCode),
        telegram: normalizeTelegramField(values.telegram)
      })
    )

    setSavedMessage('Предпочтительный адрес сохранён')
    window.setTimeout(() => setSavedMessage(''), 1800)
  })

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { href: '/', label: 'Главная' },
          { label: 'Личный кабинет' }
        ]}
      />

      <section className={styles.hero}>
        <div>
          <Eyebrow as='h1' className={styles.eyebrow} dot>
            Профиль
          </Eyebrow>
        </div>
        {savedMessage ? <span className={styles.badge}>{savedMessage}</span> : null}
      </section>

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Предпочтительные данные</h2>

          <label className={styles.fieldGroup}>
            <span>ФИО</span>
            <Controller
              control={form.control}
              name='fullName'
              rules={{
                validate: (value) => validateRequired(value, 'Укажите ФИО')
              }}
              render={({ field, fieldState }) => (
                <Input {...field} invalid={fieldState.invalid} />
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
                <Input {...field} invalid={fieldState.invalid} multiline rows={5} />
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
                  <Input {...field} invalid={fieldState.invalid} />
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
                  <Input {...field} invalid={fieldState.invalid} />
                )}
              />
              {form.formState.errors.telegram?.message ? (
                <small className={styles.fieldError}>
                  {form.formState.errors.telegram.message}
                </small>
              ) : null}
            </label>
          </div>

          <Button disabled={!form.formState.isValid} size='lg' type='submit'>
            Сохранить
          </Button>
        </form>

        <section className={styles.orders}>
          <h2>История заказов</h2>

          <div className={styles.orderList}>
            {orders.map((order) => {
              const isOpened = openedOrderId === order.id
              const total = orderTotals[order.id] ?? 0

              return (
                <article className={styles.orderAccordion} key={order.id}>
                  <button
                    className={styles.orderSummary}
                    onClick={() =>
                      setOpenedOrderId((current) =>
                        current === order.id ? null : order.id
                      )
                    }
                    type='button'
                  >
                    <div className={styles.orderSummaryMeta}>
                      <strong>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</strong>
                      <span>{order.id}</span>
                    </div>

                    <div className={styles.orderSummarySide}>
                      <span className={styles.orderStatus}>{order.status}</span>
                      <strong className={styles.orderTotal}>{formatCurrency(total)}</strong>
                      <span
                        className={
                          isOpened ? styles.orderArrowOpened : styles.orderArrow
                        }
                      >
                        <Image alt='' aria-hidden='true' src={chevronDownIcon} />
                      </span>
                    </div>
                  </button>

                  <div
                    className={
                      isOpened ? styles.orderContentOpened : styles.orderContent
                    }
                  >
                    <div className={styles.orderContentInner}>
                      <div className={styles.orderItems}>
                        {order.items.map((item) => (
                          <div className={styles.orderItem} key={item.id}>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemImage}>
                                <span>{item.name.split(' ')[0]}</span>
                              </div>

                              <div className={styles.itemMeta}>
                                <strong>{item.name}</strong>
                                <p>{item.quantity} шт.</p>
                              </div>
                            </div>

                            <strong className={styles.itemPrice}>
                              {formatCurrency(item.price * item.quantity)}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
