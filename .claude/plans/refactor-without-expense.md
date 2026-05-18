# Plan: Refactor — Remove Expense, full Categories CRUD

## Context

Упрощаем приложение: убираем сущность Expense целиком. Остаются только User и Category. Создаём полноценный categories контроллер (CRUD) с JWT-защитой и валидацией через class-validator. Старый expenses модуль удаляется.

Category:
- `id`, `name`, `color?`, `icon?`, `userId`, `createdAt`, `updatedAt`

---

## Steps

### ✅ 1. Update Prisma Schema (`packages/database/prisma/schema.prisma`)

- Удалить модель `Expense` полностью.
- Удалить поле `expenses Expense[]` из `User`.
- Удалить поле `expenses Expense[]` из `Category`.
- `Category` остаётся без изменений (name, color, icon, userId уже есть).
- Запустить `pnpm db:migrate` + `pnpm db:generate`.

### ✅ 2. Update Shared Types (`packages/shared-types/src/`)

- Удалить `expense.ts`.
- Обновить `index.ts` — убрать экспорт expense-типов.
- `category.ts` остаётся как есть (`CategoryDto`, `CreateCategoryInput`, `UpdateCategoryInput`).

### ✅ 3. Delete Expenses Module

Удалить директорию `apps/api/src/expenses/` целиком.

### ✅ 4. Create Categories Module (`apps/api/src/categories/`)

CQRS-структура:

```
categories/
  categories.module.ts
  categories.controller.ts
  categories.repository.ts
  dto/
    create-category.dto.ts    # name (IsString, required), color? (IsHexColor), icon? (IsString)
    update-category.dto.ts    # PartialType(CreateCategoryDto)
  commands/
    create-category.command.ts + handler
    update-category.command.ts + handler
    delete-category.command.ts + handler
  queries/
    list-categories.query.ts + handler
    get-category.query.ts + handler
```

Маршруты (все под `@UseGuards(JwtAuthGuard)`):
- `POST /categories` → создать
- `GET /categories` → список всех для текущего пользователя
- `PATCH /categories/:id` → обновить (проверка владельца)
- `DELETE /categories/:id` → удалить (проверка владельца)

### ✅ 5. Register in `app.module.ts`

- Убрать `ExpensesModule`.
- Добавить `CategoriesModule`.

### ⬜ 6. Run migrations

- `pnpm db:migrate`
- `pnpm db:generate`

### ⬜ 7. Postman Collection (`postman_collection.json` в корне репо)

Collection v2.1 с переменными `{{baseUrl}}` = `http://localhost:3001` и `{{token}}`.

Запросы:
- `POST /auth/register`
- `POST /auth/login` — тест-скрипт сохраняет `accessToken` в `{{token}}`
- `POST /categories`
- `GET /categories`
- `PATCH /categories/:id`
- `DELETE /categories/:id`

---

## Critical Files

| File | Status |
|---|---|
| `packages/database/prisma/schema.prisma` | ✅ done |
| `packages/shared-types/src/expense.ts` | ✅ deleted |
| `packages/shared-types/src/index.ts` | ✅ done |
| `apps/api/src/expenses/` | ✅ deleted |
| `apps/api/src/categories/` | ✅ created |
| `apps/api/src/app.module.ts` | ✅ done |
| `postman_collection.json` | ⬜ todo |
