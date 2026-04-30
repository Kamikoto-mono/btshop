import type { IMeResponseDto } from './types'

export interface IAdminUser {
  email: string
  id: string
  role: string
}

export const mapAdminUser = (dto: IMeResponseDto): IAdminUser => ({
  email: dto.email,
  id: dto.sub,
  role: dto.role
})

export const isAdminUser = (user: IAdminUser) => user.role === 'admin'
