---
name: tests
description: Написать unit-тесты для NestJS по указанному пути в проекте. Использовать когда пользователь просит написать, добавить или сгенерировать тесты. Принимает путь к файлу или директории относительно корня проекта. Примеры: /tests apps/api/src/categories/categories.repository.ts, /tests apps/api/src/auth/commands/register-user.handler.ts
tools: Read, Edit, Write, Bash
allowed-tools: Read, Edit, Write, Bash(find*), Bash(pnpm*), Bash(cat*)
model: claude-sonnet-4-6
effort: high
user_invocable: true
argument-hint: [path]
---

# tests

Написать unit-тесты для NestJS-кода по указанному пути.

## Аргументы

```
/tests <path>
```

- `path` — путь к файлу или директории относительно корня проекта (обязателен).

Примеры вызова:

```
/tests apps/api/src/categories/categories.repository.ts
/tests apps/api/src/auth/commands/register-user.handler.ts
/tests apps/api/src/transactions
```

Если аргумент не передан — сообщить об ошибке:

```
Ошибка: укажи путь к файлу или директории.
Использование: /tests <path>
Пример: /tests apps/api/src/categories/categories.repository.ts
```

## Порядок работы

1. **Валидация аргумента.** Если путь не передан — вывести ошибку и остановиться.

2. **Прочитать целевой файл(ы).** Если передана директория — найти все `*.ts`-файлы в ней (исключая уже существующие `.spec.ts` и `*.module.ts`, `*.dto.ts`, `*.command.ts`, `*.query.ts`, `*.entity.ts`, `index.ts`). Для каждого читать полное содержимое.

3. **Определить тип артефакта** для каждого файла:
   - **Repository** — класс с `@Injectable()`, инжектирует `PrismaService`, содержит методы работы с БД.
   - **CommandHandler / QueryHandler** — класс с `@CommandHandler()` / `@QueryHandler()`, реализует `ICommandHandler` / `IQueryHandler`.
   - **Controller** — класс с `@Controller()`, инжектирует `CommandBus` и/или `QueryBus`.
   - **Service** — класс с `@Injectable()`, бизнес-логика без прямого Prisma.
   - **Guard / Strategy** — классы безопасности.
   - **Util / Helper** — чистые функции без декораторов.

4. **Прочитать связанные файлы** для понимания зависимостей: DTO-классы, команды/запросы, репозитории, утилиты, которые используются в тестируемом файле.

5. **Написать тесты** в файл `<original-name>.spec.ts` рядом с исходным файлом. Следовать правилам ниже.

6. **Запустить тесты**, чтобы убедиться что они проходят:

   ```bash
   pnpm --filter api test -- --testPathPattern=<имя файла без расширения>
   ```

   Если тесты падают — исправить, затем запустить снова. Повторять до прохождения.

7. **Сообщить результат:** сколько тестов написано, путь к `.spec.ts`-файлу, краткая сводка по покрытым сценариям.

## Правила написания тестов

### Общие принципы

- Один `describe` на класс / функцию.
- Вложенный `describe` на каждый метод: `describe('methodName', () => { ... })`.
- Имена тестов в формате `it('should <ожидаемое поведение>')`.
- Тестировать публичный контракт, а не реализацию.
- Покрывать: happy path, граничные условия, ошибки (если метод их бросает).

### Моки зависимостей

Использовать `jest.fn()` / `jest.spyOn()`. Никогда не поднимать реальную БД или HTTP-сервер в unit-тестах.

**PrismaService** — мокать через объект с нужными методами:

```typescript
const prismaMock = {
  category: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
} as unknown as PrismaService;
```

**CommandBus / QueryBus** — мокать через `{ execute: jest.fn() }`:

```typescript
const commandBusMock = { execute: jest.fn() } as unknown as CommandBus;
const queryBusMock = { execute: jest.fn() } as unknown as QueryBus;
```

**JwtService** — мокать через `{ sign: jest.fn().mockReturnValue('token') }`.

**Репозитории** — мокать все публичные методы через `jest.fn()`.

### Создание тестируемого экземпляра

Предпочитать прямой `new`, передавая моки в конструктор. Использовать `Test.createTestingModule` только если нужна полная DI-цепочка (например, для контроллеров с Guards).

```typescript
// Прямое создание (для handlers, repositories, services)
let handler: CreateCategoryHandler;
let repoMock: jest.Mocked<CategoriesRepository>;

beforeEach(() => {
  repoMock = { create: jest.fn(), ... } as any;
  handler = new CreateCategoryHandler(repoMock);
});
```

### Паттерн по типу артефакта

**Repository:**

- Мокать `PrismaService`.
- Тестировать каждый метод: корректный вызов Prisma, возврат результата, броски исключений (`NotFoundException` при отсутствии записи).
- Проверять аргументы Prisma-вызовов через `expect(prisma.X.method).toHaveBeenCalledWith(...)`.

**CommandHandler / QueryHandler:**

- Мокать репозиторий / сервисы / bus-ы, от которых зависит хендлер.
- Тестировать метод `execute(command)`.
- Проверять что хендлер делегирует правильной зависимости с правильными аргументами.
- Тестировать условные ветки (например `ConflictException` при дублировании email).

**Controller:**

- Создавать через `Test.createTestingModule`, переопределять `CommandBus` и `QueryBus` моками.
- Применять `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })`.
- Тестировать HTTP-поведение через `supertest` или напрямую вызывая методы контроллера с фейковым `req`.
- Проверять что контроллер передаёт правильную команду/запрос в bus.

**Util / Helper (чистые функции):**

- Тестировать с реальными значениями, без моков.
- Покрывать все ветки и граничные случаи.

### Пример для Repository

```typescript
import { NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('CategoriesRepository', () => {
  let repo: CategoriesRepository;
  let prisma: { category: Record<string, jest.Mock> };

  beforeEach(() => {
    prisma = {
      category: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    repo = new CategoriesRepository(prisma as unknown as PrismaService);
  });

  describe('findAllByUser', () => {
    it('should return categories ordered by createdAt desc', async () => {
      const categories = [{ id: '1', name: 'Food', userId: 'u1' }];
      prisma.category.findMany.mockResolvedValue(categories);

      const result = await repo.findAllByUser('u1');

      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(categories);
    });
  });

  describe('findOneByUser', () => {
    it('should return category when found', async () => {
      const category = { id: '1', userId: 'u1' };
      prisma.category.findFirst.mockResolvedValue(category);

      const result = await repo.findOneByUser('u1', '1');

      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when category not found', async () => {
      prisma.category.findFirst.mockResolvedValue(null);

      await expect(repo.findOneByUser('u1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Пример для CommandHandler

```typescript
import { CreateCategoryHandler } from './create-category.handler';
import { CreateCategoryCommand } from './create-category.command';
import { CategoriesRepository } from '../categories.repository';

describe('CreateCategoryHandler', () => {
  let handler: CreateCategoryHandler;
  let repo: jest.Mocked<Pick<CategoriesRepository, 'create'>>;

  beforeEach(() => {
    repo = { create: jest.fn() };
    handler = new CreateCategoryHandler(repo as unknown as CategoriesRepository);
  });

  describe('execute', () => {
    it('should delegate to repository with correct args', async () => {
      const dto = { name: 'Food' };
      const command = new CreateCategoryCommand('user-1', dto);
      const created = { id: '1', ...dto, userId: 'user-1' };
      repo.create.mockResolvedValue(created as any);

      const result = await handler.execute(command);

      expect(repo.create).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(created);
    });
  });
});
```

## Что не делать

- Не писать тесты для `*.module.ts`, `*.dto.ts`, `*.command.ts`, `*.query.ts` — там нет бизнес-логики.
- Не мокать то, что можно использовать напрямую (примитивы, простые объекты).
- Не создавать реальных подключений к БД или HTTP-серверов.
- Не использовать `any` там, где можно вывести тип.
- Не писать тривиальные тесты типа `it('should be defined')` без реальной проверки поведения — только если это действительно важный smoke-тест.
