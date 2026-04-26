# Project Stack

## Проект

`btshop` развивается как монорепозиторий с двумя приложениями:

- `apps/web` — основной клиентский сайт
- `apps/admin` — административная панель

## Базовый стек

- `pnpm` workspaces
- `Turborepo`
- `TypeScript`
- `Next.js 16`
- `React 19`
- `SCSS Modules`
- `ESLint`
- `Prettier`

## Структура монорепозитория

```text
apps/
  web/
  admin/
packages/
  config-eslint/
  config-ts/
  shared/
```

## Рекомендуемая структура `apps/web` и `apps/admin`

```text
src/
  app/
  api/
  components/
    ui/
  constants/
  contexts/
  data/
  hooks/
  lib/
  shared/
    utils/
    helpers/
    validators/
  store/
  styles/
  types/
```

## Принципы структуры

- `app` — роуты и layout-слой `Next.js App Router`
- `api` — frontend API-слой, разбитый по доменам
- `components` — React-компоненты, сгруппированные по бизнес-блокам
- `components/ui` — базовые UI-примитивы
- `shared` — переиспользуемая логика без привязки к конкретной странице
- `lib` — инфраструктурные клиенты и low-level helpers
- `hooks` — пользовательские хуки
- `store` — глобальное состояние
- `types` — общие типы проекта

## Правила разработки

- документация, комментарии и коммуникация — на русском языке
- переменные, функции, типы и компоненты — на английском языке
- `interface` начинать с `I`
- `type` начинать с `T`
- не дублировать существующие типы и контракты
- использовать `SCSS Modules`
- хранить стили рядом с компонентом или страницей
- импортировать стили как `styles`
- группировать компоненты по доменам, а не складывать всё в одну папку
- выбирать простые решения без лишнего усложнения
- повторяемую логику выносить в `shared/utils` или `hooks`

## Текущее состояние репозитория

Сейчас в репозитории уже есть общие конфиги:

- `packages/config-eslint`
- `packages/config-ts`

Следующий шаг развития — создание `apps/web`, `apps/admin` и общего пакета `packages/shared`.
