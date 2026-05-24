### Фронтенд (`apps/web`)

**Стек:** Next.js 16, App Router, TypeScript, Tailwind CSS, shadcn/ui, React Query, react-hook-form + zod.

## Команды

```bash
pnpm --filter web dev
```

## Переменные окружения

```
NEXT_PUBLIC_API_URL   # по умолчанию http://localhost:3001/api
```

## Архитектура: Feature Sliced Design (FSD)

```
src/
  shared/      # конфиги (api.ts, routes.ts), либы (token.ts, utils.ts), UI shadcn/ui
  entities/    # domain-сущности: user, category, transaction (API + queries + UI)
  features/    # user interactions: auth (sign-in/up), формы транзакций/категорий
  views/       # page compositions: dashboard, transactions, categories, sign-in/up
  widgets/     # составные блоки: app-header, recent-transactions
  app/         # Next.js App Router: layouts, страницы, middleware
```

Правило импортов: более высокие слои могут импортировать более низкие, но не наоборот (`app` → `widgets` → `views` → `features` → `entities` → `shared`).

## Маршруты

```
/             — дашборд (доходы, расходы, баланс)
/transactions — список транзакций с пагинацией
/categories   — управление категориями
/sign-in      — вход (публичный)
/sign-up      — регистрация (публичный)
```

Страницы `/`, `/transactions`, `/categories` находятся в группе `(app)` и требуют авторизации. Страницы `/sign-in`, `/sign-up` — в группе `(auth)`.

## Аутентификация

**Middleware** (`src/middleware.ts` → `src/middleware/proxy.ts`) защищает все маршруты кроме `PUBLIC_PATHS = ['/sign-in', '/sign-up']`: проверяет наличие `access_token` в cookies, неавторизованных редиректит на `/sign-in`, авторизованных с `/sign-in` или `/sign-up` редиректит на `/`.

**Токен** хранится в cookie (`src/shared/lib/token.ts`):
- `setToken()` — `max-age=604800` (7 дней), `SameSite=Lax`, `Secure` на HTTPS.
- `getToken()` — парсит document.cookie (только клиентский код).
- `clearToken()` — обнуляет cookie.

## HTTP-клиент

`src/shared/api/http-client.ts` — обёртка `apiFetch()` над fetch:
- Автоматически добавляет `Authorization: Bearer {token}` из cookie.
- При получении 401 чистит токен и редиректит на `/sign-in`.
- Возвращает `undefined` для ответов 204 No Content.
- Выбрасывает `ApiError` с полем `status` для остальных ошибок.

## Работа с данными

**React Query** (`src/shared/api/query-client.ts`): `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`.

Мутации после успеха вызывают `queryClient.invalidateQueries()` для обновления кэша.

**Формы**: `react-hook-form` + `zod`. Схемы лежат в `<feature>/model/schema.ts`.

**Важная особенность:** поле `amount` у транзакций хранится как `Decimal` и приходит с API строкой. Zod-схема конвертирует его в `number` при валидации.

## Структура директорий

- `src/app/` — страницы и лейауты (App Router)
- `src/components/ui/` — компоненты shadcn/ui (добавлять через `npx shadcn add <component>`)
- `src/shared/lib/utils.ts` — хелпер `cn()` (clsx + tailwind-merge)
- `src/shared/api/http-client.ts` — базовый HTTP-клиент

Tailwind использует CSS-переменные для тем (определены в `globals.css`). Тёмный режим переключается классом.
