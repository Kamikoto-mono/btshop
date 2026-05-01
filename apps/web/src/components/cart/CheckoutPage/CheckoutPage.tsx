'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import { formatCurrency } from '@btshop/shared'

import { getOrderApiErrorMessage, ordersApi } from '@/api/orders'
import type { IOrder } from '@/api/orders/model'
import { mapOrderToStoredOrder } from '@/api/orders/model'
import { Breadcrumbs, Button, Input } from '@/components/ui'
import { ORDER_STORAGE_KEY, PROFILE_STORAGE_KEY } from '@/mocks'
import { clearCart } from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  normalizeEmail,
  normalizeTelegramField,
  normalizeText,
  validateEmail,
  validateRequired,
  validateTelegram
} from '@/shared/utils'
import styles from './CheckoutPage.module.scss'

interface IDeliveryMethod {
  description: string
  disabled?: boolean
  id: string
  price: number
  title: string
}

interface ICheckoutFormValues {
  address: string
  deliveryId: string
  email: string
  fullName: string
  phone: string
  postalCode: string
  telegram: string
}

const DELIVERY_METHODS: IDeliveryMethod[] = [
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

const defaultValues: ICheckoutFormValues = {
  address: '',
  deliveryId: DELIVERY_METHODS[0].id,
  email: '',
  fullName: '',
  phone: '',
  postalCode: '',
  telegram: ''
}

export const CheckoutPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const user = useAppSelector((state) => state.auth.user)

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<IOrder | null>(null)

  const form = useForm<ICheckoutFormValues>({
    defaultValues,
    mode: 'onChange'
  })

  const deliveryId = form.watch('deliveryId')
  const productsTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const selectedDelivery =
    DELIVERY_METHODS.find((method) => method.id === deliveryId) ?? DELIVERY_METHODS[0]
  const totalPrice = productsTotal + selectedDelivery.price
  const canSubmit = items.length > 0 && !isSubmitting

  useEffect(() => {
    const profile = window.localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!profile) {
      form.reset({
        address: user?.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: user?.email ?? '',
        fullName: user?.fullName ?? '',
        phone: user?.tel ?? '',
        postalCode: user?.postalCode ?? '',
        telegram: user?.telegramUsername ?? ''
      })
      return
    }

    try {
      const parsedProfile = JSON.parse(profile) as {
        address?: string
        email?: string
        fullName?: string
        phone?: string
        postalCode?: string
        telegram?: string
      }

      form.reset({
        address: parsedProfile.address ?? user?.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: parsedProfile.email ?? user?.email ?? '',
        fullName: parsedProfile.fullName ?? user?.fullName ?? '',
        phone: parsedProfile.phone ?? user?.tel ?? '',
        postalCode: parsedProfile.postalCode ?? user?.postalCode ?? '',
        telegram: parsedProfile.telegram ?? user?.telegramUsername ?? ''
      })
    } catch {
      form.reset({
        address: user?.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: user?.email ?? '',
        fullName: user?.fullName ?? '',
        phone: user?.tel ?? '',
        postalCode: user?.postalCode ?? '',
        telegram: user?.telegramUsername ?? ''
      })
    }
  }, [form, user])

  const handleSubmit = form.handleSubmit(async (values) => {
    setErrorMessage('')
    setIsSubmitting(true)

    const normalizedValues = {
      address: normalizeText(values.address),
      email: normalizeEmail(values.email),
      fullName: normalizeText(values.fullName),
      phone: normalizeText(values.phone),
      postalCode: normalizeText(values.postalCode),
      telegram: normalizeTelegramField(values.telegram)
    }

    try {
      const order = await ordersApi.createOrder({
        address: normalizedValues.address,
        email: normalizedValues.email,
        fullName: normalizedValues.fullName,
        index: normalizedValues.postalCode,
        products: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        tel: normalizedValues.phone,
        telegramUsername: normalizedValues.telegram
      })

      const previousOrders = JSON.parse(
        window.localStorage.getItem(ORDER_STORAGE_KEY) ?? '[]'
      ) as Array<Record<string, unknown>>

      window.localStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify([mapOrderToStoredOrder(order), ...previousOrders])
      )

      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          address: normalizedValues.address,
          email: normalizedValues.email,
          fullName: normalizedValues.fullName,
          phone: normalizedValues.phone,
          postalCode: normalizedValues.postalCode,
          telegram: normalizedValues.telegram
        })
      )

      setCreatedOrder(order)
      dispatch(clearCart())
    } catch (error) {
      setErrorMessage(getOrderApiErrorMessage(error, 'Не удалось оформить заказ'))
    } finally {
      setIsSubmitting(false)
    }
  })

  if (createdOrder) {
    return (
      <div className={styles.page}>
        <Breadcrumbs
          items={[
            { href: '/', label: 'Главная' },
            { href: '/cart', label: 'Корзина' },
            { label: 'Заказ оформлен' }
          ]}
        />

        <section className={styles.successShell}>
          <div className={styles.successHero}>
            <h1>Спасибо за заказ</h1>
            <p>
              Спасибо за заказ, с вами свяжется наш менеджер по предоставленным
              вами контактам.
            </p>
          </div>

          <div className={styles.successGrid}>
            <section className={styles.successCard}>
              <h2>Контакты для связи</h2>
              <div className={styles.successMeta}>
                <div>
                  <span>ФИО</span>
                  <strong>{createdOrder.fullName}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{createdOrder.email}</strong>
                </div>
                <div>
                  <span>Телефон</span>
                  <strong>{createdOrder.tel}</strong>
                </div>
                <div>
                  <span>Telegram</span>
                  <strong>{createdOrder.telegramUsername || 'Не указан'}</strong>
                </div>
                <div>
                  <span>Адрес</span>
                  <strong>{createdOrder.address}</strong>
                </div>
                <div>
                  <span>Индекс</span>
                  <strong>{createdOrder.postalCode}</strong>
                </div>
                <div>
                  <span>Номер заказа</span>
                  <strong>{createdOrder.id}</strong>
                </div>
              </div>
            </section>

            <aside className={styles.successCard}>
              <h2>Состав заказа</h2>

              <div className={styles.successItems}>
                {createdOrder.products.map((product) => (
                  <div className={styles.successItem} key={product.productId}>
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.quantity} шт.</span>
                    </div>
                    <strong>{formatCurrency(product.price * product.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.successTotal}>
                <span>Итого</span>
                <strong>{formatCurrency(createdOrder.amount)}</strong>
              </div>

              <div className={styles.successActions}>
                <Button fullWidth href='/market' size='lg'>
                  Продолжить покупки
                </Button>
                <Button fullWidth href='/profile' size='lg' variant='outlined'>
                  Перейти в профиль
                </Button>
              </div>
            </aside>
          </div>
        </section>
      </div>
    )
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
              <label className={styles.fieldGroup}>
                <Controller
                  control={form.control}
                  name='fullName'
                  rules={{
                    validate: (value) => validateRequired(value, 'Укажите ФИО получателя')
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      invalid={fieldState.invalid}
                      placeholder='ФИО получателя *'
                    />
                  )}
                />
                {form.formState.errors.fullName?.message ? (
                  <small className={styles.fieldError}>
                    {form.formState.errors.fullName.message}
                  </small>
                ) : null}
              </label>

              <div className={styles.compactGrid}>
                <label className={styles.fieldGroup}>
                  <Controller
                    control={form.control}
                    name='email'
                    rules={{ validate: validateEmail }}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        invalid={fieldState.invalid}
                        placeholder='Ваш email *'
                      />
                    )}
                  />
                  {form.formState.errors.email?.message ? (
                    <small className={styles.fieldError}>
                      {form.formState.errors.email.message}
                    </small>
                  ) : null}
                </label>

                <label className={styles.fieldGroup}>
                  <Controller
                    control={form.control}
                    name='phone'
                    rules={{
                      validate: (value) => validateRequired(value, 'Укажите телефон')
                    }}
                    render={({ field, fieldState }) => (
                      <Input
                        {...field}
                        invalid={fieldState.invalid}
                        placeholder='Телефон *'
                      />
                    )}
                  />
                  {form.formState.errors.phone?.message ? (
                    <small className={styles.fieldError}>
                      {form.formState.errors.phone.message}
                    </small>
                  ) : null}
                </label>
              </div>

              <label className={styles.fieldGroup}>
                <Controller
                  control={form.control}
                  name='telegram'
                  rules={{ validate: (value) => validateTelegram(value, { optional: true }) }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      invalid={fieldState.invalid}
                      placeholder='Telegram'
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
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Адрес доставки</div>

            <div className={styles.fieldsGrid}>
              <label className={styles.fieldGroup}>
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
                      placeholder='Адрес *'
                    />
                  )}
                />
                {form.formState.errors.address?.message ? (
                  <small className={styles.fieldError}>
                    {form.formState.errors.address.message}
                  </small>
                ) : null}
              </label>

              <label className={styles.fieldGroup}>
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
                      placeholder='Индекс *'
                    />
                  )}
                />
                {form.formState.errors.postalCode?.message ? (
                  <small className={styles.fieldError}>
                    {form.formState.errors.postalCode.message}
                  </small>
                ) : null}
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.sectionTitle}>Способ доставки</div>

            <div className={styles.deliveryBlock}>
              <Controller
                control={form.control}
                name='deliveryId'
                render={({ field }) => (
                  <>
                    {DELIVERY_METHODS.map((method) => (
                      <label
                        className={
                          method.disabled
                            ? styles.deliveryDisabled
                            : field.value === method.id
                              ? styles.deliverySelected
                              : styles.deliveryOption
                        }
                        key={method.id}
                      >
                        <input
                          checked={field.value === method.id}
                          disabled={method.disabled}
                          name='delivery'
                          onChange={() => field.onChange(method.id)}
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
                  </>
                )}
              />
            </div>
          </div>

          {errorMessage ? <p className={styles.errorBanner}>{errorMessage}</p> : null}

          <Button disabled={!canSubmit} size='lg' type='submit'>
            {isSubmitting ? 'Отправляем заказ...' : 'Оформить заказ'}
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
