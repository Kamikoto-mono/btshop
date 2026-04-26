'use client'

import { IProduct } from '@btshop/shared'

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
  const quantity = useAppSelector(
    (state) =>
      state.cart.items.find((item) => item.product.id === product.id)?.quantity ?? 0
  )

  if (quantity > 0) {
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
          onClick={() => dispatch(increaseQuantity(product.id))}
          type='button'
        >
          +
        </button>
      </div>
    )
  }

  return (
    <Button fullWidth onClick={() => dispatch(addItem(product))} size='lg'>
      В корзину
    </Button>
  )
}
