import axios, {
  AxiosError,
  type InternalAxiosRequestConfig
} from 'axios'

import { API_BASE_URL } from '@btshop/shared'

const ACCESS_TOKEN_KEY = 'btshop-admin-access-token'
const REFRESH_TOKEN_KEY = 'btshop-admin-refresh-token'

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

interface ITokenPair {
  accessToken: string
  refreshToken: string
}

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const getStoredRefreshToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY)
}

export const setStoredTokens = ({ accessToken, refreshToken }: ITokenPair) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const clearStoredTokens = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const publicApi = axios.create({
  baseURL: API_BASE_URL
})

export const adminApi = axios.create({
  baseURL: API_BASE_URL
})

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    clearStoredTokens()
    return null
  }

  try {
    const { data } = await publicApi.post<ITokenPair>('/auth/refresh', {
      refreshToken
    })

    setStoredTokens(data)
    return data.accessToken
  } catch {
    clearStoredTokens()
    return null
  }
}

adminApi.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

adminApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const nextAccessToken = await refreshPromise

    if (!nextAccessToken) {
      return Promise.reject(error)
    }

    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
    return adminApi(originalRequest)
  }
)

export { API_BASE_URL, publicApi }
