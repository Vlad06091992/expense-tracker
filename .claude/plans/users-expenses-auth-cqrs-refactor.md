# CQRS Refactor: users → auth → expenses

## Context

Сейчас `users` модуль уже частично в CQRS: есть `CreateUserCommand`, `FindUserByEmail/IdQuery` и их хендлеры, которые тонкими прокси вызывают `UsersService` (тот в свою очередь дергает Prisma). `auth` и `expenses` пока классические NestJS-сервисы с прямой бизнес-логикой и Prisma-доступом внутри.

Цель — выровнять все три модуля по одному паттерну:

- **Repository** = слой данных (только Prisma I/O, никакой бизнес-логики).
- **Command/Query handlers** = вся бизнес-логика (валидации, хеширование, проверка прав, маппинг).
- **Controllers** = напрямую инжектят `CommandBus`/`QueryBus`, без сервис-фасадов.

`UsersService` → `UsersRepository` делается первым как образец, затем `auth` и `expenses` приводятся к тому же шаблону. События пока не добавляем — только commands и queries.

---

## Целевая структура модуля (шаблон)

```
<feature>/
  <feature>.controller.ts        # инжектит CommandBus/QueryBus
  <feature>.module.ts            # CqrsModule + Repository + handlers
  <feature>.repository.ts        # тонкий Prisma-слой
  commands/
    <action>.command.ts
    <action>.handler.ts
  queries/
    <name>.query.ts
    <name>.handler.ts
  dto/
```

Хендлер инжектит `<Feature>Repository` (и при необходимости `CommandBus`/`QueryBus` для cross-module). Никаких сервисов.

---

## ✅ Этап 1. Users → Repository

**Файлы:**

- ✅ Создан `users.repository.ts`, класс `UsersRepository`.
- ✅ Обновлены `create-user.handler.ts`, `find-user-by-email.handler.ts`, `find-user-by-id.handler.ts` — инжектируют `UsersRepository`.
- ✅ `users.controller.ts` — инжектирует `QueryBus`, `me()` выполняет `FindUserByIdQuery`.
- ✅ `users.module.ts` — провайдер заменён на `UsersRepository`.
- ⏳ `users.service.ts` — файл ещё не удалён.

Проверка: `pnpm --filter api build` собирается, `GET /api/users/me` возвращает данные после логина.

---

## ✅ Этап 2. Auth → CQRS

**Новые commands** (`apps/api/src/auth/commands/`):

- ✅ `register-user.command.ts` + `register-user.handler.ts` — проверка дубля email, bcrypt, CreateUserCommand, buildAuthResponse.
- ✅ `login-user.command.ts` + `login-user.handler.ts` — поиск по email, bcrypt.compare, buildAuthResponse.

**✅ Утилиты:** `auth/utils/build-auth-response.ts` — общий helper для JWT sign + маппинга user.

**✅ Контроллер** `auth.controller.ts` — инжектирует `CommandBus`, вызывает `RegisterUserCommand` / `LoginUserCommand`.

**JwtStrategy** — уже использует `QueryBus`, оставляем как есть.

**✅ Модуль** `auth.module.ts` — удалён `AuthService`, добавлены `RegisterUserHandler`, `LoginUserHandler`.

- ⏳ `auth.service.ts` — файл ещё не удалён.

Проверка: `POST /api/auth/register` и `POST /api/auth/login` возвращают токен; повторная регистрация дает 409; неверный пароль — 401.

---

## ✅ Этап 3. Expenses → Repository + CQRS

**`expenses.repository.ts`** — обертка над `PrismaService` (только I/O):

- ✅ `findAllByUser(userId)`
- ✅ `findOneByUser(userId, id)`
- ✅ `create(userId, data)`
- ✅ `updateByUser(userId, id, data)`
- ✅ `removeByUser(userId, id)`

**Queries** (`expenses/queries/`):

- ✅ `list-expenses.query.ts` + `list-expenses.handler.ts`
- ✅ `get-expense.query.ts` + `get-expense.handler.ts` (бросает `NotFoundException`)

**Commands** (`expenses/commands/`):

- ✅ `create-expense.{command,handler}.ts` — дефолты currency/spentAt
- ✅ `update-expense.{command,handler}.ts` — `NotFoundException` при count === 0
- ✅ `delete-expense.{command,handler}.ts` — `NotFoundException` при count === 0

**✅ Контроллер** `expenses.controller.ts` — инжектирует `CommandBus` + `QueryBus`.

**✅ Модуль** `expenses.module.ts` — `CqrsModule`, `ExpensesRepository`, 5 хендлеров.

**✅ Удалены:** `auth.service.ts`, `expenses.service.ts`, `users.service.ts`.

Проверка (с JWT из логина): полный CRUD-цикл expense через `curl`/Postman; PATCH/DELETE на чужой `id` дают 404.

---

## Критические файлы

**Изменяются:**

- ✅ `apps/api/src/users/users.service.ts` → `users.repository.ts`
- ✅ `apps/api/src/users/users.module.ts`
- ✅ `apps/api/src/users/users.controller.ts`
- ✅ `apps/api/src/users/commands/create-user.handler.ts`
- ✅ `apps/api/src/users/queries/find-user-by-email.handler.ts`
- ✅ `apps/api/src/users/queries/find-user-by-id.handler.ts`
- ✅ `apps/api/src/auth/auth.controller.ts`
- ✅ `apps/api/src/auth/auth.module.ts`
- ✅ `apps/api/src/expenses/expenses.controller.ts`
- ✅ `apps/api/src/expenses/expenses.module.ts`

**Удалены:**

- ✅ `apps/api/src/auth/auth.service.ts`
- ✅ `apps/api/src/users/users.service.ts`
- ✅ `apps/api/src/expenses/expenses.service.ts`

**Созданы:**

- ✅ `apps/api/src/auth/commands/register-user.{command,handler}.ts`
- ✅ `apps/api/src/auth/commands/login-user.{command,handler}.ts`
- ✅ `apps/api/src/auth/utils/build-auth-response.ts`
- ✅ `apps/api/src/expenses/expenses.repository.ts`
- ✅ `apps/api/src/expenses/queries/list-expenses.{query,handler}.ts`
- ✅ `apps/api/src/expenses/queries/get-expense.{query,handler}.ts`
- ✅ `apps/api/src/expenses/commands/create-expense.{command,handler}.ts`
- ✅ `apps/api/src/expenses/commands/update-expense.{command,handler}.ts`
- ✅ `apps/api/src/expenses/commands/delete-expense.{command,handler}.ts`

---

## Verification

```bash
pnpm --filter api build          # компиляция всех трёх модулей
pnpm lint
pnpm test
pnpm dev                         # api на :3001

# Smoke (ручной/curl):
# 1. POST /api/auth/register {email,password,name} → 201 + token
# 2. POST /api/auth/register тем же email → 409
# 3. POST /api/auth/login → 200 + token
# 4. GET  /api/users/me   (Bearer token) → user
# 5. POST /api/expenses {amount, description} → 201
# 6. GET  /api/expenses → массив с созданным
# 7. PATCH /api/expenses/:id {amount} → обновлено
# 8. PATCH /api/expenses/<foreign-id> → 404
# 9. DELETE /api/expenses/:id → 200; повтор → 404
```
