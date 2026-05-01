import type { IAuthMeResponseDto, IUpdateProfileRequestDto } from './types'

export interface IUserProfile {
  address: string
  email: string
  fullName: string
  id: string
  postalCode: string
  tel: string
  telegramUsername: string
}

export interface IUpdateUserProfilePayload {
  address: string
  fullName: string
  postalCode: string
  tel: string
  telegramUsername: string
}

export const mapUserProfile = (dto: IAuthMeResponseDto): IUserProfile => ({
  address: dto.address ?? '',
  email: dto.email,
  fullName: dto.fullName ?? '',
  id: dto.id,
  postalCode: dto.index ?? '',
  tel: dto.tel ?? '',
  telegramUsername: dto.telegramUsername ?? ''
})

export const mapProfileUpdatePayload = ({
  address,
  fullName,
  postalCode,
  tel,
  telegramUsername
}: IUpdateUserProfilePayload): IUpdateProfileRequestDto => ({
  address,
  fullName,
  index: postalCode,
  tel,
  telegramUsername
})
