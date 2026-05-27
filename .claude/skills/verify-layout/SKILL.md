---
name: verify-layout
description: Проверяет вёрстку фронтенд-страниц на десктоп и мобайл через Playwright MCP. Делает скриншоты и проверяет горизонтальный overflow, сломанные элементы, наложения. Аргумент — URL страницы (например http://localhost:3000/sign-in), или пустой — для проверки всех страниц.
tools: Read, mcp__playwright__browser_navigate, mcp__playwright__browser_resize, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__playwright__browser_evaluate, mcp__playwright__browser_fill_form, mcp__playwright__browser_click, mcp__playwright__browser_wait_for, mcp__playwright__browser_close, mcp__playwright__browser_press_key
allowed-tools: Read, mcp__playwright__browser_navigate, mcp__playwright__browser_resize, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__playwright__browser_evaluate, mcp__playwright__browser_fill_form, mcp__playwright__browser_click, mcp__playwright__browser_wait_for, mcp__playwright__browser_close, mcp__playwright__browser_press_key
model: claude-sonnet-4-6
effort: medium
user_invocable: true
argument-hint: [url]
---

# verify-layout

Проверить вёрстку фронтенд-страниц на десктопе и мобайле с помощью Playwright MCP.

## Аргументы

```
/verify-layout [url]
```

- `url` — полный URL конкретной страницы (необязательный).
  - Пример: `http://localhost:3000/sign-in`
  - Если не передан — проверяются все страницы приложения.

## Viewports

| Устройство | Ширина | Высота |
|------------|--------|--------|
| Desktop    | 1280   | 800    |
| Mobile     | 375    | 812    |

## Страницы приложения (для проверки всех)

Публичные (не требуют авторизации):
- `http://localhost:3000/sign-in`
- `http://localhost:3000/sign-up`

Защищённые (требуют авторизации):
- `http://localhost:3000/` — дашборд
- `http://localhost:3000/transactions`
- `http://localhost:3000/categories`

## Порядок работы

### 1. Определить список страниц

Если передан `url` — список из одного элемента. Если аргумент пустой — использовать полный список выше.

### 2. Авторизация (только для защищённых страниц)

Если в списке есть защищённые страницы:

1. Перейти на `http://localhost:3000/sign-in`.
2. Заполнить форму тестовыми данными:
   - email: `rebbecca_mearing915@mail.com`
   - password: `test123`
3. Нажать кнопку входа.
4. Дождаться редиректа на `/` (таймаут 5 сек).
5. Если вход не удался — сообщить пользователю и пропустить защищённые страницы, отметив их как `⚠️ пропущено (нет авторизации)`.

### 3. Проверка каждой страницы

Для каждой страницы из списка:

#### Desktop (1280×800)

1. Установить viewport: `width: 1280, height: 800`.
2. Перейти на страницу, дождаться загрузки (`waitUntil: networkidle` или 3 сек).
3. Сделать скриншот, сохранить в `screenshots/<slug>-desktop.png` (slug — путь страницы с `/` заменёнными на `-`, например `/sign-in` → `sign-in-desktop.png`, `/` → `home-desktop.png`).
4. Запустить JS-аудит (см. раздел «JS-аудит» ниже).

#### Mobile (375×812)

1. Установить viewport: `width: 375, height: 812`.
2. Перейти на страницу заново для корректного рендера адаптивных стилей.
3. Сделать скриншот, сохранить в `screenshots/<slug>-mobile.png`.
4. Запустить JS-аудит.

### 4. JS-аудит

Выполнить `browser_evaluate` со следующим скриптом для выявления проблем вёрстки:

```javascript
(() => {
  const issues = [];
  const docWidth = document.documentElement.scrollWidth;
  const viewWidth = document.documentElement.clientWidth;

  // Горизонтальный overflow
  if (docWidth > viewWidth) {
    issues.push(`Горизонтальный overflow: страница шире viewport на ${docWidth - viewWidth}px`);
  }

  // Элементы, выходящие за правый край
  const allElements = document.querySelectorAll('*');
  const overflowingEls = [];
  allElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.right > viewWidth + 1) {
      const tag = el.tagName.toLowerCase();
      const cls = el.className && typeof el.className === 'string'
        ? el.className.split(' ').slice(0, 3).join('.') : '';
      overflowingEls.push(`<${tag}${cls ? '.' + cls : ''}> right=${Math.round(rect.right)}`);
    }
  });
  if (overflowingEls.length > 0) {
    issues.push('Элементы за правым краем: ' + [...new Set(overflowingEls)].slice(0, 5).join(', '));
  }

  // z-index наложения (видимые элементы поверх кнопок/ссылок)
  const interactives = document.querySelectorAll('button, a, input, select, textarea');
  const covered = [];
  interactives.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (cx < 0 || cy < 0 || cx > viewWidth || cy > window.innerHeight) return;
    const top = document.elementFromPoint(cx, cy);
    if (top && top !== el && !el.contains(top) && !top.contains(el)) {
      const tag = el.tagName.toLowerCase();
      covered.push(`<${tag}> перекрыт <${top.tagName.toLowerCase()}>`);
    }
  });
  if (covered.length > 0) {
    issues.push('Перекрытые интерактивные элементы: ' + [...new Set(covered)].slice(0, 5).join(', '));
  }

  // Изображения с нулевыми размерами
  const brokenImgs = [];
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete || img.naturalWidth === 0) {
      brokenImgs.push(img.src || img.getAttribute('src') || '<без src>');
    }
  });
  if (brokenImgs.length > 0) {
    issues.push('Сломанные изображения: ' + brokenImgs.slice(0, 3).join(', '));
  }

  return issues.length === 0 ? ['OK'] : issues;
})()
```

### 5. Вывод результата

После проверки всех страниц вывести сводную таблицу:

```
## Результаты проверки вёрстки

| Страница        | Desktop | Mobile | Проблемы                          |
|-----------------|---------|--------|-----------------------------------|
| /sign-in        | ✅       | ✅      | —                                 |
| /sign-up        | ✅       | ⚠️      | Горизонтальный overflow: +12px    |
| /               | ✅       | ✅      | —                                 |
| /transactions   | ⚠️       | ⚠️      | Перекрытые кнопки, overflow +5px  |
| /categories     | ✅       | ✅      | —                                 |
```

Легенда:
- ✅ — проблем не обнаружено
- ⚠️ — найдены проблемы (описаны в колонке «Проблемы»)
- ❌ — страница недоступна или упала с ошибкой
- `⚠️ пропущено` — защищённая страница, авторизация не удалась

Если были найдены проблемы — перечислить их подробно после таблицы, с указанием страницы, viewport и описания.

### 6. Закрыть браузер

Вызвать `browser_close` после завершения всех проверок.

## Обработка ошибок

- Если страница не загружается (timeout, 404, 500) — отметить как ❌, продолжить с остальными.
- Если Playwright MCP недоступен — сообщить пользователю, что для работы скилла нужен запущенный MCP-сервер playwright.
- Если фронтенд не запущен — сообщить: «Запусти фронтенд: `pnpm --filter web dev`».

## Что не делать

- Не заполнять и не отправлять реальные формы (кроме sign-in для авторизации).
- Не изменять данные в приложении.
- Не делать снимки экрана с паролями в открытом виде в итоговом отчёте.
