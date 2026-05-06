'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Typography,
  type TablePaginationConfig
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons'
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

const DELIVERY_LABELS: Record<string, string> = {
  cdek: 'CDEK',
  почта: 'Почта',
  pochta: 'Почта'
}

const getStatusClassName = (status: string) => {
  if (status === 'Оплачен') {
    return styles.statusPaid
  }

  if (status === 'В работе') {
    return styles.statusActive
  }

  return styles.statusCreated
}

const formatOrderDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(new Date(value))

const formatOrderTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))

const formatOrderNumber = (value: number) => `#${value}`

const formatRangeDate = (value: Date) => value.toISOString()

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ')

const getDeliveryLabel = (value: string) => DELIVERY_LABELS[value] ?? value

export const OrdersPage = () => {
  const { message } = App.useApp()
  const [filters, setFilters] = useState<IOrderFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<IAdminOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [trackDrafts, setTrackDrafts] = useState<Record<string, string>>({})
  const [trackSavingId, setTrackSavingId] = useState<string | null>(null)
  const [pendingWorkStatusOrderId, setPendingWorkStatusOrderId] = useState<string | null>(null)

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

  const buildOrderPayload = (
    order: IAdminOrder,
    overrides?: Partial<Parameters<typeof ordersApi.updateOrder>[1]>
  ) => ({
    address: order.address,
    delivery: order.delivery,
    email: order.email,
    fullName: order.fullName,
    index: Number(order.postalCode),
    products: order.products.map((product) => ({
      productId: product.productId,
      quantity: product.quantity
    })),
    status: order.status,
    tel: order.tel,
    telegramUsername: order.telegramUsername,
    trackNumber: order.trackNumber,
    ...overrides
  })

  const handleStatusChange = async (order: IAdminOrder, status: string) => {
    if (status === 'В работе' && order.status !== 'В работе' && !order.trackNumber.trim()) {
      setPendingWorkStatusOrderId(order.id)
      setTrackDrafts((current) => ({
        ...current,
        [order.id]: current[order.id] ?? order.trackNumber
      }))
      return
    }

    setStatusUpdatingId(order.id)

    try {
      const updatedOrder = await ordersApi.updateOrder(order.id, buildOrderPayload(order, { status }))

      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
      )
      message.success('Статус заказа обновлён.')
    } catch {
      message.error('Не удалось обновить статус заказа.')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleWorkStatusConfirm = async (order: IAdminOrder) => {
    const nextTrackNumber = (trackDrafts[order.id] ?? order.trackNumber).trim()

    if (!nextTrackNumber) {
      message.error('Укажите трек-номер перед переводом заказа в статус "В работе".')
      return
    }

    setStatusUpdatingId(order.id)

    try {
      const updatedOrder = await ordersApi.updateOrder(
        order.id,
        buildOrderPayload(order, {
          status: 'В работе',
          trackNumber: nextTrackNumber
        })
      )

      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
      )
      setPendingWorkStatusOrderId(null)
      setTrackDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[order.id]
        return nextDrafts
      })
      message.success('Статус заказа обновлён, трек-номер сохранён.')
    } catch {
      message.error('Не удалось перевести заказ в статус "В работе".')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleTrackSave = async (order: IAdminOrder) => {
    const nextTrackNumber = (trackDrafts[order.id] ?? order.trackNumber).trim()

    if (nextTrackNumber === order.trackNumber) {
      return
    }

    setTrackSavingId(order.id)

    try {
      const updatedOrder = await ordersApi.updateOrder(
        order.id,
        buildOrderPayload(order, { trackNumber: nextTrackNumber })
      )

      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
      )
      setTrackDrafts((current) => {
        const nextDrafts = { ...current }
        delete nextDrafts[order.id]
        return nextDrafts
      })
      message.success(nextTrackNumber ? 'Трек-номер сохранён.' : 'Трек-номер очищен.')
    } catch {
      message.error('Не удалось сохранить трек-номер.')
    } finally {
      setTrackSavingId(null)
    }
  }

  const handleTrackCopy = async (trackNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackNumber)
      message.success('Трек-номер скопирован.')
    } catch {
      message.error('Не удалось скопировать трек-номер.')
    }
  }

  const columns = useMemo<ColumnsType<IAdminOrder>>(
    () => [
      {
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string, order) => (
          <div className={styles.dateCell}>
            <span className={styles.orderNumber}>{formatOrderNumber(order.number)}</span>
            <span className={styles.dateValue}>{formatOrderDate(value)}</span>
            <span className={styles.dateTime}>{formatOrderTime(value)}</span>
          </div>
        ),
        title: 'Заказ',
        width: 82
      },
      {
        dataIndex: 'email',
        key: 'customer',
        render: (_, order) => (
          <div className={styles.customerCell}>
            <span className={styles.customerMeta}>{order.email}</span>
            <span className={styles.customerMeta}>
              {order.telegramUsername || 'Telegram не указан'}
            </span>
            <span className={styles.customerMeta}>{order.tel}</span>
          </div>
        ),
        title: 'Клиент',
        width: 200
      },
      {
        dataIndex: 'address',
        key: 'address',
        render: (_, order) => (
          <div className={styles.customerCell}>
            <span className={styles.customerName}>{order.fullName}</span>
            <span className={styles.customerMeta}>{order.address}</span>
            <span className={styles.customerMeta}>{order.postalCode}</span>
          </div>
        ),
        title: 'Адрес',
        width: 280
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
        width: 360
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (value: string, order) => {
          return (
            <Select
              className={`${styles.statusSelect} ${getStatusClassName(value)}`}
              loading={statusUpdatingId === order.id}
              onChange={(nextStatus) => void handleStatusChange(order, nextStatus)}
              options={STATUS_OPTIONS}
              popupMatchSelectWidth={false}
              size='small'
              value={value}
              variant='borderless'
            />
          )
        },
        title: 'Статус',
        width: 100
      },
      {
        dataIndex: 'delivery',
        key: 'delivery',
        render: (value: string, order) => {
          const isPendingWorkStatus = pendingWorkStatusOrderId === order.id
          const isEditableTrack = order.status === 'В работе' || isPendingWorkStatus
          const trackValue = trackDrafts[order.id] ?? order.trackNumber

          if (isEditableTrack) {
            return (
              <div className={styles.deliveryCell}>
                <span className={styles.deliveryLabel}>{getDeliveryLabel(value)}</span>
                <Space.Compact>
                  <Input
                    className={styles.trackInput}
                    onBlur={() =>
                      isPendingWorkStatus
                        ? void handleWorkStatusConfirm(order)
                        : void handleTrackSave(order)
                    }
                    onChange={(event) =>
                      setTrackDrafts((current) => ({
                        ...current,
                        [order.id]: event.target.value
                      }))
                    }
                    onPressEnter={() =>
                      isPendingWorkStatus
                        ? void handleWorkStatusConfirm(order)
                        : void handleTrackSave(order)
                    }
                    placeholder='Указать трек'
                    value={trackValue}
                  />
                  <Button
                    icon={<CopyOutlined />}
                    disabled={!trackValue}
                    loading={isPendingWorkStatus ? statusUpdatingId === order.id : trackSavingId === order.id}
                    onClick={() => void handleTrackCopy(trackValue)}
                  />
                  {isPendingWorkStatus ? (
                    <Button
                      icon={<CloseOutlined />}
                      onClick={() => {
                        setPendingWorkStatusOrderId(null)
                        setTrackDrafts((current) => {
                          const nextDrafts = { ...current }
                          delete nextDrafts[order.id]
                          return nextDrafts
                        })
                      }}
                    />
                  ) : null}
                </Space.Compact>
              </div>
            )
          }

          return (
            <div className={styles.deliveryCell}>
              <span className={styles.deliveryLabel}>{getDeliveryLabel(value)}</span>
              {order.trackNumber ? (
                <div className={styles.trackCell}>
                  <span className={styles.trackValue} title={order.trackNumber}>
                    {order.trackNumber}
                  </span>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => void handleTrackCopy(order.trackNumber)}
                    size='small'
                    type='text'
                  />
                </div>
              ) : (
                <span className={styles.customerMeta}>—</span>
              )}
            </div>
          )
        },
        title: 'Доставка',
        width: 170
      },
      {
        dataIndex: 'amount',
        key: 'amount',
        render: (value: number) => `${formatCurrency(value)} ₽`,
        title: 'Сумма',
        width: 110
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
    [
      currentPage,
      message,
      pendingWorkStatusOrderId,
      statusUpdatingId,
      trackDrafts,
      trackSavingId
    ]
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
        scroll={{ x: 'max-content' }}
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
