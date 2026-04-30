'use client'

import { useCallback, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, KeyboardEvent } from 'react'
import { Button } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'

import styles from './UploadDropZone.module.scss'

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'avif']

const getFileExtension = (fileName: string) => {
  const normalized = fileName.trim().toLowerCase()
  const chunks = normalized.split('.')

  return chunks.length > 1 ? chunks[chunks.length - 1] : ''
}

const isAllowedImageFile = (file: File) => {
  const extension = getFileExtension(file.name)

  return file.type.startsWith('image/') || ALLOWED_IMAGE_EXTENSIONS.includes(extension)
}

interface IUploadDropZoneProps {
  accept?: string
  buttonText?: string
  className?: string
  compact?: boolean
  disabled?: boolean
  hintPrimary?: string
  hintSecondary?: string
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
}

export const UploadDropZone = ({
  accept = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/*',
  buttonText = 'Выбрать фото',
  className,
  compact = false,
  disabled = false,
  hintPrimary = 'Перетащите фото сюда или нажмите для выбора',
  hintSecondary = 'JPG, PNG, WEBP, HEIC. До 5 файлов.',
  maxFiles,
  onFilesChange
}: IUploadDropZoneProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dragDepthRef = useRef(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const emitFiles = useCallback(
    (files: FileList | File[] | null | undefined) => {
      if (disabled || !files) {
        return
      }

      const nextFiles = Array.from(files).filter(isAllowedImageFile)
      const limitedFiles =
        typeof maxFiles === 'number' ? nextFiles.slice(0, maxFiles) : nextFiles

      if (limitedFiles.length > 0) {
        onFilesChange?.(limitedFiles)
      }
    },
    [disabled, maxFiles, onFilesChange]
  )

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    emitFiles(event.currentTarget.files)
    event.currentTarget.value = ''
  }

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current += 1
    setIsDragOver(true)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)

    if (dragDepthRef.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    dragDepthRef.current = 0
    setIsDragOver(false)
    emitFiles(event.dataTransfer.files)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFileDialog()
    }
  }

  const rootClassName = [
    styles.root,
    disabled ? styles.rootDisabled : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ')

  const zoneClassName = [
    styles.zone,
    compact ? styles.zoneCompact : '',
    isDragOver ? styles.zoneActive : '',
    disabled ? styles.zoneDisabled : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      aria-disabled={disabled}
      className={rootClassName}
      onClick={openFileDialog}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role='button'
      tabIndex={disabled ? -1 : 0}
    >
      <div className={zoneClassName}>
        <div className={styles.icon}>
          <InboxOutlined />
        </div>
        <div className={styles.title}>{hintPrimary}</div>
        <div className={styles.text}>{hintSecondary}</div>
        <Button className={styles.button} icon={<UploadOutlined />}>
          {buttonText}
        </Button>
      </div>

      <input
        accept={accept}
        className={styles.input}
        multiple
        onChange={handleInputChange}
        ref={inputRef}
        type='file'
      />
    </div>
  )
}
