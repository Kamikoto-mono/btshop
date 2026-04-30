export interface IApiErrorDto {
  error: string
  message: string
  statusCode: number
}

export interface IAuthTokenPairDto {
  accessToken: string
  refreshToken: string
}

export interface ILoginRequestDto {
  email: string
  password: string
}

export interface IRegisterRequestDto {
  email: string
  password: string
}

export interface IRefreshRequestDto {
  refreshToken: string
}

export interface IPasswordResetRequestDto {
  email: string
}

export interface IPasswordResetConfirmRequestDto {
  code: string
  email: string
  newPassword: string
  newPasswordRepeat: string
}

export interface IMessageResponseDto {
  message: string
}

export interface IAuthMeResponseDto {
  adress: string | null
  email: string
  fullName: string | null
  id: string
  index: string | null
  tel: string | null
  telegramUsername: string | null
}

export interface IUpdateProfileRequestDto {
  adress: string
  fullName: string
  index: string
  tel: string
  telegramUsername: string
}
