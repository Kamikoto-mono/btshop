'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import eyeOffIcon from '@assets/icons/eye-off.svg'
import eyeOpenIcon from '@assets/icons/eye-open.svg'

import { Button, Input, Modal } from '@/components/ui'
import {
  closeAuthModal,
  setAuthMode,
  setUserSession
} from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { normalizeEmail, validateEmail, validateRequired } from '@/shared/utils'
import styles from './AuthModal.module.scss'

interface ILoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

interface IRegisterFormValues {
  email: string
  password: string
  passwordRepeat: string
}

interface IPasswordFieldProps {
  error?: string
  label: string
  name: 'password' | 'passwordRepeat'
  placeholder: string
  visible: boolean
}

const loginDefaults: ILoginFormValues = {
  email: '',
  password: '',
  rememberMe: true
}

const registerDefaults: IRegisterFormValues = {
  email: '',
  password: '',
  passwordRepeat: ''
}

export const AuthModal = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isOpen, mode, redirectTo } = useAppSelector((state) => state.auth)

  const [isLoginPasswordVisible, setIsLoginPasswordVisible] = useState(false)
  const [isRegisterPasswordVisible, setIsRegisterPasswordVisible] = useState(false)
  const [isRegisterPasswordRepeatVisible, setIsRegisterPasswordRepeatVisible] =
    useState(false)

  const loginForm = useForm<ILoginFormValues>({
    defaultValues: loginDefaults,
    mode: 'onBlur'
  })

  const registerForm = useForm<IRegisterFormValues>({
    defaultValues: registerDefaults,
    mode: 'onBlur'
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    loginForm.reset(loginDefaults)
    registerForm.reset(registerDefaults)
    setIsLoginPasswordVisible(false)
    setIsRegisterPasswordVisible(false)
    setIsRegisterPasswordRepeatVisible(false)
  }, [isOpen])

  const handleSuccessAuth = (email: string) => {
    dispatch(setUserSession({ email }))

    if (redirectTo) {
      router.push(redirectTo)
    }
  }

  const handleLogin = loginForm.handleSubmit((values) => {
    handleSuccessAuth(normalizeEmail(values.email))
  })

  const handleRegister = registerForm.handleSubmit((values) => {
    handleSuccessAuth(normalizeEmail(values.email))
  })

  const renderPasswordToggle = (
    visible: boolean,
    onClick: () => void,
    label: string
  ) => (
    <button
      aria-label={visible ? `Скрыть ${label}` : `Показать ${label}`}
      className={styles.passwordToggle}
      onClick={onClick}
      type='button'
    >
      <Image alt='' aria-hidden='true' src={visible ? eyeOffIcon : eyeOpenIcon} />
    </button>
  )

  const renderLoginPasswordField = ({
    error,
    label,
    name,
    placeholder,
    visible
  }: IPasswordFieldProps) => (
    <label className={styles.fieldGroup}>
      <span>{label}</span>
      <Controller
        control={loginForm.control}
        name={name as 'password'}
        rules={{
          validate: (value) => validateRequired(value, 'Введите пароль')
        }}
        render={({ field }) => (
          <Input
            {...field}
            endAdornment={renderPasswordToggle(visible, () => {
              setIsLoginPasswordVisible((current) => !current)
            }, 'пароль')}
            invalid={Boolean(error)}
            placeholder={placeholder}
            type={visible ? 'text' : 'password'}
          />
        )}
      />
      {error ? <small className={styles.fieldError}>{error}</small> : null}
    </label>
  )

  const renderRegisterPasswordField = ({
    error,
    label,
    name,
    placeholder,
    visible
  }: IPasswordFieldProps) => (
    <label className={styles.fieldGroup}>
      <span>{label}</span>
      <Controller
        control={registerForm.control}
        name={name}
        rules={{
          validate:
            name === 'password'
              ? (value) => validateRequired(value, 'Введите пароль')
              : (value) =>
                  value === registerForm.getValues('password')
                    ? true
                    : 'Пароли не совпадают'
        }}
        render={({ field }) => (
          <Input
            {...field}
            endAdornment={renderPasswordToggle(
              visible,
              () => {
                if (name === 'password') {
                  setIsRegisterPasswordVisible((current) => !current)
                  return
                }

                setIsRegisterPasswordRepeatVisible((current) => !current)
              },
              label.toLowerCase()
            )}
            invalid={Boolean(error)}
            placeholder={placeholder}
            type={visible ? 'text' : 'password'}
          />
        )}
      />
      {error ? <small className={styles.fieldError}>{error}</small> : null}
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
          <label className={styles.fieldGroup}>
            <span>Email</span>
            <Controller
              control={loginForm.control}
              name='email'
              rules={{ validate: validateEmail }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  invalid={fieldState.invalid}
                  placeholder='email@example.com'
                  type='email'
                />
              )}
            />
            {loginForm.formState.errors.email?.message ? (
              <small className={styles.fieldError}>
                {loginForm.formState.errors.email.message}
              </small>
            ) : null}
          </label>

          {renderLoginPasswordField({
            error: loginForm.formState.errors.password?.message,
            label: 'Пароль',
            name: 'password',
            placeholder: 'Введите пароль',
            visible: isLoginPasswordVisible
          })}

          <div className={styles.metaRow}>
            <label className={styles.checkbox}>
              <Controller
                control={loginForm.control}
                name='rememberMe'
                render={({ field }) => (
                  <input
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    type='checkbox'
                  />
                )}
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
          <label className={styles.fieldGroup}>
            <span>Email</span>
            <Controller
              control={registerForm.control}
              name='email'
              rules={{ validate: validateEmail }}
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  invalid={fieldState.invalid}
                  placeholder='email@example.com'
                  type='email'
                />
              )}
            />
            {registerForm.formState.errors.email?.message ? (
              <small className={styles.fieldError}>
                {registerForm.formState.errors.email.message}
              </small>
            ) : null}
          </label>

          {renderRegisterPasswordField({
            error: registerForm.formState.errors.password?.message,
            label: 'Пароль',
            name: 'password',
            placeholder: 'Придумайте пароль',
            visible: isRegisterPasswordVisible
          })}

          {renderRegisterPasswordField({
            error: registerForm.formState.errors.passwordRepeat?.message,
            label: 'Повтор пароля',
            name: 'passwordRepeat',
            placeholder: 'Повторите пароль',
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
