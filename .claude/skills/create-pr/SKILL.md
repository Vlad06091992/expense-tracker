---
name: create-pr
description: "Создать GitHub Pull Request по соглашениям проекта. Использовать когда пользователь просит создать PR или открыть pull request. Требует два аргумента: имя ветки и заголовок PR. Примеры: /create-pr feat/auth \"feat(api): add auth module\", /create-pr fix/token-refresh \"fix(web): prevent token loss on refresh\""
tools: Bash, Read
allowed-tools: Bash(git*), Bash(gh*)
model: claude-sonnet-4-6
effort: medium
user_invocable: true
---

# create-pr

Создать GitHub Pull Request согласно соглашениям проекта.

## Аргументы

Скилл требует два обязательных аргумента:

```
/create-pr <branch-name> <pr-title>
```

- `branch-name` — имя ветки для PR (обязателен)
- `pr-title` — заголовок PR в формате Conventional Commits (обязателен)

Пример вызова:
```
/create-pr feat/payment-module "feat(api): add payment module"
```

Если один из аргументов не передан — сообщить об ошибке и остановиться, указав правильный формат вызова.

## Порядок работы

1. Проверить наличие обоих аргументов. Если хотя бы один отсутствует — вывести ошибку:
   ```
   Ошибка: скилл требует два аргумента.
   Использование: /create-pr <branch-name> <pr-title>
   Пример: /create-pr feat/payment-module "feat(api): add payment module"
   ```
   И остановиться.

2. Убедиться, что `branch-name` не `main` / `master`. Если это так — сообщить об ошибке и остановиться.

3. Получить список коммитов ветки относительно `master`:
   ```bash
   git log origin/master..HEAD --oneline --no-merges
   ```

4. Получить полный diff относительно `master`:
   ```bash
   git diff origin/master...HEAD --stat
   ```

5. Заголовок PR — использовать переданный `pr-title` без изменений.

6. Проверить, запушена ли ветка в remote:
   ```bash
   git status -sb
   ```
   Если ветка не запушена — запушить:
   ```bash
   git push -u origin <branch>
   ```

7. Составить тело PR по шаблону (см. раздел «Шаблон»).

8. Создать PR:
   ```bash
   gh pr create \
     --base master \
     --title "<заголовок>" \
     --body "$(cat <<'EOF'
   <тело PR>
   EOF
   )"
   ```

9. Вывести URL созданного PR.

## Шаблон тела PR

```markdown
## Что сделано
- [маркированный список: что реализовано и зачем]

## Изменения API
- [новые/изменённые endpoints с методом и путём, если есть; иначе — "Нет изменений API"]

## План проверки
- [ ] [сценарий 1]
- [ ] [сценарий 2]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Разделы заполняются на основе анализа коммитов и diff. «Изменения API» включать только при наличии изменений в `apps/api`.

## Правила

- Базовая ветка всегда `master`.
- Заголовок PR — по Conventional Commits, не более 72 символов.
- Никогда не создавать PR из `master` в `master`.
- Никогда не использовать `--force` при push без явной просьбы пользователя.
- Если `gh` недоступен или пользователь не авторизован — сообщить об ошибке и вывести готовую команду для ручного запуска.
