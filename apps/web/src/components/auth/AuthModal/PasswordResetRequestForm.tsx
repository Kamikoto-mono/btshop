'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/shared/utils'
import styles from './AuthModal.module.scss'
import type { IPasswordResetRequestFormValues } from './AuthModal.types'

interface IPasswordResetRequestFormProps {
  formError?: string
  form: UseFormReturn<IPasswordResetRequestFormValues>
  formSuccess?: string
  isSubmitting: boolean
  onBack: () => void
  onSubmit: (values: IPasswordResetRequestFormValues) => Promise<void> | void
}

export const PasswordResetRequestForm = ({
  formError,
  form,
  formSuccess,
  isSubmitting,
  onBack,
  onSubmit
}: IPasswordResetRequestFormProps) => (
  <form className={styles.form} onSubmit={form.handleSubmit(onSubmit)}>
    <p className={styles.helperText}>
      Введите email, который использовали при регистрации. Мы отправим код для
      сброса пароля.
    </p>

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

    {formError ? (
      <div className={`${styles.alert} ${styles.alertError}`}>{formError}</div>
    ) : null}
    {!formError && formSuccess ? (
      <div className={`${styles.alert} ${styles.alertSuccess}`}>{formSuccess}</div>
    ) : null}

    <div className={styles.actionsColumn}>
      <Button disabled={isSubmitting} fullWidth size='lg' type='submit'>
        {isSubmitting ? 'Отправляем код...' : 'Получить код'}
      </Button>

      <button className={styles.secondaryAction} onClick={onBack} type='button'>
        Вернуться ко входу
      </button>
    </div>
  </form>
)
