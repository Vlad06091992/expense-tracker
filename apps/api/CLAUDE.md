### Бэкенд (`apps/api`)

**Стек:** NestJS 11, TypeScript, JWT-аутентификация (`passport-jwt`), `class-validator` + `class-transformer`.

Модули NestJS нарезаны по фичам:

```
src/
  prisma/          # PrismaModule (глобальный) + PrismaService
  auth/            # регистрация/логин → JWT; JwtStrategy + JwtAuthGuard
  users/           # UsersService — используется AuthService для поиска пользователей
  transactions/    # CRUD, все роуты защищены JwtAuthGuard
  categories/      # CRUD, все роуты защищены JwtAuthGuard
  common/          # filters/, interceptors/ (пустые заглушки, готовы к наполнению)
```

`JwtAuthGuard` применяется на уровне контроллера через `@UseGuards(JwtAuthGuard)`. JWT-payload: `{ sub: userId, email }` — валидируется в `JwtStrategy.validate()`, который перечитывает пользователя из БД при каждом запросе.

`ConfigModule` глобальный; переменные окружения загружаются из `.env.local`, затем из `.env`.

## Архитектура: CQRS + Repository

Все операции реализованы через CQRS (`@nestjs/cqrs`):
- **Command Handlers** — мутации (create, update, delete).
- **Query Handlers** — чтение (list, get, findBy*).

Контроллеры инжектируют `CommandBus` и `QueryBus`, handlers работают с **Repository**-классами (`TransactionsRepository`, `CategoriesRepository`, `UsersRepository`), которые инкапсулируют все запросы к Prisma. При добавлении нового ресурса следовать этой же схеме.

## Endpoints

```
POST   /api/auth/register       — открытый
POST   /api/auth/login          — открытый

GET    /api/transactions         — ?month=, ?year=, ?page=, ?limit=
POST   /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id    — возвращает 204 без тела

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id      — возвращает 204 без тела
```

Все `/api/transactions` и `/api/categories` защищены `JwtAuthGuard`.

## Глобальная конфигурация (main.ts)

- Глобальный префикс: `api` (из env `API_PREFIX`).
- CORS включён с `credentials: true` (origin из env `CORS_ORIGIN`, по умолчанию `http://localhost:3000`).
- `ValidationPipe`: `whitelist: true`, `transform: true`, `forbidNonWhitelisted: true`.

## Схема базы данных

Три модели: `User` → `Category` (1-to-many), `User` → `Transaction` (1-to-many), `Category` → `Transaction` (опционально). Все удаления каскадируются от User; удаление категории обнуляет `Transaction.categoryId`.

Важные ограничения:
- `Category`: уникальный составной индекс `(userId, name)` — нельзя создать две категории с одинаковым именем у одного пользователя.
- `Transaction`: составной индекс `(userId, date)` — оптимизирует фильтрацию по дате.
- `amount` хранится как `Decimal(12,2)`, при сериализации в JSON приходит строкой.

Схема находится в `packages/database/prisma/schema.prisma`. После изменения схемы всегда запускать `pnpm db:generate` перед стартом API.

## Переменные окружения

```
DATABASE_URL          # строка подключения к PostgreSQL
JWT_SECRET            # обязателен, без него API не запустится
JWT_EXPIRES_IN        # по умолчанию '7d'
API_PORT              # по умолчанию 3001
API_PREFIX            # по умолчанию 'api'
CORS_ORIGIN           # по умолчанию 'http://localhost:3000'
```

## Команды

```bash
pnpm --filter api start:dev

# Запустить один тестовый файл
pnpm --filter api test -- --testPathPattern=auth

# База данных
pnpm db:generate    # пересоздать Prisma Client после изменений схемы
pnpm db:migrate     # создать и применить новую миграцию
pnpm db:studio      # открыть Prisma Studio
```

## Соглашения по DTO

- Использовать декораторы `class-validator` на всех DTO.
- Для update-DTO использовать `PartialType` из `@nestjs/mapped-types`.
- `UpdateTransactionDto` расширяет `PartialType(CreateTransactionDto)` — следовать этому паттерну для новых ресурсов.
- Ошибки: `ConflictException` (дублирующий email/имя категории), `NotFoundException` (ресурс не найден).

## Документация
После изменения методов — обновляй JSDoc.
Для DTO и контроллеров — добавляй/обновляй Swagger декораторы.
