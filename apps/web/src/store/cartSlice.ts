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

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<THydrateCartPayload>) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload
        return
      }

      state.items = action.payload.items ?? []
      state.promoCode = action.payload.promoCode ?? ''
      state.promoMessage = action.payload.promoMessage ?? ''
      state.promoStatus = action.payload.promoStatus ?? 'idle'
      state.promoValidation = action.payload.promoValidation ?? null
    },
    addItem: (state, action: PayloadAction<IProduct>) => {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      )

      if (!existingItem) {
        state.items.push({
          product: action.payload,
          quantity: 1
        })
      } else {
        existingItem.quantity += 1
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
        item.quantity += 1
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

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(
          (entry) => entry.product.id !== action.payload.productId
        )
        invalidatePromo(state)
        return
      }

      item.quantity = action.payload.quantity
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
