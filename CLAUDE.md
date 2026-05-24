# CLAUDE.md

Этот файл содержит инструкции для Claude Code (claude.ai/code) при работе с репозиторием.

## Обзор проекта

Expense Tracker — веб-приложение для личного учёта расходов. Пользователь регистрируется, создаёт категории и записывает траты; цель — дать простой инструмент для контроля личного бюджета без лишней сложности.

Монорепозиторий содержит два приложения:
- **`apps/web`** — Next.js-фронтенд: авторизация, дашборд с расходами, управление категориями.
- **`apps/api`** — NestJS REST API: JWT-аутентификация, CRUD расходов и категорий, хранение в PostgreSQL.

## Стек

- **Монорепо**: Nx 20 + pnpm workspaces
- **Фронтенд** (`apps/web`): Next.js 16 — подробнее в `apps/web/CLAUDE.md`
- **Бэкенд** (`apps/api`): NestJS 11 — подробнее в `apps/api/CLAUDE.md`
- **База данных**: PostgreSQL 16 через docker-compose
- **ORM**: Prisma 6, схема находится в `packages/database/prisma/schema.prisma`

## Требования к окружению

- Node.js >= 20.11.0
- pnpm >= 9.15.0

## Переменные окружения

Все переменные задаются в `.env` (скопировать из `.env.example`):

```
# PostgreSQL (используется docker-compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=expense_tracker

# Prisma / API
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expense_tracker
JWT_SECRET=           # обязателен
JWT_EXPIRES_IN=7d
API_PORT=3001
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000

# Next.js (публичная переменная, нужна при сборке фронта)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Первоначальная настройка

```bash
pnpm install
cp .env.example .env          # заполнить JWT_SECRET и при необходимости остальное
docker compose up -d          # запустить PostgreSQL
pnpm db:migrate               # применить миграции Prisma
pnpm dev                      # запустить web (3000) и api (3001) параллельно
```

## Общие команды

```bash
# Запустить все приложения
pnpm dev

# Сборка / линтинг / тесты
pnpm build
pnpm lint
pnpm test

# Форматирование
pnpm format
```

Команды для отдельных приложений и работы с базой данных — в соответствующих `CLAUDE.md` (`apps/web/`, `apps/api/`).

## Архитектура

### Граф пакетов

```
apps/web  ──────────────────────┐
                                 ├──> @repo/shared-types
apps/api  ──> @repo/database ───┘
```

- `@repo/database` — экспортирует `PrismaClient` и типы моделей. В `apps/api` оборачивается в `PrismaService` (`apps/api/src/prisma/`), зарегистрированный как глобальный NestJS-провайдер — любой модуль может инжектировать его без повторного импорта.
- `@repo/shared-types` — чистые TypeScript-интерфейсы (без runtime-кода). Используются для DTO запросов/ответов, общих между фронтендом и бэкендом (например, `AuthResponse`, `ExpenseDto`).
- `@repo/eslint-config` / `@repo/tsconfig` — пакеты с общей конфигурацией, подключаются через `workspace:*`.

### Схема базы данных

Подробности о моделях — в `apps/api/CLAUDE.md`.

## Соглашения монорепо

- Все внутренние пакеты используют ссылки `workspace:*`, не публикуются в npm.
- Shared TypeScript-пути настроены в `tsconfig.base.json` в корне (`@repo/database`, `@repo/shared-types`).

## Ветки (GitHub Flow)

- `main` — всегда стабильная и деплоируемая ветка; прямые пуши запрещены.
- Любая новая работа начинается с ветки от `main`.
- Именование веток: `<type>/<short-description>` — тип совпадает с Conventional Commits (`feat`, `fix`, `refactor`, `chore`, …).
- Ветка живёт ровно столько, сколько длится задача — слияние через PR, затем удаление.
- PR требует как минимум одного ревью перед merge в `main`.
- Стратегия слияния: squash-merge для фич, merge-commit для релизов.

**Примеры имён веток:**
```
feat/main-screen
fix/token-refresh
refactor/auth-module
chore/update-dependencies
```

## Pull Request

PR создаётся через `gh pr create` после пуша ветки:

```bash
gh pr create \
  --base master \
  --title "feat(web,api): ..." \
  --body "$(cat <<'EOF'
## Что сделано
- ...

## Изменения API
- `GET /...` — ...

## План проверки
- [ ] ...

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Правила оформления PR:**
- Title — по Conventional Commits (тип + scope + краткое описание, ≤72 символа).
- «Что сделано» — маркированный список: что реализовано, зачем.
- «Изменения API» — перечисли новые/изменённые endpoints с методом и путём.
- «План проверки» — чеклист сценариев для ручного тестирования.
- Base branch: `master` (он же `main` на remote/origin).
- После merge ветку удалять.

<important if="если нужно создать коммит">

## Соглашения о коммитах

Следуем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[необязательное тело]

[необязательный footer]
```

**Типы:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `revert`

**Scopes** (опционально, соответствует приложению/пакету): `api`, `web`, `database`, `shared-types`

**Правила:**
- Subject line: повелительное наклонение, строчные буквы, без точки, максимум 72 символа.
- Breaking changes: добавь `!` после scope или `BREAKING CHANGE:` в footer.
- В теле объясняй *почему*, а не *что*.

**Примеры:**
```
feat(api): add transactions module with CQRS
fix(web): prevent token loss on page refresh
refactor(database): rename Expense model to Transaction
feat(api)!: remove legacy /expenses endpoints
```
</important>
