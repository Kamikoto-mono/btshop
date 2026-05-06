'use client'

import { useEffect, useMemo, useState } from 'react'
import { App, Button, DatePicker, Empty, Typography } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { statisticsApi } from '@/api/statistics'
import type { IAdminOrdersStatistics } from '@/api/statistics/model'
import { AdminFilterField, AdminFiltersPanel } from '@/components/ui'
import styles from './StatisticsPage.module.scss'

type DateRangeValue = [Dayjs, Dayjs]

const { RangePicker } = DatePicker

const getDefaultRange = (): DateRangeValue => [dayjs().subtract(6, 'day'), dayjs()]

const getTodayRange = (): DateRangeValue => [dayjs(), dayjs()]

const formatApiDate = (value: Dayjs) => value.format('YYYY-MM-DD')

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ')

const formatInteger = (value: number) => new Intl.NumberFormat('ru-RU').format(value)

const tooltipFormatter = (value: unknown, name: unknown): [string, string] => {
  const label = typeof name === 'string' ? name : ''
  const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0)

  if (label === 'Заказы') {
    return [formatInteger(numericValue), label]
  }

  return [`${formatCurrency(numericValue)} ₽`, label]
}

export const StatisticsPage = () => {
  const { message } = App.useApp()
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultRange)
  const [isLoading, setIsLoading] = useState(true)
  const [statistics, setStatistics] = useState<IAdminOrdersStatistics | null>(null)

  const loadStatistics = async (nextRange = dateRange) => {
    setIsLoading(true)

    try {
      const response = await statisticsApi.getOrdersStatistics({
        from: formatApiDate(nextRange[0]),
        to: formatApiDate(nextRange[1])
      })

      setStatistics(response)
    } catch {
      message.error('Не удалось загрузить статистику заказов.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadStatistics(dateRange)
  }, [dateRange])

  const chartData = useMemo(
    () =>
      (statistics?.days ?? []).map((day) => ({
        averageCheck: day.averageCheck,
        date: day.date,
        expense: day.expense,
        netProfit: day.netProfit,
        revenue: day.revenue,
        totalOrders: day.totalOrders
      })),
    [statistics]
  )

  const summaryItems = useMemo(
    () => [
      {
        label: 'Заказов за период',
        value: statistics ? formatInteger(statistics.totalOrders) : '0'
      },
      {
        label: 'Средний чек',
        value: statistics ? `${formatCurrency(statistics.averageCheck)} ₽` : '0 ₽'
      },
      {
        label: 'Приход',
        value: statistics ? `${formatCurrency(statistics.revenue)} ₽` : '0 ₽'
      },
      {
        label: 'Расход',
        value: statistics ? `${formatCurrency(statistics.expense)} ₽` : '0 ₽'
      },
      {
        className:
          statistics && statistics.netProfit < 0
            ? styles.summaryValueNegative
            : styles.summaryValuePositive,
        label: 'Доход',
        value: statistics ? `${formatCurrency(statistics.netProfit)} ₽` : '0 ₽'
      }
    ],
    [statistics]
  )

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <Typography.Title className={styles.heading} level={1}>
            Статистика
          </Typography.Title>
        </div>
      </div>

      <AdminFiltersPanel contentClassName={styles.filtersGrid}>
        <AdminFilterField className={styles.dateRange} label='Период'>
          <RangePicker
            allowClear={false}
            format='DD.MM.YYYY'
            onChange={(dates) => {
              if (!dates?.[0] || !dates[1]) {
                return
              }

              setDateRange([dates[0], dates[1]])
            }}
            value={dateRange}
          />
        </AdminFilterField>

        <AdminFilterField label='Обновление'>
          <Button loading={isLoading} onClick={() => void loadStatistics(dateRange)}>
            Обновить статистику
          </Button>
        </AdminFilterField>

        <AdminFilterField label='Сброс'>
          <Button
            onClick={() => {
              setDateRange(getTodayRange())
            }}
          >
            Сбросить к дню
          </Button>
        </AdminFilterField>
      </AdminFiltersPanel>

      <div className={styles.chartsGrid}>
        <section className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Заказы и средний чек</h2>
          </div>

          <div className={styles.chartBox}>
            {chartData.length ? (
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid stroke='rgba(125, 144, 171, 0.16)' vertical={false} />
                  <XAxis dataKey='date' stroke='#7d90ab' tickLine={false} axisLine={false} />
                  <YAxis
                    allowDecimals={false}
                    stroke='#7d90ab'
                    tickLine={false}
                    axisLine={false}
                    width={36}
                    yAxisId='orders'
                  />
                  <YAxis
                    hide
                    yAxisId='money'
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar
                    dataKey='totalOrders'
                    fill='#4f88eb'
                    name='Заказы'
                    radius={[8, 8, 0, 0]}
                    yAxisId='orders'
                  />
                  <Line
                    dataKey='averageCheck'
                    dot={{ r: 3 }}
                    name='Средний чек'
                    stroke='#16304f'
                    strokeWidth={3}
                    type='monotone'
                    yAxisId='money'
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <Empty description='Нет данных за выбранный период' />
              </div>
            )}
          </div>
        </section>

        <section className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Финансы по дням</h2>
          </div>

          <div className={styles.chartBox}>
            {chartData.length ? (
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke='rgba(125, 144, 171, 0.16)' vertical={false} />
                  <XAxis dataKey='date' stroke='#7d90ab' tickLine={false} axisLine={false} />
                  <YAxis
                    stroke='#7d90ab'
                    tickFormatter={(value: number) => `${formatInteger(value)}`}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Line
                    dataKey='revenue'
                    dot={{ r: 2.5 }}
                    name='Приход'
                    stroke='#4f88eb'
                    strokeWidth={3}
                    type='monotone'
                  />
                  <Line
                    dataKey='expense'
                    dot={{ r: 2.5 }}
                    name='Расход'
                    stroke='#f29f4b'
                    strokeWidth={3}
                    type='monotone'
                  />
                  <Line
                    dataKey='netProfit'
                    dot={{ r: 2.5 }}
                    name='Доход'
                    stroke='#228b5a'
                    strokeWidth={3}
                    type='monotone'
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>
                <Empty description='Нет данных за выбранный период' />
              </div>
            )}
          </div>
        </section>
      </div>

      <section className={styles.summarySection}>
        <h2 className={styles.summaryTitle}>Итоги за период</h2>
        <div className={styles.summaryGrid}>
          {summaryItems.map((item) => (
            <article className={styles.summaryCard} key={item.label}>
              <span className={styles.summaryLabel}>{item.label}</span>
              <strong className={`${styles.summaryValue} ${item.className ?? ''}`}>
                {item.value}
              </strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
