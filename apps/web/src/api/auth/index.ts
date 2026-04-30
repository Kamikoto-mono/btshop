import { AxiosError } from 'axios'

import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  privateApi,
  publicApi,
  setStoredTokens
} from '../config'
import {
  mapProfileUpdatePayload,
  mapUserProfile,
  type IUpdateUserProfilePayload
} from './model'
import type {
  IApiErrorDto,
  IAuthMeResponseDto,
  IAuthTokenPairDto,
  ILoginRequestDto,
  IMessageResponseDto,
  IPasswordResetConfirmRequestDto,
  IPasswordResetRequestDto,
  IRefreshRequestDto,
  IRegisterRequestDto
} from './types'

const login = async (payload: ILoginRequestDto) => {
  const { data } = await publicApi.post<IAuthTokenPairDto>('/auth/login', payload)
  setStoredTokens(data)
  return data
}

const register = async (payload: IRegisterRequestDto) => {
  const { data } = await publicApi.post<IAuthTokenPairDto>('/auth/register', payload)
  setStoredTokens(data)
  return data
}

const refresh = async (payload: IRefreshRequestDto) => {
  const { data } = await publicApi.post<IAuthTokenPairDto>('/auth/refresh', payload)
  setStoredTokens(data)
  return data
}

const requestPasswordReset = async (payload: IPasswordResetRequestDto) => {
  const { data } = await publicApi.post<IMessageResponseDto>(
    '/auth/password-reset/request',
    payload
  )

  return data
}

const confirmPasswordReset = async (
  payload: IPasswordResetConfirmRequestDto
) => {
  const { data } = await publicApi.post<IMessageResponseDto>(
    '/auth/password-reset/confirm',
    payload
  )

  return data
}

const me = async () => {
  const { data } = await privateApi.get<IAuthMeResponseDto>('/auth/me')
  return mapUserProfile(data)
}

const updateMe = async (payload: IUpdateUserProfilePayload) => {
  const { data } = await privateApi.patch<IAuthMeResponseDto>(
    '/auth/me',
    mapProfileUpdatePayload(payload)
  )

  return mapUserProfile(data)
}

const logout = () => {
  clearStoredTokens()
}

const hasSession = () => Boolean(getStoredAccessToken() || getStoredRefreshToken())

export const getAuthApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  if (error instanceof AxiosError) {
    const responseMessage = (error.response?.data as IApiErrorDto | undefined)?.message

    if (responseMessage) {
      return responseMessage
    }
  }

  return fallbackMessage
}

export const authApi = {
  confirmPasswordReset,
  hasSession,
  login,
  logout,
  me,
  refresh,
  register,
  requestPasswordReset,
  updateMe
}
