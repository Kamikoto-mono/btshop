import type {
  IAdminOrdersStatisticsDto,
  IAdminStatisticsDayDto
} from './types'

export interface IAdminStatisticsDay {
  averageCheck: number
  date: string
  expense: number
  netProfit: number
  revenue: number
  totalOrders: number
}

export interface IAdminOrdersStatistics {
  averageCheck: number
  days: IAdminStatisticsDay[]
  expense: number
  netProfit: number
  revenue: number
  totalOrders: number
}

const mapStatisticsDay = (dto: IAdminStatisticsDayDto): IAdminStatisticsDay => ({
  averageCheck: dto.averageCheck,
  date: dto.date,
  expense: dto.expense,
  netProfit: dto.netProfit,
  revenue: dto.revenue,
  totalOrders: dto.totalOrders
})

export const mapOrdersStatistics = (
  dto: IAdminOrdersStatisticsDto
): IAdminOrdersStatistics => ({
  averageCheck: dto.averageCheck,
  days: dto.days.map(mapStatisticsDay),
  expense: dto.expense,
  netProfit: dto.netProfit,
  revenue: dto.revenue,
  totalOrders: dto.totalOrders
})
