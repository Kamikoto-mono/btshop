import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'outlined'
type ButtonSize = 'md' | 'lg'

interface IBaseButtonProps {
  children: ReactNode
  className?: string
  disabled?: boolean
  fullWidth?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

type TButtonProps =
  | (IBaseButtonProps & {
      href: string
    })
  | (IBaseButtonProps &
      ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ')

export const Button = ({
  children,
  className,
  disabled = false,
  fullWidth = false,
  href,
  size = 'md',
  variant = 'primary',
  ...props
}: TButtonProps) => {
  const classes = joinClasses(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  )

  if (href) {
    return (
      <Link className={classes} href={href}>
        <span className={styles.label}>{children}</span>
      </Link>
    )
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>

  return (
    <button
      className={classes}
      disabled={disabled}
      type={buttonProps.type ?? 'button'}
      {...buttonProps}
    >
      <span className={styles.label}>{children}</span>
    </button>
  )
}
