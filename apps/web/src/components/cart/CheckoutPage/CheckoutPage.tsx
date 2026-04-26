'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { formatCurrency } from '@btshop/shared'

import {
  createMockOrder,
  mockProfile,
  ORDER_STORAGE_KEY,
  PROFILE_STORAGE_KEY
} from '@/mocks'
import { Breadcrumbs, Button, Input } from '@/components/ui'
import { clearCart } from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CheckoutPage.module.scss'

const DELIVERY_METHODS = [
  {
    description: 'Базовая отправка Почтой России',
    id: 'post',
    price: 1000,
    title: 'Почта — первый класс'
  },
  {
    description: 'Курьерская доставка EMS',
    id: 'ems',
    price: 1500,
    title: 'EMS курьерская'
  },
  {
    description: 'Доступно при заказе от 35 000 ₽',
    disabled: true,
    id: 'cdek',
    price: 1000,
    title: 'СДЭК'
  }
]

export const CheckoutPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [deliveryId, setDeliveryId] = useState(DELIVERY_METHODS[0].id)

  const productsTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const selectedDelivery =
    DELIVERY_METHODS.find((method) => method.id === deliveryId) ?? DELIVERY_METHODS[0]
  const canSubmit = useMemo(
    () =>
      items.length > 0 &&
      fullName.trim() &&
      email.trim() &&
      city.trim() &&
      postalCode.trim() &&
      phone.trim(),
    [city, email, fullName, items.length, phone, postalCode]
  )
  const totalPrice = productsTotal + selectedDelivery.price

  useEffect(() => {
    const profile = window.localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!profile) {
      setFullName(mockProfile.fullName ?? '')
      setEmail(mockProfile.email ?? '')
      setCity(mockProfile.city ?? mockProfile.address ?? '')
      setPhone(mockProfile.phone ?? '')
      setPostalCode(mockProfile.postalCode ?? '')
      setTelegram(mockProfile.telegram ?? '')
      return
    }

    try {
      const parsedProfile = JSON.parse(profile) as {
        address?: string
        city?: string
        email?: string
        fullName?: string
        phone?: string
        postalCode?: string
        telegram?: string
      }

      setFullName(parsedProfile.fullName ?? '')
      setEmail(parsedProfile.email ?? '')
      setCity(parsedProfile.city ?? parsedProfile.address ?? '')
      setPhone(parsedProfile.phone ?? '')
      setPostalCode(parsedProfile.postalCode ?? '')
      setTelegram(parsedProfile.telegram ?? '')
    } catch {
      setFullName(mockProfile.fullName ?? '')
      setEmail(mockProfile.email ?? '')
      setCity(mockProfile.city ?? mockProfile.address ?? '')
      setPhone(mockProfile.phone ?? '')
      setPostalCode(mockProfile.postalCode ?? '')
      setTelegram(mockProfile.telegram ?? '')
    }
  }, [])

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
          city,
          customer: fullName,
          delivery: selectedDelivery.title,
          deliveryPrice: selectedDelivery.price,
          email,
          items,
          phone,
          postalCode,
          status: 'Новый',
          telegram
        }),
        ...previousOrders
      ])
    )

    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        city,
        email,
        fullName,
        phone,
        postalCode,
        telegram
      })
    )

    dispatch(clearCart())
    router.push('/profile')
  }

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          { href: '/', label: 'Главная' },
          { href: '/cart', label: 'Корзина' },
          { label: 'Оформление заказа' }
        ]}
      />

      <section className={styles.shell}>
        <button className={styles.backButton} onClick={() => router.back()} type='button'>
          ← Назад
        </button>

        <h1>Оформление заявки</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Контактные данные</div>

            <div className={styles.fieldsGrid}>
              <Input
                onChange={(event) => setFullName(event.target.value)}
                placeholder='ФИО получателя *'
                value={fullName}
              />

              <div className={styles.compactGrid}>
                <Input
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder='Ваш email *'
                  value={email}
                />
                <Input
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder='Телефон *'
                  value={phone}
                />
              </div>

              <Input
                onChange={(event) => setTelegram(event.target.value)}
                placeholder='Telegram'
                value={telegram}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Адрес доставки</div>

            <div className={styles.fieldsGrid}>
              <Input
                onChange={(event) => setCity(event.target.value)}
                placeholder='Город *'
                value={city}
              />
              <Input
                onChange={(event) => setPostalCode(event.target.value)}
                placeholder='Индекс *'
                value={postalCode}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Способ доставки</div>

            <div className={styles.deliveryBlock}>
              {DELIVERY_METHODS.map((method) => (
                <label
                  className={
                    method.disabled
                      ? styles.deliveryDisabled
                      : deliveryId === method.id
                        ? styles.deliverySelected
                        : styles.deliveryOption
                  }
                  key={method.id}
                >
                  <input
                    checked={deliveryId === method.id}
                    disabled={method.disabled}
                    name='delivery'
                    onChange={() => setDeliveryId(method.id)}
                    type='radio'
                  />
                  <span>
                    <strong>
                      {method.title} — {formatCurrency(method.price)}
                    </strong>
                    <small>{method.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button disabled={!canSubmit} size='lg' type='submit'>
            Оформить заказ
          </Button>
        </form>

        <aside className={styles.summary}>
          <div className={styles.summaryHeading}>
            <strong>Ваш заказ</strong>
            <p>Проверьте состав корзины и итоговую сумму перед оформлением.</p>
          </div>

          {items.length > 0 ? (
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div className={styles.summaryItem} key={item.product.id}>
                  <span>{item.product.name}</span>
                  <strong>
                    {item.quantity} x {formatCurrency(item.product.price)}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <p>Корзина пуста.</p>
          )}

          <div className={styles.summaryLine}>
            <span>Сумма товаров</span>
            <strong>{formatCurrency(productsTotal)}</strong>
          </div>
          <div className={styles.summaryLine}>
            <span>Доставка</span>
            <strong>{formatCurrency(selectedDelivery.price)}</strong>
          </div>
          <div className={styles.summaryTotal}>
            <span>Итого</span>
            <strong>{formatCurrency(totalPrice)}</strong>
          </div>
        </aside>
      </section>
    </div>
  )
}
