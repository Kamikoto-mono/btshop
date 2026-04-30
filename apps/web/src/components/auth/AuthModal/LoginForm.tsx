'use client'

import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button, Input } from '@/components/ui'
import { normalizeEmail, validateEmail, validateRequired } from '@/shared/utils'
import styles from './AuthModal.module.scss'
import { AuthPasswordToggle } from './AuthPasswordToggle'
import type { ILoginFormValues } from './AuthModal.types'

interface ILoginFormProps {
  form: UseFormReturn<ILoginFormValues>
  isSubmitting: boolean
  onForgotPassword: (email: string) => void
  onSubmit: (values: ILoginFormValues) => Promise<void> | void
}

export const LoginForm = ({
  form,
  isSubmitting,
  onForgotPassword,
  onSubmit
}: ILoginFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
      <label className={styles.fieldGroup}>
        <span>Email</span>
        <Controller
          control={form.control}
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
        {form.formState.errors.email?.message ? (
          <small className={styles.fieldError}>
            {form.formState.errors.email.message}
          </small>
        ) : null}
      </label>

      <label className={styles.fieldGroup}>
        <span>Пароль</span>
        <Controller
          control={form.control}
          name='password'
          rules={{
            validate: (value) => validateRequired(value, 'Введите пароль')
          }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              endAdornment={
                <AuthPasswordToggle
                  label='пароль'
                  onClick={() => setIsPasswordVisible((current) => !current)}
                  visible={isPasswordVisible}
                />
              }
              invalid={fieldState.invalid}
              placeholder='Введите пароль'
              type={isPasswordVisible ? 'text' : 'password'}
            />
          )}
        />
        {form.formState.errors.password?.message ? (
          <small className={styles.fieldError}>
            {form.formState.errors.password.message}
          </small>
        ) : null}
      </label>

      <div className={styles.metaRow}>
        <label className={styles.checkbox}>
          <Controller
            control={form.control}
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

        <button
          className={styles.forgotLink}
          onClick={() => onForgotPassword(normalizeEmail(form.getValues('email')))}
          type='button'
        >
          Забыли пароль?
        </button>
      </div>

      <Button disabled={isSubmitting} fullWidth size='lg' type='submit'>
        {isSubmitting ? 'Входим...' : 'Войти'}
      </Button>
    </form>
  )
}
