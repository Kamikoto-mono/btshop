import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IUserSession {
  email: string
}

interface IAuthState {
  isOpen: boolean
  mode: 'login' | 'register'
  user: IUserSession | null
}

const initialState: IAuthState = {
  isOpen: false,
  mode: 'login',
  user: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (
      state,
      action: PayloadAction<'login' | 'register' | undefined>
    ) => {
      state.isOpen = true
      state.mode = action.payload ?? 'login'
    },
    closeAuthModal: (state) => {
      state.isOpen = false
    },
    setAuthMode: (state, action: PayloadAction<'login' | 'register'>) => {
      state.mode = action.payload
    },
    setUserSession: (state, action: PayloadAction<IUserSession | null>) => {
      state.user = action.payload
      state.isOpen = false
    },
    hydrateUserSession: (state, action: PayloadAction<IUserSession | null>) => {
      state.user = action.payload
    },
    logout: (state) => {
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
