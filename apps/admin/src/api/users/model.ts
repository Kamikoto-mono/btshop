import type { IAdminUserDto } from './types'

export interface IAdminListUser {
  address: string
  email: string
  fullName: string
  id: string
  postalCode: string
  role: string
  tel: string
  telegramUsername: string
}

export const mapUser = (dto: IAdminUserDto): IAdminListUser => ({
  address: dto.address,
  email: dto.email,
  fullName: dto.fullName,
  id: dto.id,
  postalCode: dto.index,
  role: dto.role,
  tel: dto.tel,
  telegramUsername: dto.telegramUsername
})
