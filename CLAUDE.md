# HimRate Extension — System Context

> Этот файл читается агентами: **Dev Agent** (полностью), **Review Agent** (конвенции + безопасность), **Architect Agent** (принципы + структура).
>
> **Source of truth для frontend literal-port discipline = `verivio clode/CLAUDE.md` §FRONTEND.** Этот файл — quick reference + extension-specific (paths, npm scripts, manifest). При конфликте global выигрывает.

---

## Продукт

Chrome Extension (MV3) для анализа аудитории Twitch-стримеров. Popup с 7 состояниями, Side Panel с 8 табами. Общается с himrate-platform через REST API `/api/v1/*` (JWT Bearer auth).

**Стек:** React 19 + TypeScript 5 + Vite + react-i18next
**Target:** Chrome 114+ (Side Panel API)
**Repo:** himratesdev/himrate-extension

---

## Архитектурные принципы

1. **Wireframe HTML = production source.** Side Panel компоненты (`Frame*.tsx`) — JSX 1:1 literal port из `wireframes/frames/NN_*.html` (canonical per-frame). Master SoT — `wireframes/full/side-panel-wireframe-TASK-039.html` (panel-wide context). При divergence slim vs full: full выигрывает. См. §Frontend Literal-Port Discipline.
2. **Компонентная архитектура.** Каждый экран = React компонент. Shared компоненты в `src/shared/components/`.
3. **Все тексты через i18n.** Ноль hardcoded строк. Каждый видимый текст = ключ в `src/locales/{ru,en}.json`. Значение i18n = wireframe text вербатим.
4. **Stub API → Real API.** `src/shared/api.ts` определяет TypeScript интерфейсы. Реальные fetch вызовы поверх — без изменения структуры компонента.
5. **Состояния явные.** Popup имеет enum состояний. Каждое состояние = отдельный render path.
6. **chrome.storage для persistence.** Язык, dismiss баннера — через `chrome.storage.local` с fallback на in-memory.
7. **Нет бизнес-логики в Extension.** Extension = UI клиент. Вся логика (Trust Index, ERV, Bot Detection) — на сервере.

---

## Структура репозитория

```
src/
  popup/                      — Popup (7 состояний)
    components/               — Popup-specific компоненты
    hooks/                    — Popup-specific React hooks
  sidepanel/                  — Side Panel (8 табов)
    components/
      Frame{NN}{Name}.tsx     — Literal-port компоненты из wireframes/frames/NN_*.html
                                (e.g. Frame11LiveFreeGreen.tsx — без underscore)
      tabs/                   — Tab-level wrappers (TrendsTab.tsx, WatchlistsTab.tsx, etc.)
    hooks/                    — Side-panel-specific React hooks
    styles/
      canonical.css           — Извлечён из wireframe HTML lines 11-1275 (sp-* classes)
    main.tsx                  — Entry point + i18n bootstrap
    SidePanel.tsx             — Top-level state machine
  background/                 — Service Worker (bg.ts)
  content/                    — Content Script (twitch.tv only)
  shared/
    api.ts                    — REST client + TypeScript types
    i18n.ts                   — react-i18next config
    components/               — Cross-context shared
  locales/
    ru.json                   — Russian translations
    en.json                   — English translations
  test/                       — Vitest specs (i18n keys, manifest, API stubs)
public/
  manifest.json               — MV3 manifest
  icons/                      — PNG icons (16, 48, 128)
e2e/
  visual-qa/                  — Visual QA harness (Mode B)
    per-tab-deep.ts           — Per-tab deep scroll screenshots
    harness.ts                — Test harness setup
    wireframe-manifest.json   — SHA256 hashes wireframes + Frame*.tsx (drift guard)
wireframes/                   — Mirrored from verivio-clode SoT (committed, ~2.3MB)
  full/
    side-panel-wireframe-TASK-039.html — Master canonical wireframe (7297 lines)
  frames/                     — Extracted per-frame canonical (62 files, NN_*.html)
                                — Primary reference для tooling (i18n drift, manifest)
  slim/                       — Quick-reference views (59 files + _INDEX.md)
                                — Secondary; используется для visual QA side-by-side
  frame-port-progress.md      — Per-frame port status tracker
docs/
  global-claude-md-mirror.md  — Mirrored §FRONTEND из verivio-clode/CLAUDE.md
                                (CI cross-repo drift guard)
scripts/
  wireframe-manifest-update.ts — Recompute SHA256 hashes
spec/
  i18n-drift.test.ts          — Vitest test wireframe text vs i18n value verbatim
dist/                         — Build output (gitignored)
```

---

## Конвенции кода

| Параметр | Правило |
|---|---|
| Линтер | ESLint (flat config `eslint.config.js`) + `npx tsc --noEmit` |
| Тесты | Vitest + jsdom + @testing-library/react. `npm test` |
| Коммиты | Conventional Commits: `feat(TASK-{id}): описание` / `fix(BUG-{id}): описание` / `docs(TASK-{id}): описание` |
| Ветки | `feature/TASK-{id}-{slug}` / `bugfix/BUG-{id}-{slug}` / `hotfix/{slug}` от `main` |
| Merge | Squash merge → чистая история в `main` |
| Именование файлов | `PascalCase.tsx` для компонентов, `camelCase.ts` для утилит |
| Именование компонентов | `Frame{NN}{Name}` для literal ports без underscore (e.g. `Frame14LivePremiumGreen.tsx`); `PascalCase` для остальных |
| Стили | Canonical `sp-*` classes из `src/sidepanel/styles/canonical.css`. Inline styles только если canonical class не покрывает (e.g. динамический fontSize). **Нет Tailwind, нет CSS modules** |
| i18n ключи | dot.notation: `sp.trust_rating`, `popup.cta_guest`, `erv_label.green` |
| Frame port tracking | `wireframes/frame-port-progress.md` — обновляется после каждого frame commit |

---

## Frontend Literal-Port Discipline

> Полная спецификация в `verivio clode/CLAUDE.md` §FRONTEND (mirrored в `docs/global-claude-md-mirror.md`). Здесь — extension-specific quick reference.

### Wireframe directory hierarchy

`wireframes/` = mirror канонических HTML из verivio-clode (committed, build-for-years per ADR-OQ-6).

| Folder | Files | Назначение |
|---|---|---|
| `wireframes/full/` | 1 (`side-panel-wireframe-TASK-039.html`, 7297 lines) | **Master SoT.** Single-file panel-wide. При conflict с frames/slim — full выигрывает (per memory `feedback_full_wireframe_is_source`) |
| `wireframes/frames/` | 62 (`NN_*.html`) | **Canonical per-frame extracts** из full. Primary reference для tooling (i18n drift, SHA256 manifest, frame port) |
| `wireframes/slim/` | 59 (`NN_*.html`) + `_INDEX.md` | Secondary quick-reference. Используется для visual QA side-by-side audits |

**Изменение wireframe text** — обновляется master `full/`, затем `frames/` и `slim/` regenerate из full. Прямая правка `frames/` или `slim/` без изменения `full/` запрещена (silent divergence).

**Wireframe HTML файлы = PRODUCTION HTML, не design mockup. React компонент = JSX 1:1 копия wireframe DOM.**

### Workflow (per frame port)

1. Открыть `wireframes/frames/NN_*.html` (canonical extract). Cross-check с `wireframes/full/side-panel-wireframe-TASK-039.html` для panel-wide context.
2. Создать НОВЫЙ файл `src/sidepanel/components/Frame{NN}{Name}.tsx` (без underscore, e.g. `Frame11LiveFreeGreen.tsx`).
3. Скопировать body content wireframe в JSX **вербатим**.
4. Применить **только обязательные** JSX syntax conversions:
   - `class=` → `className=`
   - `stroke-width` / `font-size` / `text-anchor` → `strokeWidth` / `fontSize` / `textAnchor` (kebab-case → camelCase для HTML/SVG attrs)
   - `<input ...>` → `<input ... />` (self-close tags)
   - `style="font-size:15px;color:red;"` → `style={{ fontSize: '15px', color: 'red' }}` (object syntax)
5. User-facing тексты через `t('key')` — hardcode строк ЗАПРЕЩЁН.
6. **i18n value = wireframe text вербатим** (если wireframe `"Рейтинг доверия"`, то `t('sp.trust_rating')` возвращает `"Рейтинг доверия"`).
7. Real data wiring через JSX expressions поверх wireframe defaults (не replace structure):
   ```jsx
   {/* wireframe: <span class="sp-ti-score green">85</span> */}
   <span className={`sp-ti-score ${color}`}>{score ?? '—'}</span>
   ```
8. Обновить `wireframes/frame-port-progress.md` после commit.

### Запрещённые паттерны

- ❌ Surgical patches existing компонента вместо нового `FrameNN`
- ❌ `{items.map(...)}` над config array вместо JSX repetition wireframe rows
- ❌ Computed coordinates (`xScale(i)`, `yScale(v)`) для chart SVG — coords вербатим из wireframe
- ❌ Smart abstractions (HOC, generation hooks, helper components внутри)
- ❌ Unification empty-state / data-state branches — структура единая, real data только overrides values
- ❌ Hardcoded строки в JSX (RU/EN) — всё через i18n
- ❌ Свободная интерпретация DOM (extra wrappers, изменённый order, другие classes)
- ❌ "Improvements" wireframe (role/aria/accessibility если wireframe их не имеет — отдельная задача)

### Разрешено

- ✅ React state (`useState`, `useEffect`) для interactivity
- ✅ Event handlers (`onClick`, `onChange`) на existing buttons/inputs
- ✅ Conditional rendering BLOCK-LEVEL (`{condition && <FrameNN />}`)
- ✅ JSX expressions для substitution real data в text/attributes (структуру не трогать)
- ✅ React.Fragment для top-level multi-child returns

---

## Pre-Push Checklist

> Перед каждым `git push` в feature branch — пройти ВСЕ пункты. Заводился чтобы закрыть incidents BUG-016 PR-1 CR feedback:
> - **M-1** (commit `5e14b95`): i18n single-brace `{N}` вместо double-brace `{{N}}` — sweep по всему side panel
> - **M-2** (commit `1de7b0d`): inline styles вместо canonical `sp-*` classes — миграция на canonical.css
> - **M-3** (TASK-089): отсутствие frontend conventions doc → этот файл

```
[ ] npx tsc --noEmit          → 0 errors
[ ] npm run lint              → 0 errors
[ ] npm run build             → green (sidepanel.css/js bundle sizes sane)
[ ] npm test                  → all pass
[ ] Manual reload extension в Chrome
[ ] Click-test КАЖДОГО button/link/expand chevron в touched frames
    (per §Visual QA Workflow inline discipline)
[ ] frame-port-progress.md обновлён (если literal port)
[ ] i18n keys: ru.json и en.json sync (одинаковый набор keys)
[ ] grep кириллицы вне locales: 0 matches
    rg '[А-Яа-яЁё]' src/ --glob '!*/locales/*' → empty
```

**Запрещено push без всех зелёных.** Если что-то fail — фикс inline в той же ветке, не «потом».

---

## Visual QA Workflow (Mode B)

> Mode B = automated visual QA через `e2e/visual-qa/per-tab-deep.ts`. Mandatory для UI задач после deploy на staging.

### Inline click-test (per-frame, не batch)

**Правило:** после literal port КАЖДОГО `FrameNN` — сразу click-test ВСЕ интерактивные элементы ДО move next frame. **Не накапливать batch QA в конце.**

Incident reference: 2026-04-30 — 19 dead chevrons (Signal/Rep/Health) накопились через 5+ commits, PO нашёл в Visual QA audit. Inline проверка нашла бы каждый сразу.

### Per-frame interactive checklist

| Element | Check |
|---|---|
| `<button>` | onClick реально работает (toggle/navigate/dispatch) — не decorative |
| `<a>` | Working navigation handler (`e.preventDefault()` + `onNavigate(...)` или `chrome.tabs.create(...)`). Никаких `href="#"` без onClick |
| `<input>` | Wired в state с `value` + `onChange` + Enter/submit handler |
| Expand chevron (▾) | `useState<Set<string>>` + click toggle row → detail. Visual `open` class синхронизирован с state |
| Tabs / locked tabs | Click locked tab открывает paywall modal, не silent fail |
| Real data wiring | Values из props (signals/reputation/audience) реально отображаются. Wireframe defaults — только fallback |
| Color logic | Computed per data value (`signalColor` / `ervColor`), не hardcoded `"green"` |
| State props | `isWatched` / `expanded` / `loading` реально влияют на UI (active class / disabled / opacity) |

### Mode B post-merge audit

После merge feature branch в `main`:
1. CI auto-deploy на CWS staging.
2. PO запускает Mode B: `e2e/visual-qa/per-tab-deep.ts` — per-tab deep scroll screenshots (top/mid/bot × все frames).
3. Side-by-side `wireframes/slim/NN_*.html` (или `wireframes/frames/NN_*.html` для full per-frame) vs deployed UI.
4. Bugs → BUG-XXX в Notion → pipeline (не direct fix).

---

## i18n Discipline

| Правило | Что значит |
|---|---|
| **Wireframe text verbatim** | RU value `t('key')` = строка в wireframe RU literal. Если wireframe `"Рейтинг доверия"` → `ru.json: "sp.trust_rating": "Рейтинг доверия"`. Audit + sync values когда divergent |
| **EN sync invariant** | Каждый key в `ru.json` ОБЯЗАН быть в `en.json`. EN value = wireframe EN literal (если есть) или sensible translation Russian variant. Missing key в `en.json` = build/test fail |
| **Key naming** | dot.notation, lowercase, snake_case parts. Префикс по контексту: `sp.*` (side panel), `popup.*`, `erv_label.*`, `signal.*`, `not_tracked.*` |
| **No hardcoded strings** | grep `[А-Яа-яЁё]` вне `src/locales/` = 0 matches. Pre-push checklist enforces |
| **Interpolation** | i18next default `{{var}}` (double brace). Не `{var}` (single) — ломает react-i18next |
| **Pluralization** | Использовать `i18next` plurals API (`key_one`, `key_other`), не conditional rendering на frontend |
| **No translation drift** | При изменении wireframe text — обновить i18n value СРАЗУ. Не оставлять stale translation |
| **Wireframe HTML = source** | Если PO хочет изменить user-facing text: сначала правится `wireframes/full/side-panel-wireframe-TASK-039.html` (master SoT), затем regenerate `wireframes/frames/` и `wireframes/slim/`, затем i18n value re-syncs к новому wireframe literal. **Запрещено** менять i18n value напрямую без update wireframe HTML — это silent divergence от literal-port discipline. CI guard: `spec/i18n-drift.test.ts` + `wireframes/wireframe-manifest.json` SHA256 |

---

## Безопасность

| Аспект | Правило |
|---|---|
| API auth | JWT Bearer token в memory (не в storage). Refresh через httpOnly cookie |
| Permissions | Минимальные: `sidePanel`, `activeTab`, `storage` |
| Content Script | Только `twitch.tv` (matches filter в manifest) |
| CORS | Extension ID whitelisted на сервере |
| Secrets | Нет секретов в Extension коде. API URL из ENV (build time) |

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
2. **Literal port discipline mandatory** для всех Side Panel `FrameNN` компонентов (см. §Frontend Literal-Port Discipline).
3. **Pre-push checklist обязателен** — push без зелёных пунктов запрещён.
4. **Click-test inline** после каждого frame port — не batch QA в конце.
5. Каждый видимый текст = i18n ключ. `grep` для кириллицы вне `src/locales/` должен возвращать 0.
6. `manifest_version = 3`. Не менять permissions без ADR.
7. Bundle size < 500 KB. Проверяется в CI.
8. Блокер → стоп. Создать `❌ Заблокировано` задачу в Notion с конкретным описанием. Не «придумать обход».
9. Недостаточно данных → вернуть задачу. Список чего не хватает. Не додумывать.
10. Нет debug кода в коммитах (`console.log` для prod paths) — eslint поймает.
