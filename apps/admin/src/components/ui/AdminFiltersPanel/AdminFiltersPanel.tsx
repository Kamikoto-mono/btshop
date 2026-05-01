'use client'

import { Card } from 'antd'
import type { ReactNode } from 'react'

import styles from './AdminFiltersPanel.module.scss'

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

export const AdminFiltersPanel = ({
  children,
  className,
  contentClassName
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) => (
  <Card className={joinClasses(styles.panel, className)}>
    <div className={joinClasses(styles.grid, contentClassName)}>{children}</div>
  </Card>
)

export const AdminFilterField = ({
  children,
  className,
  label
}: {
  children: ReactNode
  className?: string
  label: ReactNode
}) => (
  <div className={joinClasses(styles.field, className)}>
    <span className={styles.label}>{label}</span>
    {children}
  </div>
)
