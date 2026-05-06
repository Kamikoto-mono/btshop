'use client'

import { useEffect, useMemo, useState } from 'react'
import { App, Button, Empty, Input, InputNumber, Popconfirm, Select, Space, Typography } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { promoCodesApi } from '@/api/promoCodes'
import type { IAdminPromoCode } from '@/api/promoCodes/model'
import { AdminDataTable } from '@/components/ui'
import { PromoCodeUpsertModal } from './PromoCodeUpsertModal'
import styles from './PromoCodesPage.module.scss'

type TPromoEditableField = 'code' | 'discountPercent' | 'minOrderAmount'

interface IEditingFieldState {
  field: TPromoEditableField
  promoCodeId: string
}

const STATUS_OPTIONS = [
  { label: 'Активен', value: 'Активен' },
  { label: 'Не активен', value: 'Не активен' }
]

const getStatusClassName = (status: string) => {
  if (status === 'Активен') {
    return styles.statusActive
  }

  return styles.statusInactive
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
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<IEditingFieldState | null>(null)
  const [fieldSavingId, setFieldSavingId] = useState<string | null>(null)
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({})
  const [amountDrafts, setAmountDrafts] = useState<Record<string, number | null>>({})
  const [discountDrafts, setDiscountDrafts] = useState<Record<string, number | null>>({})

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

  const closeModal = () => {
    setEditingPromoCode(null)
    setIsModalOpen(false)
  }

  const syncPromoCode = (updatedPromoCode: IAdminPromoCode) => {
    setPromoCodes((currentPromoCodes) =>
      currentPromoCodes.map((item) => (item.id === updatedPromoCode.id ? updatedPromoCode : item))
    )
  }

  const buildPromoPayload = (
    promoCode: IAdminPromoCode,
    overrides?: Partial<Pick<IAdminPromoCode, 'code' | 'discountPercent' | 'minOrderAmount' | 'status'>>
  ) => ({
    code: promoCode.code,
    discountPercent: promoCode.discountPercent,
    minOrderAmount: promoCode.minOrderAmount,
    status: promoCode.status,
    ...overrides
  })

  const handleStatusChange = async (promoCode: IAdminPromoCode, status: string) => {
    if (promoCode.status === status) {
      return
    }

    setStatusUpdatingId(promoCode.id)

    try {
      const updatedPromoCode = await promoCodesApi.updatePromoCode(
        promoCode.id,
        buildPromoPayload(promoCode, { status })
      )

      syncPromoCode(updatedPromoCode)
      message.success('Статус промокода обновлён.')
    } catch {
      message.error('Не удалось обновить статус промокода.')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const startEditingField = (promoCode: IAdminPromoCode, field: TPromoEditableField) => {
    setEditingField({
      field,
      promoCodeId: promoCode.id
    })

    if (field === 'code') {
      setCodeDrafts((current) => ({
        ...current,
        [promoCode.id]: current[promoCode.id] ?? promoCode.code
      }))
    }

    if (field === 'minOrderAmount') {
      setAmountDrafts((current) => ({
        ...current,
        [promoCode.id]: current[promoCode.id] ?? promoCode.minOrderAmount
      }))
    }

    if (field === 'discountPercent') {
      setDiscountDrafts((current) => ({
        ...current,
        [promoCode.id]: current[promoCode.id] ?? promoCode.discountPercent
      }))
    }
  }

  const stopEditingField = (promoCodeId: string, field: TPromoEditableField) => {
    setEditingField((current) =>
      current?.promoCodeId === promoCodeId && current.field === field ? null : current
    )
  }

  const handleInlineSave = async (promoCode: IAdminPromoCode, field: TPromoEditableField) => {
    let overrides: Partial<Pick<IAdminPromoCode, 'code' | 'discountPercent' | 'minOrderAmount'>> = {}

    if (field === 'code') {
      const nextCode = (codeDrafts[promoCode.id] ?? promoCode.code).trim().toUpperCase()

      if (!nextCode) {
        message.error('Введите код промокода.')
        return
      }

      if (nextCode === promoCode.code) {
        stopEditingField(promoCode.id, field)
        return
      }

      overrides = { code: nextCode }
    }

    if (field === 'minOrderAmount') {
      const nextAmount = amountDrafts[promoCode.id] ?? promoCode.minOrderAmount

      if (nextAmount == null || nextAmount < 0) {
        message.error('Укажите корректную минимальную сумму.')
        return
      }

      if (nextAmount === promoCode.minOrderAmount) {
        stopEditingField(promoCode.id, field)
        return
      }

      overrides = { minOrderAmount: nextAmount }
    }

    if (field === 'discountPercent') {
      const nextDiscount = discountDrafts[promoCode.id] ?? promoCode.discountPercent

      if (nextDiscount == null || nextDiscount < 1 || nextDiscount > 100) {
        message.error('Скидка должна быть от 1 до 100%.')
        return
      }

      if (nextDiscount === promoCode.discountPercent) {
        stopEditingField(promoCode.id, field)
        return
      }

      overrides = { discountPercent: nextDiscount }
    }

    setFieldSavingId(promoCode.id)

    try {
      const updatedPromoCode = await promoCodesApi.updatePromoCode(
        promoCode.id,
        buildPromoPayload(promoCode, overrides)
      )

      syncPromoCode(updatedPromoCode)
      stopEditingField(promoCode.id, field)
      message.success('Промокод обновлён.')
    } catch {
      message.error('Не удалось сохранить изменения.')
    } finally {
      setFieldSavingId(null)
    }
  }

  const columns = useMemo<ColumnsType<IAdminPromoCode>>(
    () => [
      {
        dataIndex: 'code',
        key: 'code',
        render: (_, promoCode) => {
          const isEditing =
            editingField?.promoCodeId === promoCode.id && editingField.field === 'code'

          if (isEditing) {
            return (
              <div className={styles.codeCell}>
                <Space.Compact>
                  <Input
                    className={styles.inlineInput}
                    onChange={(event) =>
                      setCodeDrafts((current) => ({
                        ...current,
                        [promoCode.id]: event.target.value
                      }))
                    }
                    onPressEnter={() => void handleInlineSave(promoCode, 'code')}
                    placeholder='SPRING200'
                    value={codeDrafts[promoCode.id] ?? promoCode.code}
                  />
                  <Button
                    icon={<CheckOutlined />}
                    loading={fieldSavingId === promoCode.id}
                    onClick={() => void handleInlineSave(promoCode, 'code')}
                  />
                  <Button
                    icon={<CloseOutlined />}
                    onClick={() => stopEditingField(promoCode.id, 'code')}
                  />
                </Space.Compact>
                <span className={styles.codeMeta}>ID: {promoCode.id}</span>
              </div>
            )
          }

          return (
            <div className={styles.codeCell}>
              <div className={styles.inlineValueRow}>
                <span className={styles.codeValue}>{promoCode.code}</span>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => startEditingField(promoCode, 'code')}
                  size='small'
                  type='text'
                />
              </div>
              <span className={styles.codeMeta}>ID: {promoCode.id}</span>
            </div>
          )
        },
        title: 'Промокод',
        width: 320
      },
      {
        dataIndex: 'minOrderAmount',
        key: 'minOrderAmount',
        render: (value: number, promoCode) => {
          const isEditing =
            editingField?.promoCodeId === promoCode.id &&
            editingField.field === 'minOrderAmount'

          if (isEditing) {
            return (
              <Space.Compact>
                <InputNumber
                  className={styles.inlineNumberInput}
                  min={0}
                  onChange={(nextValue) =>
                    setAmountDrafts((current) => ({
                      ...current,
                      [promoCode.id]: typeof nextValue === 'number' ? nextValue : null
                    }))
                  }
                  onPressEnter={() => void handleInlineSave(promoCode, 'minOrderAmount')}
                  placeholder='0'
                  value={amountDrafts[promoCode.id] ?? value}
                />
                <Button
                  icon={<CheckOutlined />}
                  loading={fieldSavingId === promoCode.id}
                  onClick={() => void handleInlineSave(promoCode, 'minOrderAmount')}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => stopEditingField(promoCode.id, 'minOrderAmount')}
                />
              </Space.Compact>
            )
          }

          return (
            <div className={styles.inlineValueRow}>
              <span>{formatCurrency(value)} ₽</span>
              <Button
                icon={<EditOutlined />}
                onClick={() => startEditingField(promoCode, 'minOrderAmount')}
                size='small'
                type='text'
              />
            </div>
          )
        },
        title: 'Мин. заказ',
        width: 180
      },
      {
        dataIndex: 'discountPercent',
        key: 'discountPercent',
        render: (value: number, promoCode) => {
          const isEditing =
            editingField?.promoCodeId === promoCode.id &&
            editingField.field === 'discountPercent'

          if (isEditing) {
            return (
              <Space.Compact>
                <InputNumber
                  className={styles.inlineNumberInput}
                  max={100}
                  min={1}
                  onChange={(nextValue) =>
                    setDiscountDrafts((current) => ({
                      ...current,
                      [promoCode.id]: typeof nextValue === 'number' ? nextValue : null
                    }))
                  }
                  onPressEnter={() => void handleInlineSave(promoCode, 'discountPercent')}
                  placeholder='15'
                  value={discountDrafts[promoCode.id] ?? value}
                />
                <Button
                  icon={<CheckOutlined />}
                  loading={fieldSavingId === promoCode.id}
                  onClick={() => void handleInlineSave(promoCode, 'discountPercent')}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => stopEditingField(promoCode.id, 'discountPercent')}
                />
              </Space.Compact>
            )
          }

          return (
            <div className={styles.inlineValueRow}>
              <span>{value}%</span>
              <Button
                icon={<EditOutlined />}
                onClick={() => startEditingField(promoCode, 'discountPercent')}
                size='small'
                type='text'
              />
            </div>
          )
        },
        title: 'Скидка',
        width: 150
      },
      {
        dataIndex: 'status',
        key: 'status',
        render: (value: string, promoCode) => (
          <Select
            className={`${styles.statusSelect} ${getStatusClassName(value)}`}
            loading={statusUpdatingId === promoCode.id}
            onChange={(nextStatus) => void handleStatusChange(promoCode, nextStatus)}
            options={STATUS_OPTIONS}
            popupMatchSelectWidth={false}
            size='small'
            value={value}
            variant='borderless'
          />
        ),
        title: 'Статус',
        width: 120
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
        width: 44
      }
    ],
    [discountDrafts, editingField, fieldSavingId, message, statusUpdatingId, codeDrafts, amountDrafts]
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
        scroll={{ x: 'max-content' }}
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
