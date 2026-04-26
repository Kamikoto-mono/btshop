import { configureStore } from '@reduxjs/toolkit'

import { authReducer } from './authSlice'
import { cartReducer } from './cartSlice'

export const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer
    }
  })

export type TAppStore = ReturnType<typeof createStore>
export type TRootState = ReturnType<TAppStore['getState']>
export type TAppDispatch = TAppStore['dispatch']
