import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  publicApi,
  setStoredTokens
} from '../config'
import { mapAdminUser } from './model'
import type {
  ILoginRequestDto,
  IMeResponseDto,
  IRefreshRequestDto,
  ITokenPairDto
} from './types'

const login = async (payload: ILoginRequestDto) => {
  const { data } = await publicApi.post<ITokenPairDto>('/auth/login', payload)
  setStoredTokens(data)
  return data
}

const refresh = async (payload: IRefreshRequestDto) => {
  const { data } = await publicApi.post<ITokenPairDto>('/auth/refresh', payload)
  setStoredTokens(data)
  return data
}

const me = async () => {
  const { adminApi } = await import('../config')
  const { data } = await adminApi.get<IMeResponseDto>('/auth/me')
  const user = mapAdminUser(data)

  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return user
}

const logout = () => {
  clearStoredTokens()
}

const hasSession = () => Boolean(getStoredAccessToken() || getStoredRefreshToken())

export const authApi = {
  hasSession,
  login,
  logout,
  me,
  refresh
}
