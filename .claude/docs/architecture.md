# Архитектура

## Структура монорепо

```
expense-tracker/
├── apps/
│   ├── api/          # NestJS REST API
│   └── web/          # Next.js фронтенд
├── packages/
│   ├── database/     # Prisma-схема, миграции, экспорт PrismaClient
│   ├── shared-types/ # Чистые TypeScript-интерфейсы (без runtime-кода)
│   └── eslint-config/
├── nx.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Граф зависимостей пакетов:**

```
apps/web  ──────────────────────────┐
                                     ├──> @repo/shared-types
apps/api  ──> @repo/database ───────┘
```

---

## Бэкенд: NestJS (`apps/api`)

### Структура модулей

```
src/
├── main.ts                   # Bootstrap: глобальный префикс, CORS, ValidationPipe, Swagger
├── app.module.ts             # Корневой модуль
├── prisma/                   # Глобальный PrismaService (наследует PrismaClient)
├── auth/                     # JWT-аутентификация (регистрация, вход, guard, strategy)
├── users/                    # Сущность пользователя (CQRS-обработчики, репозиторий)
├── categories/               # CRUD категорий (CQRS-обработчики, репозиторий)
├── transactions/             # CRUD транзакций (CQRS-обработчики, репозиторий)
└── common/                   # filters/, interceptors/ (зарезервировано, пока пусто)
```

### Паттерн CQRS

Каждый доменный модуль следует одной структуре:

```
<module>/
├── <module>.module.ts
├── <module>.controller.ts    # Только HTTP-слой — без бизнес-логики
├── <module>.repository.ts    # Все Prisma-запросы; изоляция данных через userId
├── commands/
│   ├── create-<entity>.command.ts   # Класс с данными команды
│   ├── create-<entity>.handler.ts   # Бизнес-логика
│   ├── update-<entity>.command.ts
│   ├── update-<entity>.handler.ts
│   ├── delete-<entity>.command.ts
│   └── delete-<entity>.handler.ts
├── queries/
│   ├── list-<entity>.query.ts
│   ├── list-<entity>.handler.ts
│   ├── get-<entity>.query.ts
│   └── get-<entity>.handler.ts
└── dto/
    ├── create-<entity>.dto.ts
    └── update-<entity>.dto.ts
```

**Цепочка запроса:**

```
Controller → CommandBus / QueryBus → Handler → Repository → Prisma
```

### PrismaService

`apps/api/src/prisma/prisma.service.ts` — наследует `PrismaClient`, зарегистрирован как глобальный провайдер в `PrismaModule`. Любой модуль может инжектировать его без повторного импорта `PrismaModule`.

### Аутентификация

- **Стратегия:** Passport JWT (`passport-jwt`)
- Токен извлекается из заголовка `Authorization: Bearer <token>`
- При каждом запросе стратегия заново загружает пользователя из БД по `payload.sub` — позволяет мгновенно отозвать доступ удалением записи
- `JwtAuthGuard` применяется через `@UseGuards(JwtAuthGuard)` на защищённых маршрутах/контроллерах
- В `req.user` передаётся `{ id: string; email: string }`

### Глобальная конфигурация bootstrap (`main.ts`)

| Настройка | Значение |
|-----------|----------|
| Глобальный префикс | env `API_PREFIX` (по умолчанию `api`) |
| CORS | env `CORS_ORIGIN` (по умолчанию `http://localhost:3000`), `credentials: true` |
| ValidationPipe | `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true` |
| Swagger | `/api/docs` |

---

## Фронтенд: Next.js (`apps/web`)

### Feature Sliced Design (FSD)

Слои от верхнего к нижнему — каждый слой может импортировать только из слоёв ниже:

```
app        Next.js App Router — страницы и лэйауты (route groups)
  ↓
widgets    Составные UI-блоки (app-header, recent-transactions)
  ↓
views      Компоновки целых страниц (dashboard-page, transactions-page, …)
  ↓
features   Пользовательские взаимодействия с мутациями (auth, category-form, transaction-form)
  ↓
entities   Доменные модели с запросами и read-only UI (user, category, transaction)
  ↓
shared     Конфиг, утилиты, http-клиент, shadcn/ui компоненты
```

Каждый слайс внутри слоя имеет одинаковую внутреннюю структуру:

```
<slice>/
├── api/        # Вызовы apiFetch
├── model/      # React Query хуки (queries.ts, mutations.ts), Zod-схемы
├── ui/         # React-компоненты
└── index.ts    # Публичный barrel-экспорт
```

**Правило импортов:** импортировать только из `index.ts` слайса, никогда из внутренних путей.

### Route Groups

| Группа | Шаблон пути | Авторизация |
|--------|-------------|-------------|
| `(auth)` | `/sign-in`, `/sign-up` | публичные |
| `(app)` | `/`, `/transactions`, `/categories` | защищённые |

`middleware.ts` защищает роуты: проверяет cookie `access_token` и выполняет редиректы.

### Загрузка данных

- **React Query** (`@tanstack/react-query`) для всего серверного состояния
- `staleTime: 60 000 мс`, `retry: 1`, `refetchOnWindowFocus: false`
- Все запросы и мутации находятся в `model/` соответствующего слайса сущности или фичи
- Мутации вызывают `queryClient.invalidateQueries` при успехе для актуализации кэша

### HTTP-клиент (`shared/api/http-client.ts`)

Обёртка `apiFetch<T>(path, options)`:
- Читает токен из `document.cookie` через `getToken()`
- Автоматически добавляет заголовок `Authorization: Bearer`
- Ответы `204` возвращают `undefined`
- Ответ `401` очищает токен и делает редирект на `/sign-in`
- Ненулевые ошибки выбрасывают `ApiError { status, message }`

### Формы

Паттерн: `react-hook-form` + `zodResolver` + Zod-схема, описанная в `model/schema.ts`.

---

## Общие пакеты

### `@repo/shared-types`

Чистые TypeScript-интерфейсы, без runtime-кода. Используются одновременно в `apps/api` (формы ответов) и `apps/web` (типизация API-клиента). Ключевые типы:

- `AuthResponse`, `JwtPayload`
- `UserDto`
- `CategoryDto`, `CreateCategoryInput`, `UpdateCategoryInput`
- `TransactionDto`, `TransactionType`, `CreateTransactionInput`, `TransactionListResponse`, `TransactionSummary`, `PaginationMeta`

> Важно: `TransactionDto.amount` имеет тип `string`, потому что Prisma сериализует `Decimal` в JSON как строку.

### `@repo/database`

Экспортирует экземпляр `PrismaClient` и все типы моделей Prisma. В `apps/api` оборачивается в `PrismaService`.
