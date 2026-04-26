const cards = [
  'Каталог товаров',
  'Заказы',
  'Пользователи',
  'Контент и FAQ'
]

export default function Page() {
  return (
    <main
      style={{
        width: 'min(1200px, calc(100% - 32px))',
        margin: '0 auto',
        padding: '48px 0'
      }}
    >
      <section
        style={{
          padding: 28,
          border: '1px solid var(--color-border)',
          borderRadius: 28,
          background: 'rgba(255,255,255,0.92)'
        }}
      >
        <p
          style={{
            marginBottom: 12,
            color: 'var(--color-accent)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase'
          }}
        >
          Admin Skeleton
        </p>
        <h1
          style={{
            fontSize: '44px',
            lineHeight: 1,
            letterSpacing: '-0.04em'
          }}
        >
          Каркас админки оставлен, но без реализации интерфейса
        </h1>
        <p
          style={{
            marginTop: 14,
            color: 'var(--color-text-muted)',
            lineHeight: 1.7
          }}
        >
          Основной фокус сейчас на storefront. Админский контур пока просто
          зафиксирован как точка входа под будущий Ant Design.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
            marginTop: 24
          }}
        >
          {cards.map((card) => (
            <div
              key={card}
              style={{
                padding: 18,
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                background: 'linear-gradient(180deg, #ffffff 0%, #edf3fb 100%)',
                fontWeight: 600
              }}
            >
              {card}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
