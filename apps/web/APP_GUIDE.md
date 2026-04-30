# Web App Guide

## Назначение

`apps/web` — клиентский storefront на `Next.js 16` и `React 19`.
Приложение использует `App Router`, `Redux Toolkit`, `axios` и `SCSS Modules`.

## Ключевые директории

```text
apps/web/
  assets/
    icons/
    images/
  src/
    api/
    app/
    components/
      auth/
      cart/
      catalog/
      faq/
      home/
      layout/
      product/
      profile/
      reviews/
      ui/
    lib/
    mocks/
    models/
    shared/
      constants/
      hooks/
      utils/
    store/
```

## Архитектурные паттерны

- `src/app` — роуты, layout и entrypoints страниц.
- `src/components` — доменные UI-блоки, сгруппированные по бизнес-зонам, а не по типу файлов.
- `src/components/ui` — базовые переиспользуемые примитивы.
- `src/api/<domain>` — frontend API-слой домена.
- `types.ts` — DTO и контрактные типы API.
- `model.ts` — внутренние интерфейсы приложения и функции маппинга DTO -> model.
- `index.ts` — public API папки.
- `src/lib` — low-level helpers вроде route builders.
- `src/shared/utils` и `src/shared/hooks` — общая логика без жёсткой привязки к одной странице.
- `src/store` — глобальное состояние `Redux Toolkit`.

## API и интеграция

- Базовый URL сейчас захардкожен в `src/api/config/index.ts`.
- Текущее значение: `https://api.battletoads.shop/api`.
- Используются два клиента: `publicApi` и `privateApi`.
- `privateApi` автоматически добавляет `Authorization: Bearer <token>`.
- Токен хранится в `localStorage` по ключу `btshop-access-token`.

Рекомендуемый паттерн для нового домена:

1. Создать `src/api/<domain>/types.ts` для DTO.
2. Создать `src/api/<domain>/model.ts` для `I...` моделей и mapper-функций.
3. Создать `src/api/<domain>/index.ts` с методами `get/create/update/delete`.
4. В компоненты отдавать уже нормализованные модели, а не сырые DTO.

## Состояние и данные

- Глобальный store создаётся в `src/store/store.ts`.
- В store сейчас живут `auth` и `cart`.
- Типы store оформлены как `TAppStore`, `TRootState`, `TAppDispatch`.
- Для локального UI-состояния используется `useState`; для приложенческого состояния — Redux только когда это действительно shared state.

## Соглашения по компонентам

- Один компонент = одна папка.
- В папке компонента обычно лежат:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.scss
```

- Имена компонентов — `PascalCase`.
- Имена интерфейсов — `I...`.
- Имена type aliases — `T...`.
- Импорт стилей всегда как `styles`.
- Для классов часто используется локальный helper вроде `joinClasses`, без лишних библиотек.

## Стили и визуальный язык

Глобальные токены приходят из `@btshop/shared/styles/globals.scss`.

Основные CSS custom properties:

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
- `--color-success: #1a8f5d`
- `--shadow-soft: 0px 2px 10px 0px rgba(0, 0, 0, 0.08)`
- `--radius-xl: 28px`
- `--radius-lg: 20px`
- `--radius-md: 16px`
- `--radius-sm: 12px`
- `--container-width: 1400px`

Дополнительные визуальные принципы:

- Основной шрифт — `Onest`.
- В интерфейсе часто используются светлые градиенты, мягкие тени и синий accent.
- `SCSS Modules` лежат рядом с компонентом.
- Анимации используются умеренно и почти всегда с учётом `prefers-reduced-motion`.

## Адаптив и mobile tabs

- Нижний мобильный бар `MobileTabs` включается на breakpoint `max-width: 650px`.
- В этом же breakpoint layout компенсирует fixed bar: `body` получает `padding-bottom: 70px`.
- Для мобильного layout также меняется верхний отступ контента: `main` получает `padding-top: 76px`.
- Если добавляем fixed-элементы внизу экрана, нужно проверять их совместимость именно с breakpoint `650px`.

## Роутинг

- Route helpers лежат в `src/lib/routes.ts`.
- Для генерации ссылок предпочтительно использовать helper-функции, а не собирать URL строками в JSX.
- Динамические сегменты организованы через `App Router`.

## Что важно соблюдать при разработке

- Не смешивать DTO API и внутренние модели UI.
- Не складывать все компоненты в `ui`, если это доменная логика.
- Повторяющуюся логику выносить в `shared/utils`, `shared/hooks` или `lib`.
- Новые стили строить поверх существующих CSS variables, а не вводить случайные hex-цвета без причины.
- Если появляется общий reusable-компонент, добавлять ему явный API и изолированный `module.scss`.

## Чеклист для новых фич

1. Определить домен: `api`, `components`, `shared` или `store`.
2. Если есть backend-ручка, сначала описать `types.ts` и `model.ts`.
3. Если нужны ссылки, добавить helper в `src/lib/routes.ts`.
4. Если состояние нужно в нескольких местах, решить, нужен ли `Redux`.
5. Стили держать рядом с компонентом и опираться на общую палитру.
