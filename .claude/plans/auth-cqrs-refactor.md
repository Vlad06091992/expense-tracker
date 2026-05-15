# План: CQRS-взаимодействие между Auth и Users

## Context

В `apps/api` уже есть рабочая авторизация (JWT + bcryptjs) и модуль `users`, но `AuthService` и `JwtStrategy` напрямую импортируют `UsersService`. Нужно убрать прямую связь: общение между модулями только через CQRS-шины (`CommandBus` / `QueryBus`). По итогам обсуждения — без событий и саг, минимум: команды + запросы.

## Изменения

### 1. Зависимости
- [x] `apps/api/package.json`: добавить `@nestjs/cqrs` (^11.x).
- [x] `pnpm install` после правки.

### 2. Users module — добавить handlers

Структура:
```
apps/api/src/users/
  commands/
    create-user.command.ts
    create-user.handler.ts
  queries/
    find-user-by-email.query.ts
    find-user-by-email.handler.ts
    find-user-by-id.query.ts
    find-user-by-id.handler.ts
  users.module.ts        # + CqrsModule, регистрация хэндлеров
  users.service.ts       # остаётся как «репозиторий» — вызывается только хэндлерами
  users.controller.ts    # без изменений (в рамках своего модуля прямой вызов сервиса допустим)
```

- [x] `CreateUserCommand(email, passwordHash, name?)` → возвращает `User`.
- [x] `FindUserByEmailQuery(email)` → `User | null`.
- [x] `FindUserByIdQuery(id)` → `User | null`.
- [x] Хэндлеры — тонкие обёртки над `UsersService` (он уже умеет `create/findByEmail/findById`).
- [x] `UsersModule`: `imports: [CqrsModule]`, `providers: [UsersService, ...handlers]`. `UsersService` больше **не** экспортируется.

### 3. Auth module — перейти на шины

- [x] `apps/api/src/auth/auth.module.ts`: убрать `UsersModule` из `imports`, добавить `CqrsModule`.
- [x] `apps/api/src/auth/auth.service.ts`:
  - [x] Удалить инъекцию `UsersService`.
  - [x] Инжектить `CommandBus` и `QueryBus`.
  - [x] `register`: `queryBus.execute(new FindUserByEmailQuery(...))` для проверки дубликата → `commandBus.execute(new CreateUserCommand(...))`.
  - [x] `login`: `queryBus.execute(new FindUserByEmailQuery(...))` + проверка пароля.
- [x] `apps/api/src/auth/strategies/jwt.strategy.ts`: удалить инъекцию `UsersService`, заменить на `queryBus.execute(new FindUserByIdQuery(payload.sub))`.

### 4. Импорты команд/запросов

Хэндлеры из `users/` импортируются в Auth напрямую как **типы команд/запросов** (это просто DTO-классы, без бизнес-логики). Связь идёт через шину, а не через сервис.

## Критические файлы

- [x] `apps/api/package.json` — добавить `@nestjs/cqrs`.
- [x] `apps/api/src/users/users.module.ts` — `CqrsModule`, регистрация хэндлеров, убрать экспорт `UsersService`.
- [x] `apps/api/src/users/commands/*` и `apps/api/src/users/queries/*` — новые файлы.
- [x] `apps/api/src/auth/auth.module.ts` — убрать `UsersModule`, добавить `CqrsModule`.
- [x] `apps/api/src/auth/auth.service.ts` — переписать на `CommandBus`/`QueryBus`.
- [x] `apps/api/src/auth/strategies/jwt.strategy.ts` — переписать на `QueryBus`.

## Верификация

1. [x] `pnpm install` (после правки package.json).
2. [x] `pnpm --filter api build` — компиляция без ошибок.
3. [ ] `pnpm --filter api start:dev` — поднимается без ошибок DI.
4. [ ] Ручной прогон через curl/REST-клиент:
   - [ ] `POST /auth/register` с новым email → 201, токен + user.
   - [ ] `POST /auth/register` повторно → 409 (email занят).
   - [ ] `POST /auth/login` валидные креды → 200, токен.
   - [ ] `POST /auth/login` неверный пароль → 401.
   - [ ] `GET /users/me` с токеном → 200, профиль (проверяет работу `JwtStrategy` через `QueryBus`).
5. [ ] `pnpm --filter api test` — существующие тесты (если есть) проходят.
