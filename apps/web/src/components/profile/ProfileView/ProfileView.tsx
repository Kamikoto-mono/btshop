'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useMemo, useState } from 'react'

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
import { Breadcrumbs, Button, Eyebrow } from '@/components/ui'
import styles from './ProfileView.module.scss'

interface IProfileState {
  address: string
  fullName: string
  postalCode: string
  telegram: string
}

const initialProfile: IProfileState = {
  address: '',
  fullName: '',
  postalCode: '',
  telegram: ''
}

export const ProfileView = () => {
  const [profile, setProfile] = useState<IProfileState>(initialProfile)
  const [orders, setOrders] = useState<IStoredOrder[]>([])
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState('')

  useEffect(() => {
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    const storedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY)

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile) as IStoredProfile

      setProfile({
        address: parsedProfile.address ?? '',
        fullName: parsedProfile.fullName ?? '',
        postalCode: parsedProfile.postalCode ?? '',
        telegram: parsedProfile.telegram ?? ''
      })
    } else {
      setProfile({
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
  }, [])

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    setSavedMessage('Предпочтительный адрес сохранён')
    window.setTimeout(() => setSavedMessage(''), 1800)
  }

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
          <label>
            <span>ФИО</span>
            <input
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  fullName: event.target.value
                }))
              }
              value={profile.fullName}
            />
          </label>
          <label>
            <span>Адрес</span>
            <textarea
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  address: event.target.value
                }))
              }
              rows={5}
              value={profile.address}
            />
          </label>
          <div className={styles.formGrid}>
            <label>
              <span>Индекс</span>
              <input
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    postalCode: event.target.value
                  }))
                }
                value={profile.postalCode}
              />
            </label>
            <label>
              <span>Telegram</span>
              <input
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    telegram: event.target.value
                  }))
                }
                value={profile.telegram}
              />
            </label>
          </div>
          <Button size='lg' type='submit'>
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
