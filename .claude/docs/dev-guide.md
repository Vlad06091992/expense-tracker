# Руководство разработчика

---

## Добавление модуля на бэкенде (NestJS)

Эталонная реализация — модуль `transactions`.

### 1. Создать структуру модуля

```
apps/api/src/<module>/
├── <module>.module.ts
├── <module>.controller.ts
├── <module>.repository.ts
├── commands/
│   ├── create-<entity>.command.ts
│   ├── create-<entity>.handler.ts
│   ├── update-<entity>.command.ts
│   ├── update-<entity>.handler.ts
│   ├── delete-<entity>.command.ts
│   └── delete-<entity>.handler.ts
├── queries/
│   ├── list-<entity>.query.ts
│   ├── list-<entity>.handler.ts
│   ├── get-<entity>.query.ts
│   └── get-<entity>.handler.ts
└── dto/
    ├── create-<entity>.dto.ts
    └── update-<entity>.dto.ts
```

### 2. Репозиторий

Инжектировать `PrismaService` (глобальный — дополнительный импорт не нужен). Включать `userId` в каждый `where`.

```typescript
@Injectable()
export class WidgetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUser(userId: string) {
    return this.prisma.widget.findMany({ where: { userId } });
  }

  async findOneByUser(userId: string, id: string) {
    const widget = await this.prisma.widget.findFirst({ where: { id, userId } });
    if (!widget) throw new NotFoundException('Widget not found');
    return widget;
  }
}
```

### 3. Команды и запросы

```typescript
// commands/create-widget.command.ts
export class CreateWidgetCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateWidgetDto,
  ) {}
}

// commands/create-widget.handler.ts
@CommandHandler(CreateWidgetCommand)
export class CreateWidgetHandler implements ICommandHandler<CreateWidgetCommand> {
  constructor(private readonly repo: WidgetsRepository) {}

  execute({ userId, dto }: CreateWidgetCommand) {
    return this.repo.create(userId, dto);
  }
}
```

### 4. Контроллер

```typescript
@ApiTags('widgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('widgets')
export class WidgetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  list(@Req() req: Request) {
    return this.queryBus.execute(new ListWidgetsQuery(req.user.id));
  }

  @Post()
  create(@Req() req: Request, @Body() dto: CreateWidgetDto) {
    return this.commandBus.execute(new CreateWidgetCommand(req.user.id, dto));
  }
}
```

### 5. Модуль

Зарегистрировать все обработчики и репозиторий; импортировать `CqrsModule`:

```typescript
@Module({
  imports: [CqrsModule],
  controllers: [WidgetsController],
  providers: [
    WidgetsRepository,
    CreateWidgetHandler,
    UpdateWidgetHandler,
    DeleteWidgetHandler,
    ListWidgetsHandler,
    GetWidgetHandler,
  ],
})
export class WidgetsModule {}
```

### 6. Зарегистрировать в AppModule

```typescript
// apps/api/src/app.module.ts
imports: [
  ...,
  WidgetsModule,
],
```

### 7. Добавить типы в `@repo/shared-types`

Добавить `WidgetDto`, `CreateWidgetInput` и т.д. в `packages/shared-types/src/` и реэкспортировать из индекса пакета.

---

## Добавление фичи на фронтенде (FSD)

### Выбор слоя

| Что строим                                            | Слой       |
| ----------------------------------------------------- | ---------- |
| Компоновка целой страницы                             | `views`    |
| Переиспользуемый UI-блок (шапка, сайдбар)             | `widgets`  |
| Пользовательское взаимодействие с побочными эффектами | `features` |
| Доменные данные и read-only UI                        | `entities` |
| Утилиты, конфиг, UI-примитивы                         | `shared`   |

### Слайс сущности (read-only данные)

```
src/entities/<entity>/
├── api/<entity>.api.ts       # Обёртки apiFetch
├── model/
│   └── queries.ts            # Ключи React Query + хуки useXxx
├── ui/
│   └── <entity>-item.tsx     # Компонент отображения (без мутаций)
└── index.ts                  # Barrel-экспорт
```

Паттерн `queries.ts`:

```typescript
export const widgetKeys = {
  all: ['widgets'] as const,
  list: () => ['widgets', 'list'] as const,
  detail: (id: string) => ['widgets', id] as const,
};

export function useWidgets() {
  return useQuery({ queryKey: widgetKeys.list(), queryFn: listWidgets });
}
```

### Слайс фичи (мутации)

```
src/features/<feature>/
├── api/...                   # Опционально — можно переиспользовать api сущности
├── model/
│   ├── mutations.ts          # useMutation-хуки
│   └── schema.ts             # Zod-схема формы
├── ui/
│   └── <feature>-dialog.tsx  # Форма + диалог
└── index.ts
```

Паттерн `mutations.ts`:

```typescript
export function useCreateWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWidget,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: widgetKeys.all }),
  });
}
```

### Правило импортов

Импортировать только из `index.ts` barrel-файла слайса, никогда из внутренних путей:

```typescript
// ✅ Правильно
import { useWidgets } from '@/entities/widget';

// ❌ Неправильно
import { useWidgets } from '@/entities/widget/model/queries';
```

---

## Добавление миграции базы данных

1. Изменить `packages/database/prisma/schema.prisma`
2. Выполнить:
   ```bash
   cd packages/database
   pnpm prisma migrate dev --name <краткое-описание>
   ```
   Команда создаст новый файл миграции и пересоздаст Prisma-клиент.
3. Закоммитить файл миграции и обновлённый `schema.prisma` вместе.

**Нейминг:** snake_case, описывает суть изменения — например `add_budget_model`, `add_category_color`.

**В CI / staging:**

```bash
pnpm db:migrate:deploy   # запускает prisma migrate deploy — без подтверждений
```

---

## Добавление нового эндпоинта

1. **DTO** — добавить/обновить файл в `<module>/dto/`, добавить валидацию декораторами `class-validator`.
2. **Command или Query** — добавить класс-команду/запрос и класс-обработчик.
3. **Repository** — добавить Prisma-вызов; `userId` обязательно включить в `where`.
4. **Controller** — добавить метод роута, подключить через `commandBus`/`queryBus`.
5. **Shared types** — добавить/обновить интерфейс `Input`/`Dto` в `@repo/shared-types`.
6. **API-клиент фронтенда** — добавить вызов `apiFetch` в `api/`-файл соответствующей сущности.
7. **React Query** — добавить ключ + хук в `model/queries.ts` или мутацию в `model/mutations.ts`.

---

## Чеклист для новой задачи

- [ ] Все методы репозитория принимают `userId` и ограничивают запросы им
- [ ] DTO используют декораторы `class-validator`; контроллер принимает тело через `@Body()` (ValidationPipe глобальный)
- [ ] Нет прямых Prisma-вызовов в контроллерах и обработчиках — только через репозиторий
- [ ] Новые типы добавлены в `@repo/shared-types` (не дублируются в api или web)
- [ ] Импорты на фронтенде соблюдают порядок слоёв FSD (нет импортов вверх)
- [ ] Хуки мутаций вызывают `queryClient.invalidateQueries` при успехе
- [ ] Миграция закоммичена вместе с изменением схемы
