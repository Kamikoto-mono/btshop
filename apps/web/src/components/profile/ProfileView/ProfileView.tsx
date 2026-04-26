'use client'

import { FormEvent, useEffect, useState } from 'react'

import { formatCurrency } from '@btshop/shared'

import {
  mockOrderHistory,
  mockProfile,
  ORDER_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  type IStoredOrder,
  type IStoredProfile
} from '@/mocks'
import { Breadcrumbs, Button, StatusDot } from '@/components/ui'
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

    if (storedOrders) {
      setOrders(JSON.parse(storedOrders) as IStoredOrder[])
    } else {
      setOrders(mockOrderHistory)
    }
  }, [])

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
          <h1 className={styles.eyebrow}>
            <StatusDot />
            Профиль
          </h1>
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
            {orders.map((order) => (
              <article className={styles.orderCard} key={order.id}>
                <div className={styles.orderHeader}>
                  <div>
                    <strong>{order.id}</strong>
                    <p>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <span>{order.status}</span>
                </div>
                <div className={styles.orderItems}>
                  {order.items.map((item) => (
                    <div className={styles.orderItem} key={item.id}>
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
