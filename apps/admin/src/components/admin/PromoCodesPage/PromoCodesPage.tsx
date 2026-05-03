'use client'

import { useEffect, useMemo, useState } from 'react'
import { App, Button, Empty, Popconfirm, Tag, Typography } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { promoCodesApi } from '@/api/promoCodes'
import type { IAdminPromoCode } from '@/api/promoCodes/model'
import { AdminDataTable } from '@/components/ui'
import { PromoCodeUpsertModal } from './PromoCodeUpsertModal'
import styles from './PromoCodesPage.module.scss'

const STATUS_COLORS: Record<string, string> = {
  Активен: 'green',
  Неактивен: 'default'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU').format(value).replace(/\s/g, ' ')

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))

export const PromoCodesPage = () => {
  const { message } = App.useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [promoCodes, setPromoCodes] = useState<IAdminPromoCode[]>([])
  const [editingPromoCode, setEditingPromoCode] = useState<IAdminPromoCode | null>(null)

  const loadPromoCodes = async () => {
    setIsLoading(true)

    try {
      const response = await promoCodesApi.getPromoCodes()
      setPromoCodes(response)
    } catch {
      message.error('Не удалось загрузить промокоды.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadPromoCodes()
  }, [])

  const openCreateModal = () => {
    setEditingPromoCode(null)
    setIsModalOpen(true)
  }

  const openEditModal = (promoCode: IAdminPromoCode) => {
    setEditingPromoCode(promoCode)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingPromoCode(null)
    setIsModalOpen(false)
  }

  const columns = useMemo<ColumnsType<IAdminPromoCode>>(
    () => [
      {
        dataIndex: 'code',
        key: 'code',
        render: (_, promoCode) => (
          <div className={styles.codeCell}>
            <span className={styles.codeValue}>{promoCode.code}</span>
            <span className={styles.codeMeta}>ID: {promoCode.id}</span>
          </div>
        ),
        title: 'Промокод',
        width: 300
      },
      {
        dataIndex: 'minOrderAmount',
        key: 'minOrderAmount',
        render: (value: number) => `${formatCurrency(value)} ₽`,
        title: 'Мин. заказ',
        width: 160
      },
      {
        dataIndex: 'discountPercent',
        key: 'discountPercent',
        render: (value: number) => `${value}%`,
        title: 'Скидка',
        width: 120
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => (
          <Tag className={styles.statusTag} color={STATUS_COLORS[value] ?? 'default'}>
            {value}
          </Tag>
        ),
        title: 'Статус',
        width: 140
      },
      {
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) => formatDateTime(value),
        title: 'Создан',
        width: 180
      },
      {
        key: 'actions',
        render: (_, promoCode) => (
          <div className={styles.actions}>
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(promoCode)}
              size='small'
              type='text'
            />
            <Popconfirm
              cancelText='Нет'
              okText='Да'
              onConfirm={() =>
                promoCodesApi
                  .deletePromoCode(promoCode.id)
                  .then(async () => {
                    message.success('Промокод удалён.')
                    await loadPromoCodes()
                  })
                  .catch(() => {
                    message.error('Не удалось удалить промокод.')
                  })
              }
              title='Удалить промокод?'
            >
              <Button icon={<DeleteOutlined />} size='small' type='text' />
            </Popconfirm>
          </div>
        ),
        title: '',
        width: 52
      }
    ],
    [message]
  )

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <Typography.Title className={styles.heading} level={1}>
          Промокоды
        </Typography.Title>

        <Button icon={<PlusOutlined />} onClick={openCreateModal} type='primary'>
          Создать промокод
        </Button>
      </div>

      <AdminDataTable
        columns={columns}
        dataSource={promoCodes}
        loading={isLoading}
        locale={{
          emptyText: <Empty description='Промокоды пока не добавлены' />
        }}
        pagination={false}
        rowKey='id'
        scroll={{ x: 920 }}
      />

      <PromoCodeUpsertModal
        onClose={closeModal}
        onSaved={loadPromoCodes}
        open={isModalOpen}
        promoCode={editingPromoCode}
      />
    </section>
  )
}
