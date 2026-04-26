'use client'

import Image from 'next/image'
import { FormEvent, useState } from 'react'

import eyeOffIcon from '@assets/icons/eye-off.svg'
import eyeOpenIcon from '@assets/icons/eye-open.svg'

import { Button, Modal } from '@/components/ui'
import {
  closeAuthModal,
  setAuthMode,
  setUserSession
} from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import styles from './AuthModal.module.scss'

interface IPasswordFieldProps {
  label: string
  onChange: (value: string) => void
  onToggleVisible: () => void
  placeholder: string
  value: string
  visible: boolean
}

export const AuthModal = () => {
  const dispatch = useAppDispatch()
  const { isOpen, mode } = useAppSelector((state) => state.auth)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerPasswordRepeat, setRegisterPasswordRepeat] = useState('')

  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterPasswordRepeatVisible, setIsRegisterPasswordRepeatVisible] =
    useState(false)

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!loginEmail.trim() || !loginPassword.trim()) {
      return
    }

    dispatch(
      setUserSession({
        email: loginEmail.trim()
      })
    )
  }

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !registerEmail.trim() ||
      !registerPassword.trim() ||
      registerPassword !== registerPasswordRepeat
    ) {
      return
    }

    dispatch(
      setUserSession({
        email: registerEmail.trim()
      })
    )
  }

  const renderPasswordField = ({
    label,
    onChange,
    onToggleVisible,
    placeholder,
    value,
    visible
  }: IPasswordFieldProps) => (
    <label>
      <span>{label}</span>
      <div className={styles.passwordField}>
        <input
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={visible ? 'text' : 'password'}
          value={value}
        />

        <button
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          className={styles.passwordToggle}
          onClick={onToggleVisible}
          type='button'
        >
          <Image alt='' aria-hidden='true' src={visible ? eyeOffIcon : eyeOpenIcon} />
        </button>
      </div>
    </label>
  )

  return (
    <Modal
      isOpen={isOpen}
      modalClassName={styles.modal}
      onClose={() => dispatch(closeAuthModal())}
      width={560}
    >
      <div className={styles.header}>
        <h2>Вход и регистрация</h2>
        <button
          aria-label='Закрыть модалку'
          className={styles.closeButton}
          onClick={() => dispatch(closeAuthModal())}
          type='button'
        >
          ×
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={mode === 'login' ? styles.tabActive : styles.tab}
          onClick={() => dispatch(setAuthMode('login'))}
          type='button'
        >
          Авторизация
        </button>
        <button
          className={mode === 'register' ? styles.tabActive : styles.tab}
          onClick={() => dispatch(setAuthMode('register'))}
          type='button'
        >
          Регистрация
        </button>
      </div>

      {mode === 'login' ? (
        <form className={styles.form} onSubmit={handleLogin}>
          <label>
            <span>Email</span>
            <input
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder='email@example.com'
              type='email'
              value={loginEmail}
            />
          </label>

          {renderPasswordField({
            label: 'Пароль',
            onChange: setLoginPassword,
            onToggleVisible: () =>
              setIsLoginPasswordVisible((current) => !current),
            placeholder: 'Введите пароль',
            value: loginPassword,
            visible: isLoginPasswordVisible
          })}

          <div className={styles.metaRow}>
            <label className={styles.checkbox}>
              <input
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                type='checkbox'
              />
              <span>Запомнить меня</span>
            </label>

            <button className={styles.forgotLink} type='button'>
              Забыли пароль?
            </button>
          </div>

          <Button fullWidth size='lg' type='submit'>
            Войти
          </Button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleRegister}>
          <label>
            <span>Email</span>
            <input
              onChange={(event) => setRegisterEmail(event.target.value)}
              placeholder='email@example.com'
              type='email'
              value={registerEmail}
            />
          </label>

          {renderPasswordField({
            label: 'Пароль',
            onChange: setRegisterPassword,
            onToggleVisible: () =>
              setIsRegisterPasswordVisible((current) => !current),
            placeholder: 'Придумайте пароль',
            value: registerPassword,
            visible: isRegisterPasswordVisible
          })}

          {renderPasswordField({
            label: 'Повтор пароля',
            onChange: setRegisterPasswordRepeat,
            onToggleVisible: () =>
              setIsRegisterPasswordRepeatVisible((current) => !current),
            placeholder: 'Повторите пароль',
            value: registerPasswordRepeat,
            visible: isRegisterPasswordRepeatVisible
          })}


          <Button fullWidth size='lg' type='submit'>
            Зарегистрироваться
          </Button>
        </form>
      )}
    </Modal>
  )
}
