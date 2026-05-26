# Expense Tracker

Веб-приложение для личного учёта расходов. Пользователь регистрируется, создаёт категории и записывает транзакции — простой инструмент контроля личного бюджета.

Монорепозиторий: Next.js-фронтенд + NestJS REST API + PostgreSQL.

---

## Стек

| Слой        | Технологии                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Монорепо    | Nx 20 + pnpm workspaces                                                                          |
| Фронтенд    | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query, react-hook-form + zod |
| Бэкенд      | NestJS 11, TypeScript, Passport JWT, CQRS (`@nestjs/cqrs`)                                       |
| База данных | PostgreSQL 16 (docker-compose)                                                                   |
| ORM         | Prisma 6                                                                                         |

---

## Требования

- **Node.js** >= 20.11.0
- **pnpm** >= 9.15.0
- **Docker** + Docker Compose (для PostgreSQL)

---

## Быстрый старт

### 1. Установить зависимости

```bash
pnpm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env
```

Открыть `.env` и задать обязательные значения:

```dotenv
# PostgreSQL — используется docker-compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=expense_tracker

# Prisma / API
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expense_tracker?schema=public
JWT_SECRET=your-secret-here          # обязателен, без него API не запустится
JWT_EXPIRES_IN=7d
API_PORT=3001
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000

# Next.js (нужна при сборке фронта)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Запустить PostgreSQL

```bash
docker compose up -d
```

### 4. Применить миграции

```bash
pnpm db:migrate
```

### 5. Запустить dev-сервер

```bash
pnpm dev
```

- Фронтенд: http://localhost:3000
- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

---

## Структура проекта

```
apps/
  web/                  # Next.js фронтенд (порт 3000)
  api/                  # NestJS бэкенд (порт 3001)
packages/
  database/             # Prisma schema + PrismaClient (@repo/database)
  shared-types/         # Общие TS-интерфейсы и DTO (@repo/shared-types)
  eslint-config/        # Общий ESLint (@repo/eslint-config)
  tsconfig/             # Базовые tsconfig (@repo/tsconfig)
```

### Фронтенд (`apps/web`) — Feature Sliced Design

```
src/
  app/          # Next.js App Router: layouts, страницы, middleware
  widgets/      # составные блоки: app-header, recent-transactions
  views/        # page compositions: dashboard, transactions, categories, sign-in/up
  features/     # user interactions: auth (sign-in/up), формы транзакций/категорий
  entities/     # domain-сущности: user, category, transaction
  shared/       # конфиги, http-клиент, UI (shadcn/ui), утилиты
```

### Бэкенд (`apps/api`) — NestJS модули

```
src/
  auth/           # регистрация / вход → JWT
  users/          # поиск пользователей (используется auth)
  transactions/   # CRUD транзакций (защищён JWT)
  categories/     # CRUD категорий (защищён JWT)
  prisma/         # PrismaModule + PrismaService (глобальный)
  common/         # filters/, interceptors/
```

---

## API Endpoints

Базовый URL: `http://localhost:3001/api`

### Аутентификация (публичные)

```
POST /auth/register   — регистрация: { email, password }
POST /auth/login      — вход: { email, password } → { access_token }
```

### Транзакции (требуют JWT)

```
GET    /transactions              — список; query: ?month=&year=&page=&limit=
POST   /transactions              — создать транзакцию
GET    /transactions/:id          — получить по id
PATCH  /transactions/:id          — обновить
DELETE /transactions/:id          — удалить (204 No Content)
```

### Категории (требуют JWT)

```
GET    /categories                — список категорий пользователя
POST   /categories                — создать категорию
PATCH  /categories/:id            — обновить
DELETE /categories/:id            — удалить (204 No Content)
```

JWT передаётся в заголовке: `Authorization: Bearer <token>`

---

## Команды

| Команда            | Действие                                        |
| ------------------ | ----------------------------------------------- |
| `pnpm dev`         | Запуск фронтенда и бэкенда параллельно          |
| `pnpm build`       | Сборка всех приложений                          |
| `pnpm lint`        | Линтинг всех проектов                           |
| `pnpm test`        | Тесты всех проектов                             |
| `pnpm format`      | Форматирование через Prettier                   |
| `pnpm db:generate` | Пересоздать Prisma Client после изменений схемы |
| `pnpm db:migrate`  | Создать и применить новую миграцию              |
| `pnpm db:studio`   | Открыть Prisma Studio (GUI для БД)              |

Запуск отдельного приложения:

```bash
pnpm --filter web dev
pnpm --filter api start:dev
```

---

## Схема базы данных

Три модели: `User` → `Category` (1-to-many), `User` → `Transaction` (1-to-many), `Category` → `Transaction` (опционально).

- Удаление пользователя каскадно удаляет все его данные.
- Удаление категории обнуляет `Transaction.categoryId` (не удаляет транзакции).
- `amount` хранится как `Decimal(12,2)`, в JSON приходит строкой.
- Уникальный индекс `(userId, name)` на категориях — дубли имён запрещены.

Схема: `packages/database/prisma/schema.prisma`

---

## Коллекция Postman

В корне репозитория — `Expense-Tracker-API.postman_collection.json`. Импортируй в Postman для быстрой проверки всех эндпоинтов.
