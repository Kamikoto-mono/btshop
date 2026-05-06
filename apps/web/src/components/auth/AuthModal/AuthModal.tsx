'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import closeIcon from '@assets/icons/close.svg'

import { authApi, getAuthApiErrorMessage } from '@/api/auth'
import { Modal } from '@/components/ui'
import {
  closeAuthModal,
  setAuthMode,
  setUserSession
} from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { normalizeEmail } from '@/shared/utils'
import styles from './AuthModal.module.scss'
import { LoginForm } from './LoginForm'
import { PasswordResetConfirmForm } from './PasswordResetConfirmForm'
import { PasswordResetRequestForm } from './PasswordResetRequestForm'
import { RegisterForm } from './RegisterForm'
import {
  loginDefaults,
  passwordResetConfirmDefaults,
  passwordResetRequestDefaults,
  registerDefaults,
  type ILoginFormValues,
  type IPasswordResetConfirmFormValues,
  type IPasswordResetRequestFormValues,
  type IRegisterFormValues,
  type TModalView
} from './AuthModal.types'

export const AuthModal = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isOpen, mode, redirectTo } = useAppSelector((state) => state.auth)

  const [view, setView] = useState<TModalView>('auth')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [resetCodeError, setResetCodeError] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [otpResetKey, setOtpResetKey] = useState(0)
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  const [isResetRequestSubmitting, setIsResetRequestSubmitting] = useState(false)
  const [isResetConfirmSubmitting, setIsResetConfirmSubmitting] = useState(false)

  const loginForm = useForm<ILoginFormValues>({
    defaultValues: loginDefaults,
    mode: 'onBlur'
  })

  const registerForm = useForm<IRegisterFormValues>({
    defaultValues: registerDefaults,
    mode: 'onBlur'
  })

  const passwordResetRequestForm = useForm<IPasswordResetRequestFormValues>({
    defaultValues: passwordResetRequestDefaults,
    mode: 'onBlur'
  })

  const passwordResetConfirmForm = useForm<IPasswordResetConfirmFormValues>({
    defaultValues: passwordResetConfirmDefaults,
    mode: 'onBlur'
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setView('auth')
    setFormError('')
    setFormSuccess('')
    setResetCodeError('')
    setResetEmail('')
    setResetCode('')
    setOtpResetKey(0)

    loginForm.reset(loginDefaults)
    registerForm.reset(registerDefaults)
    passwordResetRequestForm.reset(passwordResetRequestDefaults)
    passwordResetConfirmForm.reset(passwordResetConfirmDefaults)
  }, [isOpen, loginForm, passwordResetConfirmForm, passwordResetRequestForm, registerForm])

  const handleClose = () => {
    dispatch(closeAuthModal())
  }

  const clearMessages = () => {
    setFormError('')
    setFormSuccess('')
    setResetCodeError('')
  }

  const handleSuccessAuth = async () => {
    const user = await authApi.me()

    dispatch(setUserSession(user))

    if (redirectTo) {
      router.push(redirectTo)
    }
  }

  const handleLogin = async (values: ILoginFormValues) => {
    clearMessages()
    setIsLoginSubmitting(true)

    try {
      await authApi.login({
        email: normalizeEmail(values.email),
        password: values.password
      })

      await handleSuccessAuth()
    } catch (error) {
      setFormError(getAuthApiErrorMessage(error, 'Не удалось войти в аккаунт'))
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleRegister = async (values: IRegisterFormValues) => {
    clearMessages()
    setIsRegisterSubmitting(true)

    try {
      await authApi.register({
        email: normalizeEmail(values.email),
        password: values.password
      })

      await handleSuccessAuth()
    } catch (error) {
      setFormError(
        getAuthApiErrorMessage(error, 'Не удалось завершить регистрацию')
      )
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const handlePasswordResetRequest = async (
    values: IPasswordResetRequestFormValues
  ) => {
    clearMessages()
    setIsResetRequestSubmitting(true)

    const normalizedEmail = normalizeEmail(values.email)

    try {
      const response = await authApi.requestPasswordReset({
        email: normalizedEmail
      })

      setResetEmail(normalizedEmail)
      setResetCode('')
      setFormSuccess(response.message)
      setOtpResetKey((current) => current + 1)
      passwordResetConfirmForm.reset(passwordResetConfirmDefaults)
      setView('resetConfirm')
    } catch (error) {
      setFormError(
        getAuthApiErrorMessage(error, 'Не удалось отправить код восстановления')
      )
    } finally {
      setIsResetRequestSubmitting(false)
    }
  }

  const handlePasswordResetConfirm = async (
    values: IPasswordResetConfirmFormValues
  ) => {
    clearMessages()

    if (resetCode.length !== 6) {
      setResetCodeError('Введите код из письма.')
      return
    }

    setIsResetConfirmSubmitting(true)

    try {
      const response = await authApi.confirmPasswordReset({
        code: resetCode,
        email: resetEmail,
        newPassword: values.newPassword,
        newPasswordRepeat: values.newPasswordRepeat
      })

      loginForm.setValue('email', resetEmail)
      dispatch(setAuthMode('login'))
      setView('auth')
      setFormSuccess(response.message)
      setResetCode('')
      passwordResetRequestForm.reset({
        email: resetEmail
      })
      passwordResetConfirmForm.reset(passwordResetConfirmDefaults)
    } catch (error) {
      const message = getAuthApiErrorMessage(
        error,
        'Не удалось обновить пароль'
      )

      setFormError(message)
      setResetCodeError(message)
    } finally {
      setIsResetConfirmSubmitting(false)
    }
  }

  const handleResendResetCode = async () => {
    clearMessages()

    try {
      const response = await authApi.requestPasswordReset({
        email: resetEmail
      })

      setResetCode('')
      setResetCodeError('')
      setOtpResetKey((current) => current + 1)
      setFormSuccess(response.message)
      return true
    } catch (error) {
      setFormError(
        getAuthApiErrorMessage(error, 'Не удалось отправить код повторно')
      )
      return false
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      modalClassName={styles.modal}
      onClose={handleClose}
      width={560}
    >
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <h2>
            {view === 'auth'
              ? 'Вход и регистрация'
              : view === 'resetRequest'
                ? 'Восстановление пароля'
                : 'Введите код из письма'}
          </h2>
          {view === 'resetConfirm' ? (
            <p className={styles.subtitle}>
              Код отправлен на <strong>{resetEmail}</strong>
            </p>
          ) : null}
        </div>

        <button
          aria-label='Закрыть модалку'
          className={styles.closeButton}
          onClick={handleClose}
          type='button'
        >
          <Image alt='' aria-hidden='true' src={closeIcon} />
        </button>
      </div>

      {view === 'auth' ? (
        <>
          <div className={styles.tabs}>
            <button
              className={mode === 'login' ? styles.tabActive : styles.tab}
              onClick={() => {
                clearMessages()
                dispatch(setAuthMode('login'))
              }}
              type='button'
            >
              Авторизация
            </button>
            <button
              className={mode === 'register' ? styles.tabActive : styles.tab}
              onClick={() => {
                clearMessages()
                dispatch(setAuthMode('register'))
              }}
              type='button'
            >
              Регистрация
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm
              formError={formError}
              form={loginForm}
              formSuccess={formSuccess}
              isSubmitting={isLoginSubmitting}
              onForgotPassword={(email) => {
                clearMessages()
                passwordResetRequestForm.setValue('email', email)
                setView('resetRequest')
              }}
              onSubmit={handleLogin}
            />
          ) : (
            <RegisterForm
              formError={formError}
              form={registerForm}
              formSuccess={formSuccess}
              isSubmitting={isRegisterSubmitting}
              onSubmit={handleRegister}
            />
          )}
        </>
      ) : view === 'resetRequest' ? (
        <>
          <PasswordResetRequestForm
            formError={formError}
            form={passwordResetRequestForm}
            formSuccess={formSuccess}
            isSubmitting={isResetRequestSubmitting}
            onBack={() => {
              clearMessages()
              setView('auth')
            }}
            onSubmit={handlePasswordResetRequest}
          />
        </>
      ) : (
        <>
          <PasswordResetConfirmForm
            form={passwordResetConfirmForm}
            formError={formError}
            formSuccess={formSuccess}
            isSubmitting={isResetConfirmSubmitting}
            onBack={() => {
              clearMessages()
              setResetCode('')
              setView('resetRequest')
            }}
            codeValue={resetCode}
            onCodeChange={(value) => {
              if (resetCodeError) {
                setResetCodeError('')
              }

              setResetCode(value)
            }}
            onResend={handleResendResetCode}
            onSubmit={handlePasswordResetConfirm}
            otpResetKey={otpResetKey}
            resetCodeError={resetCodeError}
          />
        </>
      )}
    </Modal>
  )
}
