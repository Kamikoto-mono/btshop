'use client'

import { ComponentPropsWithoutRef, ReactNode, TextareaHTMLAttributes } from 'react'

import styles from './Input.module.scss'

type InputProps = ComponentPropsWithoutRef<'input'> & {
  className?: string
  endAdornment?: ReactNode
  multiline?: false
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string
  endAdornment?: ReactNode
  multiline: true
}

type Props = InputProps | TextareaProps

export const Input = (props: Props) => {
  const { className, endAdornment, multiline = false, ...restProps } = props

  const controlClassName = [
    styles.control,
    multiline ? styles.textarea : styles.input,
    endAdornment ? styles.withEndAdornment : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      {multiline ? (
        <textarea
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={controlClassName}
        />
      ) : (
        <input
          {...(restProps as ComponentPropsWithoutRef<'input'>)}
          className={controlClassName}
        />
      )}

      {endAdornment ? <div className={styles.endAdornment}>{endAdornment}</div> : null}
    </div>
  )
}
