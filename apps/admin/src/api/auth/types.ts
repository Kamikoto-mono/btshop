export interface ILoginRequestDto {
  email: string
  password: string
}

export interface ITokenPairDto {
  accessToken: string
  refreshToken: string
}

export interface IRefreshRequestDto {
  refreshToken: string
}

export interface IMeResponseDto {
  sub: string
  email: string
  role: string
}
