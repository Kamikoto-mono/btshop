'use client'

import { useEffect, useState } from 'react'
import { Empty, Pagination, Spin, Tag, Typography } from 'antd'

import { ordersApi } from '@/api/orders'
import type { IAdminOrder } from '@/api/orders/model'
import { AdminModalShell } from '@/components/ui'
import styles from './UserOrdersModal.module.scss'

interface IUserOrdersModalProps {
  onClose: () => void
  open: boolean
  userId: string | null
  userName: string
}

const PAGE_SIZE = 10

const DELIVERY_LABELS: Record<string, string> = {
  cdek: 'CDEK',
  почта: 'Почта',
  pochta: 'Почта'
}

const STATUS_COLORS: Record<string, string> = {
  'В работе': 'gold',
  Оплачен: 'green',
  Создан: 'blue'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ')

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))

const getDeliveryLabel = (value: string) => DELIVERY_LABELS[value] ?? value

const getProductsLabel = (count: number) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return `${count} товар`
  }

  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 12 || count % 100 > 14)
  ) {
    return `${count} товара`
  }

  return `${count} товаров`
}

export const UserOrdersModal = ({
  onClose,
  open,
  userId,
  userName
}: IUserOrdersModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<IAdminOrder[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const loadOrders = async (page = currentPage, nextUserId = userId) => {
    if (!nextUserId) {
      return
    }

    setIsLoading(true)

    try {
      const response = await ordersApi.getOrdersByUserId(nextUserId, {
        limit: PAGE_SIZE,
        page
      })

      setOrders(response.items)
      setCurrentPage(response.meta.page)
      setTotalOrders(response.meta.total)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !userId) {
      setOrders([])
      setCurrentPage(1)
      setTotalOrders(0)
      return
    }

    void loadOrders(1, userId)
  }, [open, userId])

  return (
    <AdminModalShell
      cancelButtonProps={{ style: { display: 'none' } }}
      contentClassName={styles.modalBody}
      footer={null}
      onCancel={onClose}
      open={open}
      title={userName ? `Заказы пользователя ${userName}` : 'Заказы пользователя'}
      width={920}
    >
      <div className={styles.section}>
        <Typography.Text className={styles.summary}>
          {userId ? `User ID: ${userId}` : ''}
        </Typography.Text>

        {isLoading ? (
          <Spin size='large' />
        ) : orders.length ? (
          <>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <article className={styles.orderCard} key={order.id}>
                  <div className={styles.orderHeader}>
                    <div>
                      <div className={styles.orderId}>{order.id}</div>
                      <div className={styles.orderMeta}>
                        {formatDateTime(order.createdAt)} · {getDeliveryLabel(order.delivery)}
                      </div>
                    </div>

                    <div className={styles.headerAside}>
                      <span className={styles.amount}>{formatCurrency(order.amount)} ₽</span>
                      <Tag
                        className={styles.statusTag}
                        color={STATUS_COLORS[order.status] ?? 'default'}
                      >
                        {order.status}
                      </Tag>
                    </div>
                  </div>

                  <details className={styles.productsDetails}>
                    <summary className={styles.productsSummary}>
                      <span className={styles.productsCount}>
                        {getProductsLabel(order.products.length)}
                      </span>
                      <span className={styles.productsPreview}>
                        {order.products
                          .slice(0, 2)
                          .map((product) => product.name)
                          .join(' · ')}
                        {order.products.length > 2 ? ' ...' : ''}
                      </span>
                    </summary>

                    <div className={styles.products}>
                      {order.products.map((product) => (
                        <span className={styles.productLine} key={product.productId}>
                          {product.name} · {product.quantity} шт. × {formatCurrency(product.price)} ₽
                        </span>
                      ))}
                    </div>
                  </details>

                  <div className={styles.footer}>
                    <div className={styles.footerMeta}>
                      <Typography.Text className={styles.orderMeta}>
                        {order.address}, {order.postalCode}
                      </Typography.Text>
                      {order.trackNumber ? (
                        <Typography.Text className={styles.orderMeta}>
                          Трек: {order.trackNumber}
                        </Typography.Text>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {totalOrders > PAGE_SIZE ? (
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  onChange={(page) => void loadOrders(page)}
                  pageSize={PAGE_SIZE}
                  showSizeChanger={false}
                  total={totalOrders}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.empty}>
            <Empty description='У пользователя пока нет заказов' />
          </div>
        )}
      </div>
    </AdminModalShell>
  )
}
