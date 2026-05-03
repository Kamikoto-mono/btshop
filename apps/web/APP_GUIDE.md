# Web App Guide

## Назначение

`apps/web` — клиентский storefront на `Next.js 16`, `React 19`, `App Router`, `Redux Toolkit`, `axios` и `SCSS Modules`.

Приложение уже работает не только на моках:

- реальная авторизация и профиль через `/api/auth/*`
- реальное оформление заказа через `/api/orders`
- история заказов через `/api/orders/history`
- SEO-слой через `metadata`, `robots`, `sitemap` и `JSON-LD`

## Структура

```text
apps/web/
  assets/
    icons/
    images/
  public/
    favicon.svg
    front-assets/
  src/
    api/
      auth/
      categories/
      config/
      orders/
      products/
    app/
      market/
      categories/
      products/[productId]/
      [categorySlug]/
      [categorySlug]/[compoundSlug]/
      [categorySlug]/[compoundSlug]/[lineSlug]/
      faq/
      reviews/
      profile/
      cart/
      checkout/
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
      seo/
      ui/
    lib/
    mocks/
    models/
    shared/
      constants/
      hooks/
      seo/
      utils/
    store/
```

## Архитектурные правила

- `src/app` — маршруты, `layout`, `loading`, `not-found`, серверные entrypoints.
- `src/components` — доменные UI-блоки по бизнес-зонам.
- `src/components/ui` — переиспользуемые примитивы.
- `src/components/seo` — `BreadcrumbsJsonLd`, `ProductJsonLd` и подобные SEO-компоненты.
- `src/api/<domain>` — frontend API-слой домена.
- `types.ts` — DTO и payload-контракты.
- `model.ts` — внутренние `I...` модели и mapper-функции.
- `index.ts` — публичный API домена.
- `src/lib` — route helpers, category tree helpers, slug helpers.
- `src/store` — глобальное состояние `Redux Toolkit`.

## API и интеграция

- Базовый API URL берётся из `@btshop/shared`, текущее значение: `https://api.battletoads.shop/api`.
- Используются два axios-клиента:
  - `publicApi` — публичные ручки
  - `privateApi` — ручки с `Authorization`
- Токены в `localStorage`:
  - `btshop-access-token`
  - `btshop-refresh-token`
- Refresh flow уже подключён.

Текущие реальные домены API:

- `auth`
- `categories`
- `products`
- `orders`

## Аутентификация и профиль

- Авторизация, регистрация, refresh и reset password живут в `src/api/auth`.
- UI auth-модалки декомпозирован на отдельные формы.
- OTP-код — отдельный UI-компонент в `src/components/ui/OtpCode`.
- Профиль работает через `GET/PATCH /api/auth/me`.
- В проекте везде используется поле `address`. Поля `city` нет и не должно быть.

## Заказы

- Checkout использует реальный `POST /api/orders`.
- Способы доставки в заказе:
  - `pochta`
  - `cdek`
- История заказов в профиле больше не моковая:
  - `GET /api/orders/history`
  - пагинация по `15`
  - подгрузка через кнопку `Загрузить ещё`
- В истории заказа нет превью-фотографий товаров, потому что API их не отдаёт.

## Каталог и роутинг

- Категории и подкатегории идут через slash-структуру.
- Для построения путей используется `src/lib/catalogSlugs.ts`.
- Категории первого уровня тоже кликабельны и должны вести в каталог.
- На мобильном `/categories` — отдельный компактный collapsible-tree экран.
- Для ссылок и route helpers предпочтительно использовать `src/lib`, а не собирать URL строками в JSX.

## SEO

В проекте уже есть базовый SEO-контур:

- `metadata` в `src/app/layout.tsx`
- `robots` в `src/app/robots.ts`
- `sitemap` в `src/app/sitemap.ts`
- `generateMetadata()` на category/product pages
- `JSON-LD`:
  - `BreadcrumbList`
  - `Product`

SEO-конфиг и утилиты:

- `src/shared/seo/config.ts`
- `src/shared/seo/utils.ts`

Важно:

- сейчас используются реальные доменные URL сайта
- default OG image берётся из CDN
- `Organization` schema пока не добавляется

## Картинки и ассеты

Общие URL и front-assets вынесены в `@btshop/shared`:

- `SITE_URL`
- `SITE_NAME`
- `DEFAULT_OG_IMAGE_URL`
- `FRONT_ASSETS_BASE_URL`
- `FRONT_ASSET_URLS`

Ключевое:

- `main-toads`, `dna-blocks`, `footer-cell-texture-transparent`, `molecule`, `bt-empty-card` заведены как shared asset URLs
- favicon подключён через `src/app/layout.tsx`
- для тяжёлых декоративных текстур уже используются локальные оптимизированные варианты из `apps/web/public/front-assets`

## Состояние

- В store сейчас живут `auth` и `cart`.
- Гидрация корзины уже защищена от самозатирания на `F5`.
- Для простых селекторов не возвращать новые object literals прямо из `useAppSelector`, иначе будут лишние rerender warnings.

## Стили и визуальный язык

Глобальные токены приходят из `@btshop/shared/styles/globals.scss`.

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
- `--color-success: #1a8f5d`
- `--shadow-soft`
- `--radius-xl`, `--radius-lg`, `--radius-md`, `--radius-sm`
- `--container-width: 1400px`

Соглашения:

- основной шрифт — `Onest`
- стили лежат рядом с компонентом
- импорт SCSS всегда как `styles`
- новые цвета предпочтительно собирать поверх CSS variables, а не хардкодить случайные hex

## Мобильный адаптив

- нижний `MobileTabs` включается на `max-width: 650px`
- при этом:
  - `body` получает `padding-bottom: 70px`
  - `main` получает `padding-top: 76px`
- если добавляется fixed UI снизу, всегда проверять именно breakpoint `650px`

Важно по mobile perf:

- `main-toads` скрыт на мобиле, поэтому не должен получать лишний приоритет загрузки
- стартовые баннеры первого экрана — критичный LCP-кандидат на mobile

## Компонентные соглашения

Типовая папка компонента:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.module.scss
```

Правила:

- компоненты и папки — `PascalCase`
- интерфейсы — `I...`
- type aliases — `T...`
- DTO не тащить напрямую в UI
- reusable UI держать в `src/components/ui`, а не в доменных папках

## Что важно соблюдать при новых изменениях

- Не возвращать `city` ни в заказах, ни в профиле — у нас везде только `address`.
- Не смешивать DTO API и внутренние UI-модели.
- Новые API-домены сначала оформлять через `types.ts` + `model.ts` + `index.ts`.
- Если нужна SEO-страница, сразу думать про `generateMetadata`, `canonical`, `JSON-LD`.
- Если добавляется новый shared URL или front-asset, сначала смотреть в `@btshop/shared/config/urls`.
- Не ломать визуал ради перфоманса: для тяжёлых декоративных картинок сначала оптимизировать вес ассета, а не убирать фон.
