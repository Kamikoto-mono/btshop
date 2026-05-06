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
  setQuantity,
  setPromoValidationError,
  setPromoValidationSuccess
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './CartPage.module.scss'

export const CartPage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isHydrated, items, promoCode, promoMessage, promoStatus, promoValidation } = useAppSelector(
    (state) => state.cart
  )
  const [isPromoSubmitting, setIsPromoSubmitting] = useState(false)
  const [quantityDrafts, setQuantityDrafts] = useState<Record<string, string>>({})
  const [removingIds, setRemovingIds] = useState<string[]>([])

  const productsTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  )
  const totalPrice = promoValidation?.finalAmount ?? productsTotal
  const hasItems = items.length > 0
  const cartSkeleton = Array.from({ length: 3 }, (_, index) => (
    <article className={styles.cartSkeletonRow} key={`cart-skeleton-${index}`}>
      <div className={styles.cartSkeletonMain}>
        <div className={styles.cartSkeletonImage}>
          <div className={styles.cartSkeletonShimmer} />
        </div>
        <div className={styles.cartSkeletonCopy}>
          <div className={styles.cartSkeletonTitle}>
            <div className={styles.cartSkeletonShimmer} />
          </div>
          <div className={styles.cartSkeletonMeta}>
            <div className={styles.cartSkeletonShimmer} />
          </div>
        </div>
      </div>
      <div className={styles.cartSkeletonPrice}>
        <div className={styles.cartSkeletonShimmer} />
      </div>
      <div className={styles.cartSkeletonQty}>
        <div className={styles.cartSkeletonShimmer} />
      </div>
      <div className={styles.cartSkeletonSum}>
        <div className={styles.cartSkeletonShimmer} />
      </div>
    </article>
  ))

  const clampNumber = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

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

  const getQuantityValue = (productId: string, quantity: number) =>
    quantityDrafts[productId] ?? String(quantity)

  const handleQuantityInputChange = (productId: string, value: string) => {
    const item = items.find((entry) => entry.product.id === productId)

    if (!item) {
      return
    }

    const normalizedValue = value.replace(/[^\d]/g, '')
    const limitedValue = normalizedValue
      ? String(
          clampNumber(Number(normalizedValue), 1, Math.max(1, item.product.inStock))
        )
      : ''

    setQuantityDrafts((current) => ({
      ...current,
      [productId]: limitedValue
    }))
  }

  const commitQuantityInput = (
    productId: string,
    fallbackQuantity: number,
    rawValue?: string
  ) => {
    const draftValue = (rawValue ?? quantityDrafts[productId] ?? '').replace(/[^\d]/g, '')

    if (!draftValue) {
      setQuantityDrafts((current) => ({
        ...current,
        [productId]: String(fallbackQuantity)
      }))
      return
    }

    const nextQuantity = Math.max(1, Number(draftValue))

    dispatch(
      setQuantity({
        productId,
        quantity: nextQuantity
      })
    )

    setQuantityDrafts((current) => {
      const nextDrafts = { ...current }
      delete nextDrafts[productId]
      return nextDrafts
    })
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

        {!isHydrated ? (
          <>
            <div className={styles.tableHeader}>
              <span>Товар</span>
              <span>Цена</span>
              <span>Кол-во</span>
              <span>Сумма</span>
              <span />
            </div>

            <div className={styles.itemsList}>{cartSkeleton}</div>

            <div className={`${styles.summaryCard} ${styles.summaryCardSkeleton}`}>
              <div className={styles.cartSummaryLine}>
                <div className={styles.cartSkeletonShimmer} />
              </div>
              <div className={styles.cartSummaryMetaLine}>
                <div className={styles.cartSkeletonShimmer} />
              </div>
              <div className={styles.cartSummaryMetaLineShort}>
                <div className={styles.cartSkeletonShimmer} />
              </div>
              <div className={styles.cartSummaryButton}>
                <div className={styles.cartSkeletonShimmer} />
              </div>
            </div>
          </>
        ) : hasItems ? (
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
                const isAtStockLimit = item.quantity >= item.product.inStock

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
                      <input
                        aria-label={`Количество товара ${item.product.name}`}
                        className={styles.quantityInput}
                        inputMode='numeric'
                        onBlur={() =>
                          commitQuantityInput(
                            item.product.id,
                            item.quantity,
                            getQuantityValue(item.product.id, item.quantity)
                          )
                        }
                        onChange={(event) =>
                          handleQuantityInputChange(item.product.id, event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            commitQuantityInput(
                              item.product.id,
                              item.quantity,
                              event.currentTarget.value
                            )
                            event.currentTarget.blur()
                          }
                        }}
                        type='text'
                        value={getQuantityValue(item.product.id, item.quantity)}
                      />
                      <button
                        disabled={isAtStockLimit}
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
