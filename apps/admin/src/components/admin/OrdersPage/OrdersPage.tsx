'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  DatePicker,
  Empty,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
  type TablePaginationConfig
} from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { ordersApi } from '@/api/orders'
import type { IAdminOrder } from '@/api/orders/model'
import { AdminDataTable, AdminFilterField, AdminFiltersPanel } from '@/components/ui'
import { OrderUpsertModal } from './OrderUpsertModal'
import styles from './OrdersPage.module.scss'

interface IOrderFilters {
  createdFrom?: string
  createdTo?: string
  status?: string
}

const PAGE_SIZE = 10
const { RangePicker } = DatePicker

const STATUS_OPTIONS = [
  { label: 'Создан', value: 'Создан' },
  { label: 'Оплачен', value: 'Оплачен' },
  { label: 'В работе', value: 'В работе' }
]

const getStatusClassName = (status: string) => {
  if (status === 'Оплачен') {
    return styles.statusPaid
  }

  if (status === 'В работе') {
    return styles.statusActive
  }

  return styles.statusCreated
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))

const formatRangeDate = (value: Date) => value.toISOString()

export const OrdersPage = () => {
  const { message } = App.useApp()
  const [filters, setFilters] = useState<IOrderFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<IAdminOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)

  const loadOrders = async (page = currentPage, nextFilters = filters) => {
    setIsLoading(true)

    try {
      const response = await ordersApi.getOrders({
        createdFrom: nextFilters.createdFrom,
        createdTo: nextFilters.createdTo,
        limit: PAGE_SIZE,
        page,
        status: nextFilters.status
      })

      setOrders(response.items)
      setCurrentPage(response.meta.page)
      setTotalOrders(response.meta.total)
    } catch {
      message.error('Не удалось загрузить заказы.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders(currentPage, filters)
  }, [currentPage, filters])

  const applyFilters = (updater: (current: IOrderFilters) => IOrderFilters) => {
    setFilters((current) => updater(current))
    setCurrentPage(1)
  }

  const columns = useMemo<ColumnsType<IAdminOrder>>(
    () => [
      {
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDateTime(value),
        title: 'Дата',
        width: 180
      },
      {
        dataIndex: 'fullName',
        key: 'fullName',
        render: (_, order) => (
          <div className={styles.customerCell}>
            <span className={styles.customerName}>{order.fullName}</span>
            <span className={styles.customerMeta}>{order.email}</span>
            <span className={styles.customerMeta}>{order.tel}</span>
          </div>
        ),
        title: 'Клиент',
        width: 260
      },
      {
        dataIndex: 'products',
        key: 'products',
        render: (products: IAdminOrder['products']) => (
          <div className={styles.productsCell}>
            {products.map((product) => (
              <span className={styles.productLine} key={product.productId}>
                {product.name} · {product.quantity} шт.
              </span>
            ))}
          </div>
        ),
        title: 'Товары',
        width: 420
      },
      {
        dataIndex: 'delivery',
        key: 'delivery',
        render: (value: string) => <Tag>{value}</Tag>,
        title: 'Доставка',
        width: 120
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => <Tag className={getStatusClassName(value)}>{value}</Tag>,
        title: 'Статус',
        width: 130
      },
      {
        dataIndex: 'amount',
        key: 'amount',
        render: (value: number) => `${value} ₽`,
        title: 'Сумма',
        width: 120
      },
      {
        dataIndex: 'address',
        key: 'address',
        render: (_, order) => (
          <div className={styles.customerCell}>
            <span>{order.address}</span>
            <span className={styles.customerMeta}>Индекс: {order.postalCode}</span>
            <span className={styles.customerMeta}>
              Telegram: {order.telegramUsername || 'не указан'}
            </span>
          </div>
        ),
        title: 'Контакты / адрес',
        width: 260
      },
      {
        key: 'actions',
        render: (_, order) => (
          <div className={styles.actions}>
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditingOrderId(order.id)}
              size='small'
              type='text'
            />
            <Popconfirm
              cancelText='Нет'
              okText='Да'
              onConfirm={() =>
                ordersApi
                  .deleteOrder(order.id)
                  .then(async () => {
                    message.success('Заказ удалён.')
                    await loadOrders(currentPage)
                  })
                  .catch(() => {
                    message.error('Не удалось удалить заказ.')
                  })
              }
              title='Удалить заказ?'
            >
              <Button icon={<DeleteOutlined />} size='small' type='text' />
            </Popconfirm>
          </div>
        ),
        title: '',
        width: 44
      }
    ],
    [currentPage, message]
  )

  const handleTableChange = (pagination: TablePaginationConfig) => {
    void loadOrders(pagination.current ?? 1)
  }

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <Typography.Title className={styles.heading} level={1}>
          Заказы
        </Typography.Title>
      </div>

      <AdminFiltersPanel contentClassName={styles.filtersGrid}>
        <AdminFilterField label='Статус'>
          <Select
            allowClear
            onChange={(value) =>
              applyFilters((current) => ({
                ...current,
                status: value
              }))
            }
            options={STATUS_OPTIONS}
            placeholder='Все статусы'
            value={filters.status}
          />
        </AdminFilterField>

        <AdminFilterField className={styles.dateRange} label='Период создания'>
          <RangePicker
            format='DD.MM.YYYY'
            onChange={(dates) =>
              applyFilters((current) => ({
                ...current,
                createdFrom: dates?.[0] ? formatRangeDate(dates[0].toDate()) : undefined,
                createdTo: dates?.[1] ? formatRangeDate(dates[1].toDate()) : undefined
              }))
            }
          />
        </AdminFilterField>

        <AdminFilterField label='Обновление'>
          <Button onClick={() => void loadOrders(1, filters)}>Обновить список</Button>
        </AdminFilterField>
      </AdminFiltersPanel>

      <AdminDataTable
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        locale={{
          emptyText: <Empty description='Заказы пока не найдены' />
        }}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          showSizeChanger: false,
          total: totalOrders
        }}
        rowKey='id'
        scroll={{ x: 1500 }}
      />

      <OrderUpsertModal
        onClose={() => setEditingOrderId(null)}
        onSaved={() => loadOrders(currentPage)}
        open={Boolean(editingOrderId)}
        orderId={editingOrderId}
      />
    </section>
  )
}
