'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import {
  normalizeEmail,
  normalizeTelegramField,
  normalizeText,
  validateEmail,
  validateRequired,
  validateTelegram
} from '@/shared/utils'
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

interface ICheckoutFormValues {
  city: string
  deliveryId: string
  email: string
  fullName: string
  phone: string
  postalCode: string
  telegram: string
}

const defaultValues: ICheckoutFormValues = {
  city: '',
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
  const canSubmit = items.length > 0 && form.formState.isValid

  useEffect(() => {
    const profile = window.localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!profile) {
      form.reset({
        city: mockProfile.city ?? mockProfile.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: mockProfile.email ?? '',
        fullName: mockProfile.fullName ?? '',
        phone: mockProfile.phone ?? '',
        postalCode: mockProfile.postalCode ?? '',
        telegram: mockProfile.telegram ?? ''
      })
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

      form.reset({
        city: parsedProfile.city ?? parsedProfile.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: parsedProfile.email ?? '',
        fullName: parsedProfile.fullName ?? '',
        phone: parsedProfile.phone ?? '',
        postalCode: parsedProfile.postalCode ?? '',
        telegram: parsedProfile.telegram ?? ''
      })
    } catch {
      form.reset({
        city: mockProfile.city ?? mockProfile.address ?? '',
        deliveryId: DELIVERY_METHODS[0].id,
        email: mockProfile.email ?? '',
        fullName: mockProfile.fullName ?? '',
        phone: mockProfile.phone ?? '',
        postalCode: mockProfile.postalCode ?? '',
        telegram: mockProfile.telegram ?? ''
      })
    }
  }, [form])

  const handleSubmit = form.handleSubmit((values) => {
    const normalizedValues = {
      city: normalizeText(values.city),
      email: normalizeEmail(values.email),
      fullName: normalizeText(values.fullName),
      phone: normalizeText(values.phone),
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
          city: normalizedValues.city,
          customer: normalizedValues.fullName,
          delivery: selectedDelivery.title,
          deliveryPrice: selectedDelivery.price,
          email: normalizedValues.email,
          items,
          phone: normalizedValues.phone,
          postalCode: normalizedValues.postalCode,
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

    dispatch(clearCart())
    router.push('/profile')
  })

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
                  name='city'
                  rules={{
                    validate: (value) => validateRequired(value, 'Укажите город')
                  }}
                  render={({ field, fieldState }) => (
                    <Input
                      {...field}
                      invalid={fieldState.invalid}
                      placeholder='Город *'
                    />
                  )}
                />
                {form.formState.errors.city?.message ? (
                  <small className={styles.fieldError}>
                    {form.formState.errors.city.message}
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
