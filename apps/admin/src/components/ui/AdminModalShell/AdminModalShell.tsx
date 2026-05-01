'use client'

import { Modal } from 'antd'
import type { ModalProps } from 'antd'
import type { ReactNode } from 'react'

import styles from './AdminModalShell.module.scss'

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

export const AdminModalShell = ({
  children,
  className,
  contentClassName,
  ...props
}: ModalProps & {
  children: ReactNode
  contentClassName?: string
}) => (
  <Modal className={joinClasses(styles.modal, className)} {...props}>
    <div className={joinClasses(styles.body, contentClassName)}>{children}</div>
  </Modal>
)
