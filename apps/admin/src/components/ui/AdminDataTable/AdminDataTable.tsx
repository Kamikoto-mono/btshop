'use client'

import { Card, Table } from 'antd'
import type { TableProps } from 'antd'

import styles from './AdminDataTable.module.scss'

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

type TAdminDataTableProps<T extends object> = TableProps<T> & {
  cardClassName?: string
  minTableWidth?: number
}

export const AdminDataTable = <T extends object>({
  cardClassName,
  minTableWidth = 1000,
  ...tableProps
}: TAdminDataTableProps<T>) => {
  const mergedScroll =
    tableProps.scroll && typeof tableProps.scroll === 'object'
      ? { x: minTableWidth, ...tableProps.scroll }
      : { x: minTableWidth }
  const mergedPagination =
    tableProps.pagination && typeof tableProps.pagination === 'object'
      ? { hideOnSinglePage: true, ...tableProps.pagination }
      : tableProps.pagination

  return (
    <Card className={joinClasses(styles.card, cardClassName)}>
      <div className={styles.tableWrap}>
        <Table {...tableProps} pagination={mergedPagination} scroll={mergedScroll} />
      </div>
    </Card>
  )
}
