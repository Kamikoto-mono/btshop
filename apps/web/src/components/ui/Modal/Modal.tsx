'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { lockBodyScroll, unlockBodyScroll } from '@/shared/utils/modalScrollLock'
import styles from './Modal.module.scss'

interface IModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  width?: number
  disableMaxWidth?: boolean
  modalClassName?: string
  backdropClassName?: string
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  width = 520,
  disableMaxWidth = false,
  modalClassName = '',
  backdropClassName = ''
}: IModalProps) => {
  const [mounted, setMounted] = useState(false)
  const backdropPressStartedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || !mounted) return

    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [isOpen, mounted])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      className={`${styles.backdrop} ${backdropClassName}`}
      onClick={(event) => {
        const shouldClose =
          backdropPressStartedRef.current && event.target === event.currentTarget

        backdropPressStartedRef.current = false

        if (shouldClose) {
          onClose()
        }
      }}
      onMouseDown={(event) => {
        backdropPressStartedRef.current = event.target === event.currentTarget
      }}
    >
      <div
        className={`${styles.modal} ${modalClassName}`}
        style={{
          width,
          ...(disableMaxWidth ? {} : { maxWidth: `min(${width}px, calc(100% - 32px))` })
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}


