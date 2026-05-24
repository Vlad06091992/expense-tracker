# FSD-шпаргалка для apps/web

## Главное правило

Импорты идут **только вниз** по слоям. `features` может импортировать из `entities` и `shared`, но не наоборот.

```
app → views → widgets → features → entities → shared
```

---

## Реальная структура `src/`

```
src/
├── app/                              # Next.js App Router — только роутинг и провайдеры
│   ├── (app)/
│   │   ├── page.tsx                  # import { DashboardPage } from '@/views/dashboard'
│   │   ├── transactions/page.tsx     # import { TransactionsPage } from '@/views/transactions'
│   │   ├── categories/page.tsx       # import { CategoriesPage } from '@/views/categories'
│   │   └── layout.tsx                # auth-guard: проверка токена + редирект
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── layout.tsx
│   ├── providers.tsx                 # React Query, Toaster и т.п.
│   └── globals.css
│
├── views/                            # Полные страницы с версткой (Next.js «page» → view)
│   ├── dashboard/
│   │   ├── ui/dashboard-page.tsx
│   │   └── index.ts
│   ├── transactions/
│   │   ├── ui/transactions-page.tsx
│   │   └── index.ts
│   ├── categories/
│   │   ├── ui/categories-page.tsx
│   │   └── index.ts
│   ├── sign-in/
│   │   ├── ui/sign-in-page.tsx
│   │   └── index.ts
│   └── sign-up/
│       ├── ui/sign-up-page.tsx
│       └── index.ts
│
├── widgets/                          # Крупные самодостаточные блоки интерфейса
│   ├── app-header/
│   │   ├── ui/app-header.tsx
│   │   └── index.ts
│   └── recent-transactions/
│       ├── ui/recent-transactions.tsx
│       └── index.ts
│
├── features/                         # Пользовательские действия / сценарии
│   ├── auth/
│   │   ├── api/auth.api.ts           # signIn(), signUp() — вызовы к /auth/*
│   │   ├── model/
│   │   │   ├── schema.ts             # Zod-схемы SignInValues, SignUpValues
│   │   │   └── use-logout.ts         # хук с логикой выхода
│   │   └── index.ts
│   ├── transaction-form/
│   │   ├── ui/transaction-form-dialog.tsx
│   │   ├── model/schema.ts
│   │   └── index.ts
│   └── category-form/
│       ├── ui/category-form-dialog.tsx
│       ├── model/schema.ts
│       └── index.ts
│
├── entities/                         # Бизнес-сущности: данные + UI-элемент одной сущности
│   ├── transaction/
│   │   ├── api/transaction.api.ts    # CRUD-запросы к /transactions
│   │   ├── model/queries.ts          # React Query хуки: useTransactions, useTransaction
│   │   ├── lib/format.ts             # formatAmount() и другие утилиты сущности
│   │   ├── ui/transaction-row.tsx    # одна строка таблицы транзакций
│   │   └── index.ts
│   ├── category/
│   │   ├── api/category.api.ts
│   │   ├── model/queries.ts
│   │   ├── ui/category-item.tsx
│   │   └── index.ts
│   └── user/
│       ├── api/user.api.ts
│       ├── model/use-current-user.ts
│       └── index.ts
│
└── shared/                           # Без бизнес-логики — только инфраструктура
    ├── api/
    │   ├── http-client.ts            # базовый fetch-клиент с токеном
    │   └── query-client.ts           # экземпляр QueryClient
    ├── config/
    │   ├── api.ts                    # NEXT_PUBLIC_API_URL
    │   └── routes.ts                 # ROUTES константа
    ├── lib/
    │   ├── token.ts                  # getToken / setToken / removeToken
    │   └── utils.ts                  # cn() (clsx + tailwind-merge)
    └── ui/                           # shadcn-компоненты (не трогать вручную)
        ├── button.tsx
        ├── card.tsx
        └── ...
```

---

## Куда что класть — быстрая таблица

| Что создаёшь | Слой | Пример пути |
|---|---|---|
| Примитивный UI без логики (кнопка, инпут) | `shared/ui/` | `shared/ui/badge.tsx` |
| Утилита без бизнеса (`cn`, форматирование даты) | `shared/lib/` | `shared/lib/utils.ts` |
| Константы маршрутов | `shared/config/routes.ts` | `ROUTES.dashboard` |
| Базовый URL API | `shared/config/api.ts` | `API_URL` |
| Работа с токеном (get/set/remove) | `shared/lib/token.ts` | — |
| Базовый HTTP-клиент | `shared/api/http-client.ts` | — |
| Тип / интерфейс бизнес-сущности | `entities/<name>/model/` | `entities/transaction/model/` |
| API-запросы одной сущности | `entities/<name>/api/` | `entities/transaction/api/transaction.api.ts` |
| React Query хуки для сущности | `entities/<name>/model/queries.ts` | `useTransactions()` |
| Утилита специфичная для сущности | `entities/<name>/lib/` | `entities/transaction/lib/format.ts` |
| UI одного элемента сущности | `entities/<name>/ui/` | `entities/transaction/ui/transaction-row.tsx` |
| Zod-схема формы | `features/<name>/model/schema.ts` | `features/category-form/model/schema.ts` |
| Хук с логикой действия | `features/<name>/model/` | `features/auth/model/use-logout.ts` |
| API-вызовы фичи (не CRUD-сущности) | `features/<name>/api/` | `features/auth/api/auth.api.ts` |
| Диалог / форма с действием | `features/<name>/ui/` | `features/transaction-form/ui/transaction-form-dialog.tsx` |
| Шапка, сайдбар, лента с данными | `widgets/` | `widgets/app-header/ui/app-header.tsx` |
| Полный UI страницы | `views/<name>/ui/` | `views/dashboard/ui/dashboard-page.tsx` |
| Страница Next.js | `app/` | `app/(app)/page.tsx` — только импорт из `views/` |

---

## Как выглядит страница

Страница в `app/` — максимально тонкая, только импортирует из `views/`:

```tsx
// app/(app)/page.tsx
import { DashboardPage } from '@/views/dashboard';
export default function Page() { return <DashboardPage />; }
```

Вся реальная вёрстка и логика — в `views/`:

```tsx
// views/dashboard/ui/dashboard-page.tsx
import { useTransactions, formatAmount } from '@/entities/transaction';
import { RecentTransactions } from '@/widgets/recent-transactions';
// ...
```

---

## Разница: `entities` vs `features`

| | `entities` | `features` |
|---|---|---|
| **Что это** | Бизнес-сущность (данные + один UI-элемент) | Действие пользователя |
| **Примеры** | `transaction`, `category`, `user` | `auth`, `transaction-form`, `category-form` |
| **API** | CRUD одной сущности | Сценарный вызов (login, logout) |
| **UI** | Одна строка таблицы, один тег | Форма, диалог, кнопка с мутацией |
| **Может импортировать** | только `shared` | `entities` + `shared` |

---

## Правило `index.ts` (публичное API слайса)

Снаружи слайса импортируют **только** через `index.ts`:

```ts
// features/auth/index.ts
export { signIn, signUp } from './api/auth.api';
export { signInSchema, type SignInValues } from './model/schema';
export { useLogout } from './model/use-logout';
```

```ts
// ✅ правильно
import { useLogout } from '@/features/auth';

// ❌ неправильно — лезем во внутренности
import { useLogout } from '@/features/auth/model/use-logout';
```

---

## Что трогать не надо

- `shared/ui/*` — shadcn-компоненты, добавлять только через `npx shadcn add <component>`
- `app/layout.tsx`, `app/globals.css` — корневые файлы Next.js
- `shared/api/query-client.ts` — синглтон QueryClient, менять не нужно
