'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { MenuOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout, Spin, Tabs, type MenuProps } from 'antd'

import { authApi } from '@/api/auth'
import type { IAdminUser } from '@/api/auth/model'
import styles from './AdminShell.module.scss'

const NAV_ITEMS = [
  { key: '/categories', label: 'Категории' },
  { key: '/products', label: 'Товары' },
  { key: '/users', label: 'Пользователи' },
  { key: '/orders', label: 'Заказы' },
  { key: '/statistics', label: 'Статистика' },
  { key: '/promocodes', label: 'Промокоды' }
]

const getActiveTab = (pathname: string) =>
  NAV_ITEMS.find((item) => pathname.startsWith(item.key))?.key ?? '/categories'

export const AdminShell = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<'checking' | 'ready'>('checking')
  const [, setUser] = useState<IAdminUser | null>(null)

  const handleLogout = () => {
    authApi.logout()
    router.replace('/login')
  }

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      if (!authApi.hasSession()) {
        router.replace('/login')
        return
      }

      try {
        const nextUser = await authApi.me()

        if (!isMounted) {
          return
        }

        setUser(nextUser)
        setStatus('ready')
      } catch {
        authApi.logout()
        router.replace('/login')
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [router])

  const tabItems = useMemo(
    () => NAV_ITEMS.map((item) => ({ key: item.key, label: item.label })),
    []
  )

  const mobileMenuItems = useMemo<MenuProps['items']>(
    () => [
      ...NAV_ITEMS.map((item) => ({
        key: item.key,
        label: item.label
      })),
      {
        type: 'divider'
      },
      {
        danger: true,
        key: 'logout',
        label: 'Выйти'
      }
    ],
    []
  )

  if (status !== 'ready') {
    return (
      <div className={styles.centeredState}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <Layout className={styles.root}>
      <Layout.Header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerRow}>
            <Tabs
              activeKey={getActiveTab(pathname)}
              className={styles.tabs}
              items={tabItems}
              onChange={(nextKey) => router.push(nextKey)}
            />

            <div className={styles.userMeta}>
              <Button onClick={handleLogout}>Выйти</Button>
            </div>

            <Dropdown
              menu={{
                items: mobileMenuItems,
                onClick: ({ key }) => {
                  if (key === 'logout') {
                    handleLogout()
                    return
                  }

                  router.push(String(key))
                }
              }}
              placement='bottomRight'
              trigger={['click']}
            >
              <Button
                aria-label='Открыть меню навигации'
                className={styles.mobileMenuButton}
                icon={<MenuOutlined />}
              />
            </Dropdown>
          </div>
        </div>
      </Layout.Header>

      <Layout.Content className={styles.main}>
        <div className={styles.content}>{children}</div>
      </Layout.Content>
    </Layout>
  )
}
