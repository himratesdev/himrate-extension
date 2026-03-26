# HimRate Extension — System Context

> Этот файл читается агентами: **Dev Agent** (полностью), **Review Agent** (конвенции + безопасность), **Architect Agent** (принципы + структура).

---

## Продукт

Chrome Extension (MV3) для анализа аудитории Twitch-стримеров. Popup с 7 состояниями, Side Panel с 8 табами. Общается с himrate-platform через REST API `/api/v1/*` (JWT Bearer auth).

**Стек:** React 19 + TypeScript 5 + Vite + react-i18next
**Target:** Chrome 114+ (Side Panel API)
**Repo:** himratesdev/himrate-extension

---

## Архитектурные принципы

1. **Компонентная архитектура.** Каждый экран = React компонент. Shared компоненты в `src/shared/components/`.
2. **Все тексты через i18n.** Ноль hardcoded строк. Каждый видимый текст = ключ в `src/locales/{ru,en}.json`.
3. **Stub API → Real API.** `src/shared/api.ts` определяет TypeScript интерфейсы. Phase 2 заменит stubs на реальные fetch вызовы.
4. **Состояния явные.** Popup имеет enum состояний. Каждое состояние = отдельный render path.
5. **chrome.storage для persistence.** Язык, dismiss баннера — через chrome.storage.local с fallback на in-memory.
6. **Нет бизнес-логики в Extension.** Extension = UI клиент. Вся логика (Trust Index, ERV, Bot Detection) — на сервере.

---

## Структура репозитория

```
src/
  popup/              — Popup (7 состояний)
  sidepanel/          — Side Panel (8 табов)
    components/       — TabBar, tabs
  background/         — Service Worker
  content/            — Content Script (twitch.tv)
  shared/             — API client, i18n, shared components
  locales/            — ru.json, en.json
public/
  manifest.json       — MV3 manifest
  icons/              — PNG icons (16, 48, 128)
dist/                 — Build output (gitignored)
```

---

## Конвенции кода

| Параметр | Правило |
|---|---|
| Линтер | ESLint (flat config `eslint.config.js`) + `tsc --noEmit` |
| Тесты | Vitest + jsdom + @testing-library/react. `npm run test`. Тесты: i18n ключи, manifest, API stubs. Плюс ручная проверка в Chrome |
| Коммиты | Conventional Commits: `feat(TASK-009): описание` |
| Ветки | `feature/TASK-{id}-{slug}` от main |
| Merge | Squash merge, ветки сохраняются |
| Именование файлов | PascalCase для компонентов (.tsx), camelCase для утилит (.ts) |
| Именование компонентов | PascalCase: `PopupAvatar`, `TabBar`, `LangSwitcher` |
| Стили | Inline styles (scaffold). Phase 2: Tailwind CSS |
| i18n ключи | dot.notation: `popup.cta_guest`, `label.real_viewers`, `erv_label.green` |

---

## Безопасность

| Аспект | Правило |
|---|---|
| API auth | JWT Bearer token в memory (не в storage). Refresh через httpOnly cookie |
| Permissions | Минимальные: sidePanel, activeTab, storage |
| Content Script | Только twitch.tv (matches filter) |
| CORS | Extension ID whitelisted на сервере |
| Secrets | Нет секретов в Extension коде. API URL из ENV (Phase 2) |

---

## ERV Labels (юридически безопасные, v3)

| ERV % | RU | EN | Цвет |
|---|---|---|---|
| 80-100% | Аномалий не замечено | No anomalies detected | Green |
| 50-79% | Аномалия онлайна | Audience anomaly detected | Yellow |
| < 50% | Значительная аномалия онлайна | Significant audience anomaly | Red |

Нет слов "боты", "накрутка", "фейк" ни на одном языке.

---

## Правила разработки

1. Работать только по задаче из Notion. Не добавлять ничего сверх SRS.
2. `npm run typecheck` + `npm run lint` + `npm run build` — все зелёные до PR.
3. Каждый текст = i18n ключ из SRS §10A. grep для кириллицы вне locale файлов = 0.
4. manifest_version = 3. Не менять permissions без ADR.
5. Bundle size < 500KB. Проверяется в CI.
