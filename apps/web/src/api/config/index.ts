import axios from 'axios'

export const API_BASE_URL = 'https://api.battletoads.shop/api'
const ACCESS_TOKEN_KEY = 'btshop-access-token'

export const getStoredAccessToken = () => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

export const publicApi = axios.create({
  baseURL: API_BASE_URL
})

export const privateApi = axios.create({
  baseURL: API_BASE_URL
})

privateApi.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})
