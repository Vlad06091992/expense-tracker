# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Monorepo**: Nx 20 + pnpm workspaces
- **Frontend** (`apps/web`): Next.js 16, App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** (`apps/api`): NestJS 11, TypeScript, JWT auth (`passport-jwt`)
- **Database**: PostgreSQL 16 via docker-compose
- **ORM**: Prisma 6, schema lives in `packages/database/prisma/schema.prisma`
- **Validation**: `class-validator` + `class-transformer` on the backend

## Development setup

```bash
pnpm install
cp .env.example .env          # adjust credentials if needed
docker compose up -d          # start PostgreSQL
pnpm db:migrate               # run prisma migrate dev
pnpm dev                      # start web (3000) and api (3001) in parallel
```

## Common commands

```bash
# Run all apps
pnpm dev

# Scope a command to one app
pnpm --filter web dev
pnpm --filter api start:dev

# Build / lint / test everything
pnpm build
pnpm lint
pnpm test

# Run a single test file (from apps/api/)
pnpm --filter api test -- --testPathPattern=auth

# Database
pnpm db:generate    # regenerate Prisma Client after schema changes
pnpm db:migrate     # create and apply a new migration
pnpm db:studio      # open Prisma Studio

# Format
pnpm format
```

## Architecture

### Package graph

```
apps/web  ──────────────────────┐
                                 ├──> @repo/shared-types
apps/api  ──> @repo/database ───┘
```

- `@repo/database` — exports `PrismaClient` and model types. `apps/api` wraps it in `PrismaService` (`apps/api/src/prisma/`), registered as a global NestJS provider so any module can inject it without re-importing.
- `@repo/shared-types` — plain TypeScript interfaces (no runtime code). Used for request/response DTOs shared between frontend and backend (e.g., `AuthResponse`, `ExpenseDto`).
- `@repo/eslint-config` / `@repo/tsconfig` — shared config packages referenced via `workspace:*`.

### Backend (`apps/api`)

NestJS modules are feature-sliced:

```
src/
  prisma/          # PrismaModule (global) + PrismaService
  auth/            # register/login → JWT; JwtStrategy + JwtAuthGuard
  users/           # UsersService used by AuthService to look up users
  expenses/        # CRUD, all routes protected by JwtAuthGuard
  common/          # filters/, interceptors/ (empty stubs, ready to fill)
```

`JwtAuthGuard` is applied at controller level with `@UseGuards(JwtAuthGuard)`. The JWT payload is `{ sub: userId, email }` — validated via `JwtStrategy.validate()` which re-fetches the user from DB.

`ConfigModule` is global; env vars are loaded from `.env.local` then `.env`.

### Frontend (`apps/web`)

Next.js App Router. Directory conventions:
- `src/app/` — pages and layouts
- `src/components/ui/` — shadcn/ui components (add via `npx shadcn add <component>`)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/lib/api.ts` — `API_URL` constant (`NEXT_PUBLIC_API_URL`)

Tailwind uses CSS variables for theming (defined in `globals.css`). Dark mode is class-based.

### Database schema

Three models: `User` → `Category` (1-to-many), `User` → `Expense` (1-to-many), `Category` → `Expense` (optional). All deletes cascade from User; category deletion sets `Expense.categoryId` to null.

## Key conventions

- All internal packages use `workspace:*` references, not published to npm.
- Shared TypeScript paths are configured in `tsconfig.base.json` at the root (`@repo/database`, `@repo/shared-types`).
- After editing `schema.prisma`, always run `pnpm db:generate` before starting the API.
- Backend DTOs use `class-validator` decorators; use `PartialType` from `@nestjs/mapped-types` for update DTOs.
- `UpdateExpenseDto` extends `PartialType(CreateExpenseDto)` — this pattern should be followed for new resources.

## Branch workflow (GitHub Flow)

- `main` — всегда стабильная и деплоируемая ветка; прямые пуши запрещены
- Любая новая работа начинается с ветки от `main`
- Именование веток: `<type>/<short-description>` — тип совпадает с Conventional Commits (`feat`, `fix`, `refactor`, `chore`, …)
- Ветка живёт ровно столько, сколько длится задача — слияние через PR, затем удаление
- PR требует как минимум одного ревью перед merge в `main`
- Merge-стратегия: squash-merge для фич, merge-commit для релизов

**Примеры имён веток:**
```
feat/main-screen
fix/token-refresh
refactor/auth-module
chore/update-dependencies
```

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `revert`

**Scopes** (optional, match the app/package): `api`, `web`, `database`, `shared-types`

**Rules:**
- Subject line: imperative mood, lowercase, no period, max 72 chars
- Breaking changes: append `!` after scope or add `BREAKING CHANGE:` in footer
- Use body to explain *why*, not *what*

**Examples:**
```
feat(api): add transactions module with CQRS
fix(web): prevent token loss on page refresh
refactor(database): rename Expense model to Transaction
feat(api)!: remove legacy /expenses endpoints
```
