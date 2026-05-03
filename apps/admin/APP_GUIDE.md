# Admin App Guide

## Назначение

`apps/admin` — административная панель на `Next.js 16`, `React 19`, `antd`, `axios` и `SCSS Modules`.

Админка уже работает с живыми данными:

- login и session-check через `/api/auth/*`
- товары через `/api/admin/products`
- категории через `/api/admin/categories`
- заказы через `/api/admin/orders`

## Структура

```text
apps/admin/
  src/
    api/
      auth/
      categories/
      config/
      orders/
      products/
    app/
      (dashboard)/
        categories/
        orders/
        products/
      login/
    components/
      admin/
        AdminShell/
        CategoriesPage/
        LoginPage/
        OrdersPage/
        PlaceholderPage/
        ProductsPage/
      ui/
        AdminDataTable/
        AdminFiltersPanel/
        AdminModalShell/
        UploadDropZone/
```

## Архитектурные правила

- `src/app` — маршруты и layout-слой `Next.js`.
- `src/app/(dashboard)` — защищённая часть админки.
- `src/components/admin` — крупные экраны и shell.
- `src/components/ui` — переиспользуемые admin UI-обёртки.
- `src/api/<domain>` — API по доменам.
- `types.ts` — DTO и payload-контракты.
- `model.ts` — внутренние `I...` модели и mapper/helper-логика.
- `index.ts` — публичный API домена.

## API и авторизация

- Базовый API URL берётся из `@btshop/shared`, текущее значение: `https://api.battletoads.shop/api`.
- Используются два клиента:
  - `publicApi`
  - `adminApi`
- `adminApi` добавляет `Authorization` и умеет refresh/retry.

Токены в `localStorage`:

- `btshop-admin-access-token`
- `btshop-admin-refresh-token`

Текущая логика доступа:

- после успешного `login` / `me()` админка проверяет `role === 'admin'`
- только при `role: "admin"` shell открывает dashboard

## Доступные API-домены

- `auth`
- `categories`
- `products`
- `orders`

## Reusable admin UI

В админке уже есть вынесенный общий UI-слой, который нужно переиспользовать дальше:

- `AdminFiltersPanel`
- `AdminDataTable`
- `AdminModalShell`
- `UploadDropZone`

Правило:

- если делаем новую CRUD-страницу, сначала смотреть, можно ли собрать её на этих обёртках
- не дублировать таблицы, фильтр-блоки и модальные shell-компоненты локально по страницам

## Страницы

### Products

- Страница товаров уже сидит на общих admin UI-обёртках.
- Product modal использует `AdminModalShell`.

### Orders

- Есть отдельная страница `OrdersPage`.
- Таблица работает с реальным `GET /api/admin/orders`.
- Поддерживаются:
  - фильтр по статусу
  - фильтр по диапазону дат
  - просмотр заказа
  - `PATCH /api/admin/orders/{id}`
  - `DELETE /api/admin/orders/{id}`
- Статус можно менять прямо в таблице через dropdown-tag, без открытия модалки.

Важно по раскладке данных:

- в колонке `Клиент` идут:
  - email
  - telegram
  - телефон
- в колонке `Адрес` идут:
  - ФИО
  - address
  - индекс
- поля `city` в заказах нет и не должно быть

## Стили и визуальная система

Админка опирается на общие токены из `@btshop/shared/styles/globals.scss` и поверх них стилизует `antd`.

Основные переменные:

- `--color-page: #f3f6fb`
- `--color-surface: #ffffff`
- `--color-surface-muted: #e9eef5`
- `--color-border: #ccd6e4`
- `--color-border-strong: #a9b8cc`
- `--color-text: #16304f`
- `--color-text-muted: #61758f`
- `--color-accent: #1d63d8`
- `--color-accent-soft: #dbe8ff`
- `--color-accent-dark: #11469d`

Особенности admin UI:

- основной шрифт — `Onest`
- фон и layout светлые, с мягким градиентом
- `antd` кастомизируется локально через `module.scss` и `:global(...)`
- визуал новых общих обёрток нельзя ломать ради локальной страницы

## Именование и соглашения

- интерфейсы — `I...`
- type aliases — `T...`
- admin-модели удобно держать как `IAdmin...`, если они относятся только к админке
- компоненты и папки — `PascalCase`
- импорт стилей всегда как `styles`

## Что важно соблюдать при новых изменениях

- Не вызывать backend напрямую из UI, минуя `src/api/<domain>`.
- Не смешивать raw DTO и внутренние admin-модели.
- Если mapper, flatten tree или select-options логика переиспользуется, держать её в `model.ts`.
- Если нужна новая CRUD-страница, по умолчанию собирать её на `AdminFiltersPanel`, `AdminDataTable`, `AdminModalShell`.
- Не разносить одинаковые filter/table/modal реализации по разным страницам.
- При работе с заказами не добавлять `city`: у заказа его нет, используем только `address`.

## Чеклист для новой admin-фичи

1. Добавить или расширить домен в `src/api`.
2. Описать `types.ts`, `model.ts`, `index.ts`.
3. Собрать страницу в `src/components/admin/<PageName>`.
4. По возможности использовать уже существующие admin UI-обёртки.
5. Подключить экран через `src/app/(dashboard)`.
6. Проверить `401`, refresh token, empty states и loading/error feedback.
