# Admin App Guide

## Назначение

`apps/admin` — административная панель на `Next.js 16`, `React 19`, `antd` и `axios`.
Приложение использует `App Router`, авторизацию через access/refresh tokens и доменную структуру компонентов.

## Ключевые директории

```text
apps/admin/
  src/
    api/
      auth/
      categories/
      config/
      products/
    app/
      (dashboard)/
      login/
    components/
      admin/
      ui/
```

## Архитектурные паттерны

- `src/app` — маршруты и layout-слой `Next.js`.
- `src/app/(dashboard)` — защищённая часть админки.
- `src/components/admin` — крупные страницы и shell-компоненты админки.
- `src/components/ui` — локальные UI-обёртки и small reusable blocks.
- `src/api/<domain>` — API по доменам.
- `types.ts` — DTO и payload-контракты.
- `model.ts` — внутренние интерфейсы `I...` и mapper/helper-логика.
- `index.ts` — публичный API домена.

## API и авторизация

- Базовый URL задан в `src/api/config/index.ts`.
- Текущее значение: `https://api.battletoads.shop/api`.
- Используются два клиента: `publicApi` и `adminApi`.
- `adminApi` добавляет `Authorization` в request interceptor.
- При `401` срабатывает refresh-механизм и повтор запроса.

Ключи токенов в `localStorage`:

- `btshop-admin-access-token`
- `btshop-admin-refresh-token`

Правильный паттерн для нового API-домена:

1. `types.ts` — DTO, request payloads, response payloads.
2. `model.ts` — `IAdmin...` сущности, mapper-функции и helper-утилиты.
3. `index.ts` — методы домена, которые используют `adminApi` или `publicApi`.
4. UI-слой работает только с внутренними моделями, а не с raw response.

## Соглашения по именованию

- Интерфейсы — `I...`.
- Type aliases — `T...`.
- Модели админки удобно префиксовать как `IAdmin...`, если они относятся только к admin app.
- Компоненты и папки компонентов — `PascalCase`.
- Импорт SCSS — всегда `styles`.

## Стили и визуальная система

Админка использует общие глобальные токены из `@btshop/shared/styles/globals.scss` и поверх них стилизует `antd`.

Базовые цвета проекта:

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

- Основной шрифт — `Onest`.
- Фон собран из светлого градиента и мягкого radial accent.
- Для layout и форм активно используется `antd`.
- Для точечной кастомизации библиотечных компонентов применяются `:global(...)` внутри `*.module.scss`.

## Паттерны компонентов

Типовая структура страницы:

```text
ProductsPage/
  ProductsPage.tsx
  ProductsPage.module.scss
```

Что характерно для текущей админки:

- Страницы обычно client-side: `use client`.
- Данные загружаются внутри компонента через `useEffect`.
- UI-обратная связь отдаётся через `App.useApp().message`.
- CRUD-операции завязаны на доменный `api`-модуль.
- Быстрые mapper/helper-функции остаются в `model.ts`, а не размазываются по компонентам.

## Layout и доступ

- Основной shell находится в `src/components/admin/AdminShell/AdminShell.tsx`.
- `AdminShell` проверяет сессию, запрашивает `/auth/me`, валидирует admin role и только потом открывает dashboard.
- Навигация строится через tab-based header.
- Защита маршрутов сейчас реализована на уровне клиентского shell, это важно учитывать при расширении dashboard.

## Что важно соблюдать при разработке

- Не вызывать backend напрямую из UI без доменного `api`-слоя.
- Не смешивать DTO и внутренние admin-модели.
- Если логика выбора, маппинга или flatten tree переиспользуется, держать её в `model.ts`.
- Если нужно кастомизировать `antd`, сначала пробовать модульный SCSS рядом с компонентом, а не глобальный хаос.
- Новые страницы dashboard оформлять в той же доменной структуре: `components/admin/<PageName>`.

## Чеклист для новых фич

1. Добавить или расширить домен в `src/api`.
2. Описать DTO и mapper.
3. Создать страницу/блок в `src/components/admin`.
4. Подключить экран через `src/app/(dashboard)` и при необходимости обновить навигацию shell.
5. Проверить сценарии `401`, refresh token и пустые состояния UI.
