'use client'

import { useEffect, useState } from 'react'
import { App, Form, Input, InputNumber, Select } from 'antd'

import { promoCodesApi } from '@/api/promoCodes'
import type { IAdminPromoCode } from '@/api/promoCodes/model'
import { AdminModalShell } from '@/components/ui'
import styles from './PromoCodeUpsertModal.module.scss'

interface IPromoCodeFormValues {
  code: string
  discountPercent: number
  minOrderAmount: number
  status: string
}

interface IPromoCodeUpsertModalProps {
  onClose: () => void
  onSaved: () => Promise<void> | void
  open: boolean
  promoCode: IAdminPromoCode | null
}

const STATUS_OPTIONS = [
  { label: 'Активен', value: 'Активен' },
  { label: 'Неактивен', value: 'Неактивен' }
]

export const PromoCodeUpsertModal = ({
  onClose,
  onSaved,
  open,
  promoCode
}: IPromoCodeUpsertModalProps) => {
  const { message } = App.useApp()
  const [form] = Form.useForm<IPromoCodeFormValues>()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }

    if (promoCode) {
      form.setFieldsValue({
        code: promoCode.code,
        discountPercent: promoCode.discountPercent,
        minOrderAmount: promoCode.minOrderAmount,
        status: promoCode.status
      })
      return
    }

    form.setFieldsValue({
      code: '',
      discountPercent: 10,
      minOrderAmount: 0,
      status: 'Активен'
    })
  }, [form, open, promoCode])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setIsSaving(true)

      const payload = {
        code: values.code.trim().toUpperCase(),
        discountPercent: values.discountPercent,
        minOrderAmount: values.minOrderAmount,
        status: values.status
      }

      if (promoCode) {
        await promoCodesApi.updatePromoCode(promoCode.id, payload)
        message.success('Промокод обновлён.')
      } else {
        await promoCodesApi.createPromoCode(payload)
        message.success('Промокод создан.')
      }

      await onSaved()
      onClose()
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) {
        return
      }

      message.error('Не удалось сохранить промокод.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminModalShell
      destroyOnHidden
      forceRender
      okButtonProps={{ loading: isSaving }}
      okText={promoCode ? 'Сохранить' : 'Создать'}
      onCancel={onClose}
      onOk={() => void handleSubmit()}
      open={open}
      title={promoCode ? 'Редактирование промокода' : 'Создание промокода'}
      width={620}
    >
      <Form form={form} layout='vertical'>
        <div className={styles.formGrid}>
          <Form.Item
            label='Код'
            name='code'
            rules={[
              { required: true, message: 'Введите код промокода' },
              { min: 3, message: 'Минимум 3 символа' }
            ]}
          >
            <Input placeholder='Например, SPRING200' />
          </Form.Item>

          <div className={styles.numberRow}>
            <Form.Item
              label='Минимальная сумма заказа'
              name='minOrderAmount'
              rules={[{ required: true, message: 'Укажите минимальную сумму' }]}
            >
              <InputNumber min={0} placeholder='0' style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label='Скидка, %'
              name='discountPercent'
              rules={[{ required: true, message: 'Укажите скидку' }]}
            >
              <InputNumber max={100} min={1} placeholder='15' style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            label='Статус'
            name='status'
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </div>
      </Form>
    </AdminModalShell>
  )
}
