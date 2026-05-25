---
name: commit
description: Create a git commit following the project's Conventional Commits conventions. Use when the user asks to commit changes, create a commit, or save work to git. Stages relevant files and writes a properly formatted commit message with type, scope, and description.
tools: Bash, Read
allowed-tools: Bash(git*), Read
model: claude-sonnet-4-6
effort: low
---

# commit

Создать git-коммит по стандарту Conventional Commits, принятому в этом проекте.

## Формат сообщения

```
<тип>(<scope>): <описание>

[необязательное тело]

[необязательный footer]
```

### Типы

| Тип | Когда использовать |
|-----|--------------------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `refactor` | Изменение кода без добавления фич и исправления багов |
| `perf` | Улучшение производительности |
| `test` | Добавление или обновление тестов |
| `docs` | Изменения в документации |
| `build` | Изменения системы сборки или зависимостей |
| `ci` | Изменения конфигурации CI/CD |
| `chore` | Прочие изменения (тулинг, конфиг и т.д.) |
| `revert` | Откат предыдущего коммита |

### Scopes (опционально)

Соответствуют приложению или пакету, который изменяется:

- `api` — NestJS бэкенд (`apps/api`)
- `web` — Next.js фронтенд (`apps/web`)
- `database` — Prisma-схема / миграции (`packages/database`)
- `shared-types` — Общие TypeScript-интерфейсы (`packages/shared-types`)

### Правила

- Subject line: повелительное наклонение, строчные буквы, без точки в конце, максимум 72 символа
- Breaking changes: добавить `!` после scope (например `feat(api)!:`) или `BREAKING CHANGE:` в footer
- Тело коммита: объяснять *почему*, а не *что*

### Примеры

```
feat(api): add transactions module with CQRS
fix(web): prevent token loss on page refresh
refactor(database): rename Expense model to Transaction
feat(api)!: remove legacy /expenses endpoints
docs: update API endpoints in CLAUDE.md
chore: update dependencies
```
## Контекст выполнения
Статус проекта: !git status
Последние коммиты: ``` !
git log --oneline -10
```

## Порядок работы
1. Запустить `git diff` — понять суть изменений.
2. Определить правильный `тип` и `scope` по таблицам выше.
3. Добавить нужные файлы в индекс (предпочитать конкретные имена файлов вместо `git add -A`).
4. Создать коммит через HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<тип>(<scope>): <описание>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

6. Проверить успех через `git status`.

## Правила безопасности

- Никогда не коммитить `.env`-файлы и файлы с секретами.
- Никогда не использовать `--no-verify` для обхода хуков.
- Никогда не амендить коммит без явной просьбы пользователя.
- Никогда не делать force-push без явной просьбы пользователя.
