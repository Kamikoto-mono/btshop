'use client'

import { useEffect, useState } from 'react'

import { IProduct } from '@/api/products/model'

import { Button } from '@/components/ui'
import {
  addItem,
  decreaseQuantity,
  increaseQuantity
} from '@/store/cartSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './AddToCartButton.module.scss'

export const AddToCartButton = ({ product }: { product: IProduct }) => {
  const dispatch = useAppDispatch()
  const [isMounted, setIsMounted] = useState(false)
  const quantity = useAppSelector(
    (state) =>
      state.cart.items.find((item) => item.product.id === product.id)?.quantity ?? 0
  )
  const isOutOfStock = product.inStock <= 0
  const isAtStockLimit = quantity >= product.inStock

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isMounted && quantity > 0) {
    return (
      <div className={styles.stepper}>
        <button
          aria-label={`Уменьшить количество ${product.name}`}
          className={styles.stepperButton}
          onClick={() => dispatch(decreaseQuantity(product.id))}
          type='button'
        >
          -
        </button>

        <span className={styles.stepperValue}>{quantity}</span>

        <button
          aria-label={`Увеличить количество ${product.name}`}
          className={styles.stepperButton}
          disabled={isAtStockLimit}
          onClick={() => dispatch(increaseQuantity(product.id))}
          type='button'
        >
          +
        </button>
      </div>
    )
  }

  return (
    <Button
      disabled={isOutOfStock}
      fullWidth
      onClick={() => dispatch(addItem(product))}
      size='lg'
    >
      {isOutOfStock ? 'Нет в наличии' : 'В корзину'}
    </Button>
  )
}
