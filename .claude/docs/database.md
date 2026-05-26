# База данных

**СУБД:** PostgreSQL 16  
**ORM:** Prisma 6  
**Схема:** `packages/database/prisma/schema.prisma`

---

## Модели

### `User` → таблица `users`

| Колонка        | Тип Prisma                 | Тип БД        | Назначение                                        |
| -------------- | -------------------------- | ------------- | ------------------------------------------------- |
| `id`           | `String @id`               | `text`        | CUID, например `clx7abc123`                       |
| `email`        | `String @unique`           | `text`        | Идентификатор для входа                           |
| `passwordHash` | `String`                   | `text`        | bcrypt-хэш; никогда не возвращается в API-ответах |
| `name`         | `String?`                  | `text`        | Отображаемое имя, может быть `null`               |
| `createdAt`    | `DateTime @default(now())` | `timestamptz` | Устанавливается при создании записи               |
| `updatedAt`    | `DateTime @updatedAt`      | `timestamptz` | Автоматически обновляется Prisma                  |

**Связи:** `categories[]`, `transactions[]`

---

### `Category` → таблица `categories`

| Колонка     | Тип Prisma                 | Тип БД        | Назначение                      |
| ----------- | -------------------------- | ------------- | ------------------------------- |
| `id`        | `String @id`               | `text`        | CUID                            |
| `name`      | `String`                   | `text`        | Отображаемое название           |
| `color`     | `String?`                  | `text`        | Hex-цвет, например `#FF5733`    |
| `icon`      | `String?`                  | `text`        | Эмодзи или идентификатор иконки |
| `userId`    | `String`                   | `text`        | FK → `users.id`                 |
| `createdAt` | `DateTime @default(now())` | `timestamptz` |                                 |
| `updatedAt` | `DateTime @updatedAt`      | `timestamptz` |                                 |

**Ограничения и индексы:**

- `@@unique([userId, name])` — названия категорий уникальны в рамках одного пользователя
- `@@index([userId])` — быстрый поиск категорий по владельцу

**При удалении:** `onDelete: Cascade` из `users` — удаление пользователя удаляет все его категории.

**Связи:** `transactions[]` — у категории может быть много транзакций.

---

### `Transaction` → таблица `transactions`

| Колонка       | Тип Prisma                   | Тип БД          | Назначение                                                                |
| ------------- | ---------------------------- | --------------- | ------------------------------------------------------------------------- |
| `id`          | `String @id`                 | `text`          | CUID                                                                      |
| `amount`      | `Decimal @db.Decimal(12, 2)` | `numeric(12,2)` | До 10 знаков перед запятой; в JSON сериализуется как **строка**           |
| `type`        | `TransactionType`            | `enum`          | `INCOME` или `EXPENSE`                                                    |
| `description` | `String?`                    | `text`          | Необязательная заметка; максимум 500 символов — ограничение на уровне DTO |
| `date`        | `DateTime`                   | `timestamptz`   | Дата транзакции, указанная пользователем (не равна `createdAt`)           |
| `userId`      | `String`                     | `text`          | FK → `users.id`                                                           |
| `categoryId`  | `String?`                    | `text`          | FK → `categories.id`, может быть `null`                                   |
| `createdAt`   | `DateTime @default(now())`   | `timestamptz`   | Время создания записи                                                     |
| `updatedAt`   | `DateTime @updatedAt`        | `timestamptz`   |                                                                           |

**Ограничения и индексы:**

- `@@index([userId, date])` — основной паттерн доступа: список транзакций пользователя, отфильтрованный и отсортированный по дате
- `@@index([categoryId])` — для агрегаций по категории

**При удалении:**

- `userId` → `onDelete: Cascade` — удаление пользователя удаляет все его транзакции
- `categoryId` → `onDelete: SetNull` — удаление категории сохраняет транзакцию, устанавливает `categoryId = null`

---

### Enum `TransactionType`

```prisma
enum TransactionType {
  INCOME
  EXPENSE
}
```

---

## Диаграмма связей

```
User 1──* Category
User 1──* Transaction
Category 0..1──* Transaction
```

---

## Миграции

Файлы миграций хранятся в `packages/database/prisma/migrations/`.

```bash
# Применить ожидающие миграции (разработка)
pnpm db:migrate

# Создать новую миграцию после изменения схемы
cd packages/database && pnpm prisma migrate dev --name <название-миграции>

# Применить миграции в CI / production (без подтверждений, без пересборки клиента)
pnpm db:migrate:deploy

# Открыть Prisma Studio
pnpm db:studio
```

После изменения схемы `migrate dev` автоматически пересоздаёт Prisma-клиент. В других окружениях запустите `pnpm prisma generate` явно.

---

## Изоляция данных

Каждый метод репозитория принимает `userId` первым параметром и включает его в каждый Prisma `where`. Это гарантирует, что пользователь никогда не сможет прочитать или изменить чужие данные, даже зная чужой ID.

Паттерн, применяемый во всех репозиториях:

```typescript
findOneByUser(userId: string, id: string) {
  return this.prisma.transaction.findFirst({ where: { id, userId } });
}
```
