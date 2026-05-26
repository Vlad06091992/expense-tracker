# План: Страницы авторизации (sign-in / sign-up) для web приложения

## Контекст

В `apps/api` уже есть рабочие эндпоинты авторизации (`POST /auth/register`, `POST /auth/login`), которые возвращают `AuthResponse = { accessToken, user }`. На фронте (`apps/web`) пока пусто — только корневая `page.tsx`, нет shadcn компонентов, нет хранения токена. Нужно построить страницы `/sign-in` и `/sign-up` с формами, валидацией, обращением к API и сохранением токена для дальнейшего использования.

## Подход

### ✅ 1. Установка зависимостей и shadcn компонентов

В `apps/web`:

- Добавлены `react-hook-form`, `@hookform/resolvers`, `sonner`.
- Установлены shadcn компоненты: `button`, `input`, `label`, `card`, `form`, `sonner` — в `apps/web/src/components/ui/`.

### ✅ 2. Слой работы с API

Создан `apps/web/src/lib/auth.ts`:

- Функции `signIn({ email, password })` и `signUp({ email, password, name })` — обёртки над `fetch`.
- Возвращают типизированный `AuthResponse` из `@repo/shared-types`.
- При не-2xx ответе бросают ошибку с сообщением от сервера.

Создан `apps/web/src/lib/token.ts`:

- Хелперы `getToken()`, `setToken(token)`, `clearToken()` поверх `localStorage` (ключ `access_token`).

### ✅ 3. Zod-схемы для форм

Создан `apps/web/src/lib/validations/auth.ts`:

- `signInSchema`: `email` (валидный email), `password` (min 6).
- `signUpSchema`: `email`, `password` (min 6), `name` (min 1).
- Типы `SignInValues`, `SignUpValues` через `z.infer`.

### ✅ 4. Layout-группа для auth

Создан `apps/web/src/app/(auth)/layout.tsx` — центрированный контейнер (flex, min-h-screen, bg-background).

### ✅ 5. Страница `/sign-in`

Создан `apps/web/src/app/(auth)/sign-in/page.tsx`:

- Client component, `<Card>` с заголовком "Sign in".
- `react-hook-form` + `zodResolver(signInSchema)`, поля email/password.
- Submit → `signIn()` → `setToken(res.accessToken)` → `router.push('/')`.
- При ошибке — `toast.error(...)`.
- Ссылка "Don't have an account? Sign up" → `/sign-up`.

### ✅ 6. Страница `/sign-up`

Создан `apps/web/src/app/(auth)/sign-up/page.tsx`:

- Три поля (name, email, password), schema `signUpSchema`.
- Submit → `signUp()` → `setToken(res.accessToken)` → `router.push('/')`.
- Ссылка "Already have an account? Sign in" → `/sign-in`.

### ✅ 7. Подключение Toaster

В `apps/web/src/app/layout.tsx` добавлен `<Toaster />` из `sonner`.

## Файлы, которые были созданы/изменены

Созданы:

- ✅ `apps/web/src/app/(auth)/layout.tsx`
- ✅ `apps/web/src/app/(auth)/sign-in/page.tsx`
- ✅ `apps/web/src/app/(auth)/sign-up/page.tsx`
- ✅ `apps/web/src/lib/auth.ts`
- ✅ `apps/web/src/lib/token.ts`
- ✅ `apps/web/src/lib/validations/auth.ts`
- ✅ `apps/web/src/components/ui/*` (button, input, label, card, form, sonner)

Изменены:

- ✅ `apps/web/src/app/layout.tsx` — добавлен `<Toaster />`.
- ✅ `apps/web/package.json` — новые зависимости.

## Что переиспользуем

- `API_URL` из `apps/web/src/lib/api.ts`.
- `cn()` из `apps/web/src/lib/utils.ts` (используется shadcn компонентами).
- Типы `AuthResponse`, `LoginInput`, `RegisterInput` из `@repo/shared-types`.
- Готовая Tailwind-тема с CSS-переменными (`bg-background`, `text-foreground`, и т.д.) в `globals.css`.

## Что НЕ входит в этот план (отдельные задачи)

- React Context / hook `useAuth` для глобального доступа к user.
- `middleware.ts` для редиректа неавторизованных на `/sign-in`.
- Logout, refresh token, "remember me".
- Автоматическая подстановка `Authorization` хедера в дальнейшие запросы к API.

## Верификация

1. `pnpm install` (после правки package.json).
2. `pnpm dev` — поднимутся web (3000) и api (3001).
3. Открыть `http://localhost:3000/sign-up`, зарегистрировать пользователя — должен произойти редирект на `/`, в localStorage появиться `access_token`.
4. Открыть `http://localhost:3000/sign-in`, залогиниться тем же email/password — снова редирект, токен обновлён.
5. Проверить ошибки: неверный пароль → toast с сообщением от API; дубликат email при регистрации → toast.
6. Проверить валидацию форм: пустой email, пароль короче 6 символов — ошибки под полями до отправки.
