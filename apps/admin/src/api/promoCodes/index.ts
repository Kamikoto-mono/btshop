import { adminApi } from '../config'
import { mapPromoCode } from './model'
import type {
  IAdminPromoCodeDto,
  IAdminPromoCodesListDto,
  IDeletePromoCodeResponseDto,
  IUpsertPromoCodeDto
} from './types'

const getPromoCodes = async () => {
  const { data } = await adminApi.get<IAdminPromoCodesListDto>('/admin/promo-codes')
  return data.map(mapPromoCode)
}

const createPromoCode = async (payload: IUpsertPromoCodeDto) => {
  const { data } = await adminApi.post<IAdminPromoCodeDto>('/admin/promo-codes', payload)
  return mapPromoCode(data)
}

const updatePromoCode = async (id: string, payload: IUpsertPromoCodeDto) => {
  const { data } = await adminApi.patch<IAdminPromoCodeDto>(
    `/admin/promo-codes/${id}`,
    payload
  )
  return mapPromoCode(data)
}

const deletePromoCode = async (id: string) => {
  const { data } = await adminApi.delete<IDeletePromoCodeResponseDto>(
    `/admin/promo-codes/${id}`
  )
  return data
}

export const promoCodesApi = {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  updatePromoCode
}
