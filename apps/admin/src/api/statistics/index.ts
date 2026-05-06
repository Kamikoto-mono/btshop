import { adminApi } from '../config'
import { mapOrdersStatistics } from './model'
import type { IAdminOrdersStatisticsQuery, IAdminOrdersStatisticsDto } from './types'

const getOrdersStatistics = async (params: IAdminOrdersStatisticsQuery) => {
  const { data } = await adminApi.get<IAdminOrdersStatisticsDto>(
    '/admin/statistics/orders',
    {
      params: {
        from: params.from,
        to: params.to
      }
    }
  )

  return mapOrdersStatistics(data)
}

export const statisticsApi = {
  getOrdersStatistics
}
