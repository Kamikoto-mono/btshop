import { Button, Card, Result } from 'antd'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24
      }}
    >
      <Card style={{ width: 'min(100%, 640px)' }}>
        <Result
          extra={
            <Button href='/categories' type='primary'>
              К категориям
            </Button>
          }
          status='404'
          subTitle='Такой страницы в админке пока нет.'
          title='Страница не найдена'
        />
      </Card>
    </main>
  )
}
