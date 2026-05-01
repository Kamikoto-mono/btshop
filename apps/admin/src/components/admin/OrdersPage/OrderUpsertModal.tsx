'use client'

import { useEffect, useState } from 'react'
import { App, Form, Input, Select, Typography } from 'antd'

import { ordersApi } from '@/api/orders'
import type { IAdminOrder } from '@/api/orders/model'
import { AdminModalShell } from '@/components/ui'
import styles from './OrderUpsertModal.module.scss'

interface IOrderFormValues {
  address: string
  delivery: string
  email: string
  fullName: string
  postalCode: string
  status: string
  tel: string
  telegramUsername: string
}

interface IOrderUpsertModalProps {
  onClose: () => void
  onSaved: () => Promise<void> | void
  open: boolean
  orderId: string | null
}

const DELIVERY_OPTIONS = [
  { label: 'Почта', value: 'почта' },
  { label: 'CDEK', value: 'cdek' }
]

const STATUS_OPTIONS = [
  { label: 'Создан', value: 'Создан' },
  { label: 'Оплачен', value: 'Оплачен' },
  { label: 'В работе', value: 'В работе' }
]

export const OrderUpsertModal = ({
  onClose,
  onSaved,
  open,
  orderId
}: IOrderUpsertModalProps) => {
  const { message } = App.useApp()
  const [form] = Form.useForm<IOrderFormValues>()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [order, setOrder] = useState<IAdminOrder | null>(null)

  useEffect(() => {
    if (!open || !orderId) {
      form.resetFields()
      setOrder(null)
      return
    }

    void (async () => {
      setIsLoading(true)

      try {
        const nextOrder = await ordersApi.getOrderById(orderId)
        setOrder(nextOrder)
        form.setFieldsValue({
          address: nextOrder.address,
          delivery: nextOrder.delivery,
          email: nextOrder.email,
          fullName: nextOrder.fullName,
          postalCode: nextOrder.postalCode,
          status: nextOrder.status,
          tel: nextOrder.tel,
          telegramUsername: nextOrder.telegramUsername
        })
      } catch {
        message.error('Не удалось загрузить заказ.')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [form, message, open, orderId])

  const handleSubmit = async () => {
    if (!orderId || !order) {
      return
    }

    try {
      const values = await form.validateFields()
      setIsSaving(true)

      await ordersApi.updateOrder(orderId, {
        address: values.address.trim(),
        delivery: values.delivery,
        email: values.email.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        index: Number(values.postalCode),
        products: order.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity
        })),
        status: values.status,
        tel: values.tel.trim(),
        telegramUsername: values.telegramUsername.trim()
      })

      message.success('Заказ обновлён.')
      await onSaved()
      onClose()
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) {
        return
      }

      message.error('Не удалось обновить заказ.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminModalShell
      destroyOnHidden
      okButtonProps={{
        disabled: isLoading || !order,
        loading: isSaving
      }}
      okText='Сохранить'
      onCancel={onClose}
      onOk={() => void handleSubmit()}
      open={open}
      title={order ? `Заказ ${order.id}` : 'Заказ'}
      width={980}
    >
      <div className={styles.grid}>
        <div className={styles.section}>
          <Typography.Title className={styles.sectionTitle} level={5}>
            Данные заказа
          </Typography.Title>

          <Form disabled={isLoading} form={form} layout='vertical'>
            <Form.Item
              label='ФИО'
              name='fullName'
              rules={[{ required: true, message: 'Введите ФИО' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Email'
              name='email'
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Телефон'
              name='tel'
              rules={[{ required: true, message: 'Введите телефон' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label='Telegram' name='telegramUsername'>
              <Input />
            </Form.Item>

            <Form.Item
              label='Адрес'
              name='address'
              rules={[{ required: true, message: 'Введите адрес' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item
              label='Индекс'
              name='postalCode'
              rules={[{ required: true, message: 'Введите индекс' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label='Доставка'
              name='delivery'
              rules={[{ required: true, message: 'Выберите доставку' }]}
            >
              <Select options={DELIVERY_OPTIONS} />
            </Form.Item>

            <Form.Item
              label='Статус'
              name='status'
              rules={[{ required: true, message: 'Выберите статус' }]}
            >
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Form>
        </div>

        <div className={styles.section}>
          <Typography.Title className={styles.sectionTitle} level={5}>
            Состав заказа
          </Typography.Title>

          <div className={styles.productsCard}>
            {order?.products.map((product) => (
              <div className={styles.productRow} key={product.productId}>
                <div className={styles.productMeta}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productCaption}>
                    {product.quantity} шт. × {product.price} ₽
                  </span>
                </div>

                <strong>{product.price * product.quantity} ₽</strong>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>ID заказа</span>
              <strong>{order?.id ?? '—'}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>User ID</span>
              <strong>{order?.userId ?? '—'}</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Сумма</span>
              <strong>{order ? `${order.amount} ₽` : '—'}</strong>
            </div>
          </div>
        </div>
      </div>
    </AdminModalShell>
  )
}
