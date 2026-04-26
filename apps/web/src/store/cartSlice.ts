import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { IProduct } from '@btshop/shared'

export interface ICartItem {
  product: IProduct
  quantity: number
}

interface ICartState {
  items: ICartItem[]
  isOpen: boolean
}

const initialState: ICartState = {
  items: [],
  isOpen: false
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<ICartItem[]>) => {
      state.items = action.payload
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
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product.id !== action.payload)
    },
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.product.id === action.payload)

      if (item) {
        item.quantity += 1
      }
    },
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.product.id === action.payload)

      if (!item) {
        return
      }

      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.product.id !== action.payload)
        return
      }

      item.quantity -= 1
    },
    clearCart: (state) => {
      state.items = []
      state.isOpen = false
    },
    openCart: (state) => {
      state.isOpen = true
    },
    closeCart: (state) => {
      state.isOpen = false
    }
  }
})

export const {
  addItem,
  clearCart,
  closeCart,
  decreaseQuantity,
  hydrateCart,
  increaseQuantity,
  openCart,
  removeItem
} = cartSlice.actions

export const cartReducer = cartSlice.reducer
