'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { formatCurrency } from '@btshop/shared'

import chevronDownIcon from '@assets/icons/chevron-down.svg'

import { authApi } from '@/api/auth'
import { ordersApi } from '@/api/orders'
import type { IOrder } from '@/api/orders/model'
import { Breadcrumbs, Button, Eyebrow, Input } from '@/components/ui'
import { PROFILE_STORAGE_KEY } from '@/shared/storage/profile'
import { logout, openAuthModal, setUserSession } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
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
  tel: string
}

const HISTORY_PAGE_SIZE = 15

const defaultValues: IProfileFormValues = {
  address: '',
  fullName: '',
  postalCode: '',
  telegram: '',
  tel: ''
}

const getDeliveryLabel = (value: string) => {
  if (value === 'cdek') {
    return 'CDEK'
  }

  return 'Почта'
}

export const ProfileView = () => {
  const dispatch = useAppDispatch()
  const { isHydrated: isAuthHydrated, user } = useAppSelector((state) => state.auth)
  const userId = user?.id ?? null
  const [orders, setOrders] = useState<IOrder[]>([])
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [hasMoreOrders, setHasMoreOrders] = useState(false)
  const [copiedTrackNumber, setCopiedTrackNumber] = useState('')

  const form = useForm<IProfileFormValues>({
    defaultValues,
    mode: 'onChange'
  })

  const loadOrders = async (page: number, mode: 'replace' | 'append' = 'replace') => {
    if (!user) {
      return
    }

    if (mode === 'append') {
      setIsLoadingMore(true)
    } else {
      setIsOrdersLoading(true)
    }

    setOrdersError('')

    try {
      const response = await ordersApi.getHistory(page, HISTORY_PAGE_SIZE)

      setOrders((current) => {
        const nextOrders = mode === 'append' ? [...current, ...response.items] : response.items

        if (!openedOrderId) {
          setOpenedOrderId(nextOrders[0]?.id ?? null)
        }

        return nextOrders
      })

      setHistoryPage(response.meta.page)
      setHasMoreOrders(response.meta.hasNextPage)
    } catch {
      setOrdersError('Не удалось загрузить историю заказов')
    } finally {
      setIsOrdersLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!user) {
      form.reset(defaultValues)
      void form.trigger()
      return
    }

    form.reset({
      address: user.address,
      fullName: user.fullName,
      postalCode: user.postalCode,
      telegram: user.telegramUsername,
      tel: user.tel
    })
    void form.trigger()
  }, [form, user])

  useEffect(() => {
    if (!userId) {
      setOrders([])
      setOpenedOrderId(null)
      setHistoryPage(1)
      setHasMoreOrders(false)
      setOrdersError('')
      return
    }

    void loadOrders(1, 'replace')
  }, [userId])

  const orderTotals = useMemo(
    () => Object.fromEntries(orders.map((order) => [order.id, order.amount])),
    [orders]
  )

  const handleTrackCopy = async (trackNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackNumber)
      setCopiedTrackNumber(trackNumber)
      window.setTimeout(() => {
        setCopiedTrackNumber((current) => (current === trackNumber ? '' : current))
      }, 1600)
    } catch {
      setOrdersError('Не удалось скопировать трек-номер')
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!user) {
      return
    }

    setErrorMessage('')
    setSavedMessage('')
    setIsSaving(true)

    try {
      const updatedUser = await authApi.updateMe({
        address: normalizeText(values.address),
        fullName: normalizeText(values.fullName),
        postalCode: normalizeText(values.postalCode),
        tel: normalizeText(values.tel),
        telegramUsername: normalizeTelegramField(values.telegram)
      })

      dispatch(setUserSession(updatedUser))
      window.localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          address: updatedUser.address,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          phone: updatedUser.tel,
          postalCode: updatedUser.postalCode,
          telegram: updatedUser.telegramUsername
        })
      )

      setSavedMessage('Профиль сохранён')
      window.setTimeout(() => setSavedMessage(''), 1800)
    } catch {
      setErrorMessage('Не удалось сохранить профиль')
    } finally {
      setIsSaving(false)
    }
  })

  const handleLogout = () => {
    authApi.logout()
    dispatch(logout())
  }

  const ordersSkeleton = Array.from({ length: 3 }, (_, index) => (
    <article className={styles.orderSkeleton} key={`order-skeleton-${index}`}>
      <div className={styles.orderSkeletonHeader}>
        <div className={styles.orderSkeletonMeta}>
          <div className={styles.skeletonLineShort}>
            <div className={styles.skeletonShimmer} />
          </div>
          <div className={styles.skeletonLineLong}>
            <div className={styles.skeletonShimmer} />
          </div>
        </div>

        <div className={styles.orderSkeletonSide}>
          <div className={styles.skeletonStatus}>
            <div className={styles.skeletonShimmer} />
          </div>
          <div className={styles.skeletonTotal}>
            <div className={styles.skeletonShimmer} />
          </div>
        </div>
      </div>
    </article>
  ))

  const profileSkeleton = (
    <section className={styles.form}>
      <div className={styles.profileSkeletonHeading}>
        <div className={styles.skeletonShimmer} />
      </div>
      <div className={styles.profileSkeletonFieldLarge}>
        <div className={styles.skeletonShimmer} />
      </div>
      <div className={styles.profileSkeletonFieldLarge}>
        <div className={styles.skeletonShimmer} />
      </div>
      <div className={styles.profileSkeletonArea}>
        <div className={styles.skeletonShimmer} />
      </div>
      <div className={styles.profileSkeletonGrid}>
        <div className={styles.profileSkeletonField}>
          <div className={styles.skeletonShimmer} />
        </div>
        <div className={styles.profileSkeletonField}>
          <div className={styles.skeletonShimmer} />
        </div>
        <div className={styles.profileSkeletonField}>
          <div className={styles.skeletonShimmer} />
        </div>
      </div>
      <div className={styles.profileSkeletonButton}>
        <div className={styles.skeletonShimmer} />
      </div>
      <div className={styles.profileSkeletonButtonSecondary}>
        <div className={styles.skeletonShimmer} />
      </div>
    </section>
  )

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

      {!isAuthHydrated ? (
        <div className={styles.content}>
          {profileSkeleton}
          <section className={styles.orders}>
            <h2>История заказов</h2>
            <div className={styles.orderSkeletonList}>{ordersSkeleton}</div>
          </section>
        </div>
      ) : !user ? (
        <section className={styles.authRequired}>
          <h2>Нужна авторизация</h2>
          <p>Войдите в аккаунт, чтобы посмотреть и сохранить данные профиля.</p>
          <Button
            onClick={() =>
              dispatch(
                openAuthModal({
                  mode: 'login',
                  redirectTo: '/profile'
                })
              )
            }
            size='lg'
          >
            Войти
          </Button>
        </section>
      ) : (
        <div className={styles.content}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <h2>Профиль</h2>

            {errorMessage ? <p className={styles.errorBanner}>{errorMessage}</p> : null}

            <label className={styles.fieldGroup}>
              <span>Email</span>
              <div className={styles.readonlyField}>{user.email}</div>
            </label>

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
                <span>Телефон</span>
                <Controller
                  control={form.control}
                  name='tel'
                  rules={{
                    validate: (value) => validateRequired(value, 'Укажите телефон')
                  }}
                  render={({ field, fieldState }) => (
                    <Input {...field} invalid={fieldState.invalid} />
                  )}
                />
                {form.formState.errors.tel?.message ? (
                  <small className={styles.fieldError}>
                    {form.formState.errors.tel.message}
                  </small>
                ) : null}
              </label>

              <label className={styles.fieldGroup}>
                <span>Telegram</span>
                <Controller
                  control={form.control}
                  name='telegram'
                  rules={{ validate: (value) => validateTelegram(value, { optional: true }) }}
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

            <Button disabled={isSaving} size='lg' type='submit'>
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </Button>

            <Button
              className={styles.logoutButton}
              fullWidth
              onClick={handleLogout}
              size='lg'
              type='button'
              variant='outlined'
            >
              Выйти
            </Button>
          </form>

          <section className={styles.orders}>
            <h2>История заказов</h2>

            {ordersError ? <p className={styles.errorBanner}>{ordersError}</p> : null}

            {isOrdersLoading ? (
              <div className={styles.orderSkeletonList}>{ordersSkeleton}</div>
            ) : orders.length === 0 ? (
              <p className={styles.ordersState}>Заказов пока нет.</p>
            ) : (
              <>
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
                            {order.trackNumber ? (
                              <div className={styles.orderTrack}>
                                <span>{getDeliveryLabel(order.delivery)}</span>
                                <div className={styles.orderTrackValue}>
                                  <strong>{order.trackNumber}</strong>
                                  <button
                                    aria-label='Скопировать трек-номер'
                                    className={styles.copyButton}
                                    onClick={() => void handleTrackCopy(order.trackNumber)}
                                    type='button'
                                  >
                                    <span className={styles.copyIconBack} />
                                    <span className={styles.copyIconFront} />
                                  </button>
                                  {copiedTrackNumber === order.trackNumber ? (
                                    <span className={styles.copyHint}>Скопировано</span>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                            <div className={styles.orderItems}>
                              {order.products.map((item) => (
                                <div className={styles.orderItem} key={item.productId}>
                                  <div className={styles.itemMeta}>
                                    <strong>{item.name}</strong>
                                    <p>{item.quantity} шт.</p>
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

                {hasMoreOrders ? (
                  <Button
                    disabled={isLoadingMore}
                    onClick={() => void loadOrders(historyPage + 1, 'append')}
                    size='lg'
                    variant='outlined'
                  >
                    {isLoadingMore ? 'Загружаем...' : 'Загрузить ещё'}
                  </Button>
                ) : null}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
