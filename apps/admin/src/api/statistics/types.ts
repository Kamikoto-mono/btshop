export interface IAdminStatisticsDayDto {
  averageCheck: number
  date: string
  expense: number
  netProfit: number
  revenue: number
  totalOrders: number
}

export interface IAdminOrdersStatisticsDto {
  averageCheck: number
  days: IAdminStatisticsDayDto[]
  expense: number
  netProfit: number
  revenue: number
  totalOrders: number
}

export interface IAdminOrdersStatisticsQuery {
  from: string
  to: string
}
