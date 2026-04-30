'use client'

import Image from 'next/image'

import eyeOffIcon from '@assets/icons/eye-off.svg'
import eyeOpenIcon from '@assets/icons/eye-open.svg'

import styles from './AuthModal.module.scss'

interface IAuthPasswordToggleProps {
  label: string
  onClick: () => void
  visible: boolean
}

export const AuthPasswordToggle = ({
  label,
  onClick,
  visible
}: IAuthPasswordToggleProps) => (
  <button
    aria-label={visible ? `Скрыть ${label}` : `Показать ${label}`}
    className={styles.passwordToggle}
    onClick={onClick}
    type='button'
  >
    <Image alt='' aria-hidden='true' src={visible ? eyeOffIcon : eyeOpenIcon} />
  </button>
)
