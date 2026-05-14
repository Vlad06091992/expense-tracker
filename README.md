# Expense Tracker

Монорепозиторий трекера расходов: Next.js (фронтенд) + NestJS (бэкенд) + Prisma/PostgreSQL.

## Стек

- **Монорепо**: Nx + pnpm workspaces
- **Frontend** (`apps/web`): Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend** (`apps/api`): NestJS 11, TypeScript, JWT-аутентификация
- **БД**: PostgreSQL 16 (через docker-compose)
- **ORM**: Prisma 6 (в `packages/database`)

## Структура

```
apps/
  web/      # Next.js frontend
  api/      # NestJS backend
packages/
  database/       # Prisma schema + client (@repo/database)
  shared-types/   # Общие TS типы и DTO (@repo/shared-types)
  eslint-config/  # Общие конфиги ESLint (@repo/eslint-config)
  tsconfig/       # Базовые tsconfig (@repo/tsconfig)
```

## Запуск (после установки зависимостей)

```bash
# 1. Установить зависимости
pnpm install

# 2. Создать .env из примера
cp .env.example .env

# 3. Поднять PostgreSQL
docker compose up -d

# 4. Применить миграции Prisma
pnpm db:migrate

# 5. Запустить frontend + backend параллельно
pnpm dev
```

## Полезные команды

| Команда | Действие |
|---|---|
| `pnpm dev` | Запуск всех приложений в dev-режиме |
| `pnpm build` | Сборка всех приложений |
| `pnpm lint` | Линтинг всех проектов |
| `pnpm test` | Тесты всех проектов |
| `pnpm db:generate` | Сгенерировать Prisma Client |
| `pnpm db:migrate` | Применить миграции БД |
| `pnpm db:studio` | Открыть Prisma Studio |

## Статус

Сейчас в репозитории только **скелет проекта без установленных зависимостей**. Чтобы начать работу:

```bash
pnpm install
```
