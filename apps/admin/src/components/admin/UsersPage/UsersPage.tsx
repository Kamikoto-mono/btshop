'use client'

import { useEffect, useMemo, useState } from 'react'
import { App, Button, Empty, Typography, type TablePaginationConfig } from 'antd'
import { ProfileOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { usersApi } from '@/api/users'
import type { IAdminListUser } from '@/api/users/model'
import { AdminDataTable } from '@/components/ui'
import { UserOrdersModal } from './UserOrdersModal'
import styles from './UsersPage.module.scss'

const PAGE_SIZE = 20

const getDisplayValue = (value: string, fallback: string) => {
  const normalizedValue = value.trim()
  return normalizedValue || fallback
}

export const UsersPage = () => {
  const { message } = App.useApp()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<IAdminListUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<IAdminListUser | null>(null)

  const loadUsers = async (page = currentPage) => {
    setIsLoading(true)

    try {
      const response = await usersApi.getUsers({
        limit: PAGE_SIZE,
        page
      })

      setUsers(response.items)
      setCurrentPage(response.meta.page)
      setTotalUsers(response.meta.total)
    } catch {
      message.error('Не удалось загрузить пользователей.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers(currentPage)
  }, [currentPage])

  const columns = useMemo<ColumnsType<IAdminListUser>>(
    () => [
      {
        dataIndex: 'id',
        key: 'id',
        render: (value: string, user) => (
          <div className={styles.idCell}>
            <span className={styles.userId}>{value}</span>
            <Button
              icon={<ProfileOutlined />}
              onClick={() => setSelectedUser(user)}
              size='small'
              type='text'
            />
          </div>
        ),
        title: 'ID',
        width: 260
      },
      {
        dataIndex: 'email',
        key: 'email',
        render: (value: string) => value,
        title: 'Email',
        width: 260
      },
      {
        dataIndex: 'fullName',
        key: 'customer',
        render: (_, user) => (
          <div className={styles.customerCell}>
            <span className={styles.customerName}>
              {getDisplayValue(user.fullName, 'Имя не указано')}
            </span>
            <span className={styles.customerMeta}>
              {getDisplayValue(user.telegramUsername, 'Telegram не указан')}
            </span>
            <span className={styles.customerMeta}>
              {getDisplayValue(user.tel, 'Телефон не указан')}
            </span>
          </div>
        ),
        title: 'Клиент',
        width: 280
      },
      {
        dataIndex: 'address',
        key: 'address',
        render: (_, user) => (
          <div className={styles.addressCell}>
            <span
              className={user.address.trim() ? styles.addressLine : styles.emptyValue}
            >
              {getDisplayValue(user.address, 'Адрес не указан')}
            </span>
            <span
              className={user.postalCode.trim() ? styles.customerMeta : styles.emptyValue}
            >
              {getDisplayValue(user.postalCode, 'Индекс не указан')}
            </span>
          </div>
        ),
        title: 'Адрес',
        width: 320
      }
    ],
    []
  )

  const handleTableChange = (pagination: TablePaginationConfig) => {
    void loadUsers(pagination.current ?? 1)
  }

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <Typography.Title className={styles.heading} level={1}>
          Пользователи
        </Typography.Title>
      </div>

      <AdminDataTable
        columns={columns}
        dataSource={users}
        loading={isLoading}
        locale={{
          emptyText: <Empty description='Пользователи пока не найдены' />
        }}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          showSizeChanger: false,
          total: totalUsers
        }}
        rowKey='id'
        scroll={{ x: 1120 }}
      />

      <UserOrdersModal
        onClose={() => setSelectedUser(null)}
        open={Boolean(selectedUser)}
        userId={selectedUser?.id ?? null}
        userName={selectedUser?.fullName ?? ''}
      />
    </section>
  )
}
