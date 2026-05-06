import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { IProduct } from '@/api/products/model'

export interface ICartItem {
  product: IProduct
  quantity: number
}

export interface ICartPromoValidation {
  finalAmount: number
  originalAmount: number
  promoCode: string
  promoDiscount: number
}

type TCartPromoStatus = 'idle' | 'invalid' | 'valid'

interface ICartState {
  isHydrated: boolean
  items: ICartItem[]
  isOpen: boolean
  promoCode: string
  promoMessage: string
  promoStatus: TCartPromoStatus
  promoValidation: ICartPromoValidation | null
}

type THydrateCartPayload =
  | ICartItem[]
  | {
      items?: ICartItem[]
      promoCode?: string
      promoMessage?: string
      promoStatus?: TCartPromoStatus
      promoValidation?: ICartPromoValidation | null
    }

const initialState: ICartState = {
  isHydrated: false,
  items: [],
  isOpen: false,
  promoCode: '',
  promoMessage: '',
  promoStatus: 'idle',
  promoValidation: null
}

const invalidatePromo = (state: ICartState) => {
  state.promoMessage = ''
  state.promoStatus = 'idle'
  state.promoValidation = null
}

const clampQuantityToStock = (quantity: number, inStock: number) => {
  if (inStock <= 0) {
    return 0
  }

  return Math.min(quantity, inStock)
}

const sanitizeCartItems = (items: ICartItem[]) =>
  items
    .map((item) => ({
      ...item,
      quantity: clampQuantityToStock(item.quantity, item.product.inStock)
    }))
    .filter((item) => item.quantity > 0)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<THydrateCartPayload>) => {
      state.isHydrated = true

      if (Array.isArray(action.payload)) {
        state.items = sanitizeCartItems(action.payload)
        return
      }

      state.items = sanitizeCartItems(action.payload.items ?? [])
      state.promoCode = action.payload.promoCode ?? ''
      state.promoMessage = action.payload.promoMessage ?? ''
      state.promoStatus = action.payload.promoStatus ?? 'idle'
      state.promoValidation = action.payload.promoValidation ?? null
    },
    addItem: (state, action: PayloadAction<IProduct>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      )

      if (action.payload.inStock <= 0) {
        return
      }

      if (!existingItem) {
        state.items.push({
          product: action.payload,
          quantity: 1
        })
      } else {
        existingItem.quantity = clampQuantityToStock(
          existingItem.quantity + 1,
          existingItem.product.inStock
        )
      }

      invalidatePromo(state)
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload)
      invalidatePromo(state)
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.product.id === action.payload)

      if (item) {
        item.quantity = clampQuantityToStock(item.quantity + 1, item.product.inStock)
        invalidatePromo(state)
      }
    },
    setQuantity: (
      state,
      action: PayloadAction<{
        productId: string
        quantity: number
      }>
    ) => {
      const item = state.items.find(
        (entry) => entry.product.id === action.payload.productId
      )

      if (!item) {
        return
      }

      const nextQuantity = clampQuantityToStock(
        action.payload.quantity,
        item.product.inStock
      )

      if (nextQuantity <= 0) {
        state.items = state.items.filter(
          (entry) => entry.product.id !== action.payload.productId
        )
        invalidatePromo(state)
        return
      }

      item.quantity = nextQuantity
      invalidatePromo(state)
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.product.id === action.payload)

      if (!item) {
        return
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.product.id !== action.payload)
        invalidatePromo(state)
        return
      }

      item.quantity -= 1
      invalidatePromo(state)
    },
    clearCart: (state) => {
      state.items = []
      state.isOpen = false
      state.promoCode = ''
      state.promoMessage = ''
      state.promoStatus = 'idle'
      state.promoValidation = null
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = action.payload

      if (
        state.promoValidation &&
        state.promoValidation.promoCode !== action.payload.trim().toUpperCase()
      ) {
        invalidatePromo(state)
      }
    },
    setPromoValidationSuccess: (
      state,
      action: PayloadAction<{
        message: string
        validation: ICartPromoValidation
      }>
    ) => {
      state.promoCode = action.payload.validation.promoCode
      state.promoMessage = action.payload.message
      state.promoStatus = 'valid'
      state.promoValidation = action.payload.validation
    },
    setPromoValidationError: (state, action: PayloadAction<string>) => {
      state.promoMessage = action.payload
      state.promoStatus = 'invalid'
      state.promoValidation = null
    },
    clearPromoState: (state) => {
      state.promoCode = ''
      state.promoMessage = ''
      state.promoStatus = 'idle'
      state.promoValidation = null
    }
  }
})

export const {
  addItem,
  clearPromoState,
  clearCart,
  closeCart,
  decreaseQuantity,
  hydrateCart,
  increaseQuantity,
  openCart,
  removeItem,
  setPromoCode,
  setQuantity,
  setPromoValidationError,
  setPromoValidationSuccess
} = cartSlice.actions

export const cartReducer = cartSlice.reducer
