import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface IUserSession {
  address: string
  email: string
  fullName: string
  id: string
  postalCode: string
  tel: string
  telegramUsername: string
}

interface IAuthState {
  isHydrated: boolean
  isOpen: boolean
  mode: 'login' | 'register'
  redirectTo: string | null
  user: IUserSession | null
}

const initialState: IAuthState = {
  isHydrated: false,
  isOpen: false,
  mode: 'login',
  redirectTo: null,
  user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (
      state,
      action: PayloadAction<
        | {
            mode?: 'login' | 'register'
            redirectTo?: string | null
          }
        | undefined
      >
    ) => {
      state.isOpen = true
      state.mode = action.payload?.mode ?? 'login'
      state.redirectTo = action.payload?.redirectTo ?? null
    },
    closeAuthModal: (state) => {
      state.isOpen = false
      state.redirectTo = null
    },
    setAuthMode: (state, action: PayloadAction<'login' | 'register'>) => {
      state.mode = action.payload
    },
    setUserSession: (state, action: PayloadAction<IUserSession | null>) => {
      state.isHydrated = true
      state.user = action.payload
      state.isOpen = false
      state.redirectTo = null
    },
    hydrateUserSession: (state, action: PayloadAction<IUserSession | null>) => {
      state.isHydrated = true
      state.user = action.payload
    },
    logout: (state) => {
      state.isHydrated = true
      state.user = null
    }
  }
})

export const {
  closeAuthModal,
  hydrateUserSession,
  logout,
  openAuthModal,
  setAuthMode,
  setUserSession
} = authSlice.actions

export const authReducer = authSlice.reducer
