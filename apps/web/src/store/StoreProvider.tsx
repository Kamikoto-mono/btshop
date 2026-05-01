'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { Provider } from 'react-redux'

import { authApi } from '@/api/auth'
import { hydrateUserSession } from './authSlice'
import { hydrateCart, ICartItem } from './cartSlice'
import { useAppSelector } from './hooks'
import { createStore, TAppStore } from './store'

const CART_STORAGE_KEY = 'btshop-cart'
const AUTH_STORAGE_KEY = 'btshop-auth'

const CartStorageSync = ({ isHydrated }: { isHydrated: boolean }) => {
  const items = useAppSelector((state) => state.cart.items)
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [isHydrated, items])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      return
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [isHydrated, user])

  return null
}

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<TAppStore | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  useEffect(() => {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY)

    if (rawValue) {
      try {
        storeRef.current?.dispatch(hydrateCart(JSON.parse(rawValue) as ICartItem[]))
      } catch {
        storeRef.current?.dispatch(hydrateCart([]))
      }
    }

    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

    if (rawSession) {
      try {
        storeRef.current?.dispatch(hydrateUserSession(JSON.parse(rawSession)))
      } catch {
        storeRef.current?.dispatch(hydrateUserSession(null))
      }
    }

    if (!authApi.hasSession()) {
      storeRef.current?.dispatch(hydrateUserSession(null))
      setIsHydrated(true)
      return
    }

    authApi
      .me()
      .then((user) => {
        storeRef.current?.dispatch(hydrateUserSession(user))
      })
      .catch(() => {
        authApi.logout()
        storeRef.current?.dispatch(hydrateUserSession(null))
      })
      .finally(() => {
        setIsHydrated(true)
      })
  }, [])

  return (
    <Provider store={storeRef.current}>
      <CartStorageSync isHydrated={isHydrated} />
      {children}
    </Provider>
  )
}
