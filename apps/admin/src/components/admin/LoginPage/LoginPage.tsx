'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'

import { authApi } from '@/api/auth'
import styles from './LoginPage.module.scss'

interface ILoginValues {
  email: string
  password: string
}

export const LoginPage = () => {
  const router = useRouter()
  const [form] = Form.useForm<ILoginValues>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      if (!authApi.hasSession()) {
        return
      }

      try {
        const user = await authApi.me()

        if (!isMounted) {
          return
        }

        if (authApi.isAdminUser(user)) {
          router.replace('/categories')
          return
        }

        authApi.logout()
      } catch {
        authApi.logout()
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleSubmit = async (values: ILoginValues) => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await authApi.login({
        email: values.email.trim().toLowerCase(),
        password: values.password
      })

      const user = await authApi.me()

      if (!authApi.isAdminUser(user)) {
        authApi.logout()
        setErrorMessage('Доступ разрешён только администраторам.')
        return
      }

      router.replace('/categories')
    } catch {
      authApi.logout()
      setErrorMessage('Не удалось войти. Проверьте email и пароль.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={styles.page}>
      <Card className={styles.shell}>
        <span className={styles.eyebrow}>Admin</span>
        <Typography.Title className={styles.title} level={1}>
          Вход в админку
        </Typography.Title>

        {errorMessage ? (
          <Alert
            showIcon
            style={{ marginBottom: 18 }}
            title={errorMessage}
            type='error'
          />
        ) : null}

        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          requiredMark={false}
          size='large'
        >
          <Form.Item
            label='Email'
            name='email'
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' }
            ]}
          >
            <Input placeholder='user@example.com' />
          </Form.Item>

          <Form.Item
            label='Пароль'
            name='password'
            rules={[{ required: true, message: 'Введите пароль' }]}
          >
            <Input.Password placeholder='Введите пароль' />
          </Form.Item>

          <Button block htmlType='submit' loading={isSubmitting} type='primary'>
            Войти
          </Button>
        </Form>
      </Card>
    </main>
  )
}
