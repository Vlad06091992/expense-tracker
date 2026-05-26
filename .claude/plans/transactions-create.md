# План: модуль Transactions

## Контекст

В проекте уже есть авторизация (JWT) и модуль `categories` на CQRS, но нет центрального учёта доходов/расходов — старый модуль `expenses` был удалён (коммит `7d27b1d`). Нужен новый модуль `transactions`, объединяющий income/expense в одну сущность, с агрегацией по периодам. Структура и стиль — точная копия `categories` (CQRS, repository, JwtAuthGuard, class-validator).

## 1. Prisma schema ✅

Файл: `packages/database/prisma/schema.prisma`

Добавить enum и модель:

```prisma
enum TransactionType {
  INCOME
  EXPENSE
}

model Transaction {
  id          String          @id @default(cuid())
  amount      Decimal         @db.Decimal(12, 2)
  type        TransactionType
  description String?
  date        DateTime
  userId      String
  categoryId  String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  @@index([userId, date])
  @@index([categoryId])
  @@map("transactions")
}
```

Обновить существующие модели — добавить обратные связи:

- `User`: `transactions Transaction[]`
- `Category`: `transactions Transaction[]`

Применить миграцию:

```bash
npx prisma migrate dev --name add-transactions
```

(из `packages/database/` или через `pnpm db:migrate` из корня). Затем `pnpm db:generate`.

## 2. Структура модуля ✅

Каталог: `apps/api/src/transactions/` (как и `categories/` — в `src/`, не в `src/modules/`).

```
transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.repository.ts
├── dto/
│   ├── create-transaction.dto.ts
│   ├── update-transaction.dto.ts
│   └── list-transactions.query-dto.ts   # ?month=&year=
├── commands/
│   ├── create-transaction.command.ts + .handler.ts
│   ├── update-transaction.command.ts + .handler.ts
│   └── delete-transaction.command.ts + .handler.ts
└── queries/
    ├── list-transactions.query.ts + .handler.ts
    └── get-transaction.query.ts + .handler.ts
```

## 3. DTO ✅

**CreateTransactionDto** (`class-validator`):

- `amount: number` — `@IsNumber({ maxDecimalPlaces: 2 })`, `@IsPositive()`
- `type: TransactionType` — `@IsEnum(TransactionType)` (импорт из `@repo/database`/Prisma client)
- `description?: string` — `@IsOptional() @IsString() @MaxLength(500)`
- `date: string` — `@IsDateString()`
- `categoryId?: string` — `@IsOptional() @IsString()`

**UpdateTransactionDto**: `extends PartialType(CreateTransactionDto)` (через `@nestjs/mapped-types`).

**ListTransactionsQueryDto**:

- `month?: number` — `@IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(12)`
- `year?: number` — `@IsOptional() @Type(() => Number) @IsInt() @Min(1970)`

Включить `ValidationPipe` с `transform: true` глобально, если ещё не включён — проверить `main.ts`.

## 4. Repository ✅

`TransactionsRepository` инжектит `PrismaService`. Методы:

- `create(userId, dto)` — `prisma.transaction.create({ data: { ...dto, date: new Date(dto.date), userId } })`
- `findAllByUser(userId, { month?, year? })` — строит фильтр по `date >= startOfMonth && date < startOfNextMonth` (если оба заданы) или по году (если только `year`); сортировка `date desc`.
- `findOneByUser(userId, id)` — `findFirst({ where: { id, userId } })`, кидает `NotFoundException`.
- `updateByUser(userId, id, dto)` — проверка через `findOneByUser`, затем `update`.
- `removeByUser(userId, id)` — проверка, `delete`.
- `aggregateByUser(userId, { month?, year? })` — два `aggregate({ _sum: { amount } })` (по `INCOME` и `EXPENSE`) с тем же фильтром; вернуть `{ totalIncome, totalExpense, balance }` (числа, не Decimal — конвертировать через `.toNumber()`).

## 5. Контроллер ✅

`TransactionsController` под `@UseGuards(JwtAuthGuard)`, путь `transactions`. Только `CommandBus`/`QueryBus` — никакой бизнес-логики.

- `POST /transactions` → `CreateTransactionCommand(userId, dto)`
- `GET /transactions?month=&year=` → `ListTransactionsQuery(userId, { month, year })` → `{ items, summary }`
- `GET /transactions/:id` → `GetTransactionQuery(userId, id)`
- `PATCH /transactions/:id` → `UpdateTransactionCommand(userId, id, dto)`
- `DELETE /transactions/:id` → `DeleteTransactionCommand(userId, id)`, `@HttpCode(204)`

`ListTransactionsHandler` параллельно вызывает `repo.findAllByUser` и `repo.aggregateByUser`, собирает ответ.

## 6. Регистрация модуля ✅

`apps/api/src/app.module.ts` — добавить `TransactionsModule` в `imports`.

## 7. Проверка ✅ (сборка пройдена; smoke-тест — вручную)

```bash
pnpm db:generate
pnpm --filter api build        # сборка API — обязательна по требованиям задачи
pnpm --filter api start:dev    # ручная проверка
```

Сценарий smoke-теста (после логина и получения JWT):

1. `POST /categories` — создать категорию.
2. `POST /transactions` с `type=EXPENSE`, `amount=100`, `date=2026-05-10`, `categoryId=...`.
3. `POST /transactions` с `type=INCOME`, `amount=500`, `date=2026-05-15`.
4. `GET /transactions?month=5&year=2026` → ожидаем `items.length === 2`, `summary.totalIncome === 500`, `summary.totalExpense === 100`, `balance === 400`.
5. `PATCH /transactions/:id` — изменить amount, убедиться что summary пересчитан.
6. `DELETE /transactions/:id` → 204; повторный GET того же id → 404.
7. Удалить категорию → у транзакции `categoryId` стал null (SetNull).

## Ограничения

- Никаких новых npm-зависимостей (`@nestjs/cqrs`, `class-validator`, `@nestjs/mapped-types` уже в проекте).
- DTO — только через `class-validator`.
- Финальный шаг — `pnpm --filter api build`.

## Ключевые файлы (создание/изменение)

- ✏️ `packages/database/prisma/schema.prisma` — enum + модель + обратные связи
- ➕ `apps/api/src/transactions/**` — весь модуль
- ✏️ `apps/api/src/app.module.ts` — регистрация модуля
- ➕ `packages/database/prisma/migrations/<timestamp>_add-transactions/` — авто-генерация
