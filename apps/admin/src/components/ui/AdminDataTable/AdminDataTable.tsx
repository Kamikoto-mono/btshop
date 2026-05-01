'use client'

import { Card, Table } from 'antd'
import type { TableProps } from 'antd'

import styles from './AdminDataTable.module.scss'

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

type TAdminDataTableProps<T extends object> = TableProps<T> & {
  cardClassName?: string
}

export const AdminDataTable = <T extends object>({
  cardClassName,
  ...tableProps
}: TAdminDataTableProps<T>) => (
  <Card className={joinClasses(styles.card, cardClassName)}>
    <Table {...tableProps} />
  </Card>
)
