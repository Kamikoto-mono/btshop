'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button, Layout, Spin, Tabs } from 'antd'

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
  const [user, setUser] = useState<IAdminUser | null>(null)

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
              {user?.email ? <span className={styles.userEmail}>{user.email}</span> : null}
              <Button
                onClick={() => {
                  authApi.logout()
                  router.replace('/login')
                }}
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </Layout.Header>

      <Layout.Content className={styles.main}>
        <div className={styles.content}>{children}</div>
      </Layout.Content>
    </Layout>
  )
}
