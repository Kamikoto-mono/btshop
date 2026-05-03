'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { formatCurrency, FRONT_ASSET_URLS } from '@btshop/shared'

import { getOrderApiErrorMessage, ordersApi } from '@/api/orders'
import { Breadcrumbs, Button } from '@/components/ui'
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  setPromoCode,
  setPromoValidationError,
  setPromoValidationSuccess
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CartPage.module.scss'

export const CartPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { items, promoCode, promoMessage, promoStatus, promoValidation } = useAppSelector(
    (state) => state.cart
  )
  const [isPromoSubmitting, setIsPromoSubmitting] = useState(false)
  const [removingIds, setRemovingIds] = useState<string[]>([])

  const productsTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const totalPrice = promoValidation?.finalAmount ?? productsTotal
  const hasItems = items.length > 0

  const handlePromoApply = async () => {
    const normalizedPromoCode = promoCode.trim().toUpperCase()

    if (!normalizedPromoCode) {
      dispatch(setPromoValidationError('Введите промокод.'))
      return
    }

    setIsPromoSubmitting(true)

    try {
      const response = await ordersApi.validatePromo({
        amount: productsTotal,
        promoCode: normalizedPromoCode
      })

      if (!response.isValid) {
        dispatch(setPromoValidationError('Промокод не подошёл для текущего заказа.'))
        return
      }

      dispatch(
        setPromoValidationSuccess({
          message: `Промокод "${response.promoCode}" применён. Скидка ${formatCurrency(response.promoDiscount)}.`,
          validation: {
            finalAmount: response.finalAmount,
            originalAmount: response.originalAmount,
            promoCode: response.promoCode,
            promoDiscount: response.promoDiscount
          }
        })
      )
    } catch (error) {
      const apiMessage = getOrderApiErrorMessage(error, 'Не удалось проверить промокод.')
      const normalizedMessage =
        apiMessage.toLowerCase() === 'promo code not found'
          ? 'Промокод не найден.'
          : apiMessage

      dispatch(
        setPromoValidationError(normalizedMessage)
      )
    } finally {
      setIsPromoSubmitting(false)
    }
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
          </button>
        </div>

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
              {items.map((item) => {
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
                    <div className={styles.itemInfo}>
                      <div className={styles.itemImage}>
                        {item.product.photo ? (
                          <Image
                            alt={item.product.name}
                            className={styles.productImage}
                            fill
                            sizes='104px'
                            src={item.product.photo}
                          />
                        ) : (
                          <span>{item.product.brand}</span>
                        )}
                      </div>
                      <div>
                        <strong>{item.product.name}</strong>
                        <p>
                          {item.product.categoryName} / {item.product.subCategoryName}
                        </p>
                      </div>
                    </div>

                    <span className={styles.price}>
                      {formatCurrency(item.product.price)}
                    </span>

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
                      disabled={isRemoving}
                      onClick={() => handleRemove(item.product.id)}
                      type='button'
                    >
                      ×
                    </button>
                  </article>
                )
              })}
            </div>

            <div className={styles.promoBlock}>
              <input
                onChange={(event) => dispatch(setPromoCode(event.target.value))}
                placeholder='промокод'
                value={promoCode}
              />
              <Button
                onClick={() => void handlePromoApply()}
                type='button'
                variant='outlined'
              >
                {isPromoSubmitting ? 'проверяем...' : 'применить'}
              </Button>
            </div>

            {promoMessage ? (
              <p
                className={
                  promoStatus === 'valid'
                    ? `${styles.promoMessage} ${styles.promoMessageSuccess}`
                    : `${styles.promoMessage} ${styles.promoMessageError}`
                }
              >
                {promoMessage}
              </p>
            ) : null}

            <div className={styles.summaryCard}>
              <strong>Итого: {formatCurrency(totalPrice)}</strong>
              {promoValidation ? (
                <div className={styles.summaryDetails}>
                  <div className={styles.summaryDetailRow}>
                    <span>Сумма товаров</span>
                    <span>{formatCurrency(productsTotal)}</span>
                  </div>
                  <div className={styles.summaryDetailRow}>
                    <span>Скидка по промокоду</span>
                    <span>-{formatCurrency(promoValidation.promoDiscount)}</span>
                  </div>
                </div>
              ) : null}
              <p>Минимальный заказ от 5 000 руб.</p>
              <Button className={styles.summaryAction} href='/checkout' size='lg'>
                Оформить заказ
              </Button>
            </div>
          </>
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
