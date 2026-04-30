'use client'

import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button, Input, OtpCode } from '@/components/ui'
import { validateRequired } from '@/shared/utils'
import styles from './AuthModal.module.scss'
import { AuthPasswordToggle } from './AuthPasswordToggle'
import type { IPasswordResetConfirmFormValues } from './AuthModal.types'

interface IPasswordResetConfirmFormProps {
  form: UseFormReturn<IPasswordResetConfirmFormValues>
  isSubmitting: boolean
  otpResetKey: number
  resetCodeError: string
  onBack: () => void
  onCodeChange: (value: string) => void
  onResend: () => Promise<boolean>
  onSubmit: (values: IPasswordResetConfirmFormValues) => Promise<void> | void
}

export const PasswordResetConfirmForm = ({
  form,
  isSubmitting,
  otpResetKey,
  resetCodeError,
  onBack,
  onCodeChange,
  onResend,
  onSubmit
}: IPasswordResetConfirmFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordRepeatVisible, setIsPasswordRepeatVisible] = useState(false)
  const resetCodeValue = form.watch('code')

  return (
    <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
      <div className={styles.otpBlock}>
        <span className={styles.fieldLabel}>Код подтверждения</span>
        <OtpCode
          errorMessage={resetCodeError}
          invalid={Boolean(resetCodeError)}
          onChange={onCodeChange}
          onResend={onResend}
          resetKey={otpResetKey}
        />
      </div>

      <label className={styles.fieldGroup}>
        <span>Новый пароль</span>
        <Controller
          control={form.control}
          name='newPassword'
          rules={{
            validate: (value) => validateRequired(value, 'Введите новый пароль')
          }}
          render={({ field, fieldState }) => (
            <Input
              {...field}
              endAdornment={
                <AuthPasswordToggle
                  label='новый пароль'
                  onClick={() => setIsPasswordVisible((current) => !current)}
                  visible={isPasswordVisible}
                />
              }
              invalid={fieldState.invalid}
              placeholder='Введите новый пароль'
              type={isPasswordVisible ? 'text' : 'password'}
            />
          )}
        />
        {form.formState.errors.newPassword?.message ? (
          <small className={styles.fieldError}>
            {form.formState.errors.newPassword.message}
          </small>
        ) : null}
      </label>

      <label className={styles.fieldGroup}>
        <span>Повторите новый пароль</span>
        <Controller
          control={form.control}
          name='newPasswordRepeat'
          rules={{
            validate: (value) =>
              value === form.getValues('newPassword') ? true : 'Пароли не совпадают'
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
              placeholder='Повторите новый пароль'
              type={isPasswordRepeatVisible ? 'text' : 'password'}
            />
          )}
        />
        {form.formState.errors.newPasswordRepeat?.message ? (
          <small className={styles.fieldError}>
            {form.formState.errors.newPasswordRepeat.message}
          </small>
        ) : null}
      </label>

      <div className={styles.actionsColumn}>
        <Button
          disabled={isSubmitting || resetCodeValue.length !== 6}
          fullWidth
          size='lg'
          type='submit'
        >
          {isSubmitting ? 'Сохраняем...' : 'Обновить пароль'}
        </Button>

        <button className={styles.secondaryAction} onClick={onBack} type='button'>
          Изменить email
        </button>
      </div>
    </form>
  )
}
