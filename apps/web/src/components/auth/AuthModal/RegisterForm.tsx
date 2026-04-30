'use client'

import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button, Input } from '@/components/ui'
import { validateEmail, validateRequired } from '@/shared/utils'
import styles from './AuthModal.module.scss'
import { AuthPasswordToggle } from './AuthPasswordToggle'
import type { IRegisterFormValues } from './AuthModal.types'

interface IRegisterFormProps {
  form: UseFormReturn<IRegisterFormValues>
  isSubmitting: boolean
  onSubmit: (values: IRegisterFormValues) => Promise<void> | void
}

export const RegisterForm = ({
  form,
  isSubmitting,
  onSubmit
}: IRegisterFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordRepeatVisible, setIsPasswordRepeatVisible] = useState(false)

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
              placeholder='Придумайте пароль'
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

      <label className={styles.fieldGroup}>
        <span>Повтор пароля</span>
        <Controller
          control={form.control}
          name='passwordRepeat'
          rules={{
            validate: (value) =>
              value === form.getValues('password') ? true : 'Пароли не совпадают'
          }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              endAdornment={
                <AuthPasswordToggle
                  label='повтор пароля'
                  onClick={() =>
                    setIsPasswordRepeatVisible((current) => !current)
                  }
                  visible={isPasswordRepeatVisible}
                />
              }
              invalid={fieldState.invalid}
              placeholder='Повторите пароль'
              type={isPasswordRepeatVisible ? 'text' : 'password'}
            />
          )}
        />
        {form.formState.errors.passwordRepeat?.message ? (
          <small className={styles.fieldError}>
            {form.formState.errors.passwordRepeat.message}
          </small>
        ) : null}
      </label>

      <Button disabled={isSubmitting} fullWidth size='lg' type='submit'>
        {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
      </Button>
    </form>
  )
}
