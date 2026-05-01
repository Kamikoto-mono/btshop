import type { IMeResponseDto } from './types'

export interface IAdminUser {
  email: string
  id: string
}

export const mapAdminUser = (dto: IMeResponseDto): IAdminUser => ({
  email: dto.email,
  id: dto.sub
})
