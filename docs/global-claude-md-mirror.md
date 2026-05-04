# Cross-repo CLAUDE.md Mirror — §FRONTEND (Wireframe HTML = Source Code)

> **Этот файл — committed mirror секции `## ⚡ FRONTEND: WIREFRAME HTML = ИСХОДНЫЙ КОД` из `verivio clode/CLAUDE.md`.**
>
> **Source of truth:** `verivio clode/CLAUDE.md` §FRONTEND (verivio-clode is not a git repo).
> **Mirror purpose:** дать CI runner доступ к правилу literal-port для cross-repo drift guard. При изменении §FRONTEND в verivio-clode — обновить ОБА: этот mirror **И** `CLAUDE.md` §Frontend Literal-Port Discipline в этом репо. Workflow `.github/workflows/cross-repo-claude-md-sync.yml` enforces "mirror touched together" rule.
>
> **При конфликте:** verivio-clode/CLAUDE.md §FRONTEND выигрывает.

**Last synced from verivio-clode:** 2026-05-04 (TASK-089 Batch 0)

---

## ⚡ FRONTEND: WIREFRAME HTML = ИСХОДНЫЙ КОД (ОБЯЗАТЕЛЬНО)

> **Sync requirement:** при изменении этой секции — обновить `himrate-extension/CLAUDE.md` §Frontend Literal-Port Discipline (quick-reference дубль) **И** `himrate-extension/docs/global-claude-md-mirror.md` (CI cross-repo drift guard). Эта секция = source of truth; при конфликте global выигрывает.

**Wireframe HTML файлы — это PRODUCTION HTML, НЕ design mockup. React компонент = JSX 1:1 копия wireframe DOM.**

### Wireframe directory hierarchy (canonical paths)

| Folder (verivio-clode) | Mirror (extension) | Files | Назначение |
|---|---|---|---|
| `_tasks/TASK-039/side-panel-wireframe-TASK-039.html` | `wireframes/full/side-panel-wireframe-TASK-039.html` | 1 (7297 lines) | **Master SoT.** Single-file panel-wide. При conflict с frames/slim — full выигрывает |
| `_tasks/TASK-039/wireframe-frames/NN_*.html` | `wireframes/frames/NN_*.html` | 62 | **Canonical per-frame extracts** из full. Primary reference для tooling (i18n drift, SHA256 manifest, frame port) |
| `_tasks/TASK-039/wireframe-screens/slim/NN_*.html` | `wireframes/slim/NN_*.html` | 59 | Secondary quick-reference. Visual QA side-by-side audits |

**Изменение wireframe text** — обновляется master full, затем regenerate frames + slim из full. Прямая правка frames/slim без full = silent divergence (запрещено). После update verivio-clode → rsync mirror в `himrate-extension/wireframes/` + commit.

### Правило для каждого frame port:

1. Открыть `wireframe-frames/NN_*.html` (canonical extract). Cross-check `side-panel-wireframe-TASK-039.html` для panel-wide context.
2. Создать НОВЫЙ файл `src/sidepanel/components/Frame{NN}{Name}.tsx` без underscore (e.g. `Frame11LiveFreeGreen.tsx` — не модифицировать существующий)
3. Скопировать body content wireframe в JSX **вербатим**
4. Применить **только обязательные** JSX syntax conversions:
   - `class=` → `className=`
   - `stroke-width` / `font-size` / `text-anchor` → `strokeWidth` / `fontSize` / `textAnchor` (kebab-case → camelCase для всех HTML/SVG attrs)
   - `<input ...>` → `<input ... />` (self-close tags)
   - `style="font-size:15px;color:red;"` → `style={{ fontSize: '15px', color: 'red' }}` (object syntax)
5. Все user-facing **тексты через i18n** (`{t('key')}`) — hardcode строк ЗАПРЕЩЁН
6. **i18n значения ДОЛЖНЫ ТОЧНО совпадать с wireframe текстом** — если wireframe `"Рейтинг доверия"`, то `t('sp.trust_rating')` тоже возвращает `"Рейтинг доверия"`. Audit + sync values when divergent.
7. Real data wiring через JSX expressions поверх wireframe defaults (не replace structure):
   ```jsx
   {/* wireframe: <span class="sp-ti-score green">85</span> */}
   <span className={`sp-ti-score ${color}`}>{score ?? '—'}</span>
   ```

### Запрещённые паттерны:

- ❌ **Surgical patches** existing component файлов вместо создания нового FrameNN
- ❌ **Map iterations** (`{items.map(...)}`) над configuration array вместо JSX repetition wireframe rows
- ❌ **Computed coordinates** (`xScale(i)`, `yScale(v)`) для chart SVG — coords берутся вербатим из wireframe
- ❌ **Smart abstractions** (HOC, hooks для DOM-генерации, helper components внутри)
- ❌ **Unification empty-state и data-state branches** — структура единая, real data только overrides values
- ❌ **Hardcoded строки** в JSX (RU или EN) — всё через i18n
- ❌ **Свободная интерпретация** wireframe DOM (extra wrappers, изменённый order, другие classes)
- ❌ **"Improvements"** wireframe (добавил role/aria/accessibility если wireframe их не имеет — отдельная задача потом)

### Что НЕ нарушает правило (разрешено):

- ✅ React state management (`useState`, `useEffect`) для interactivity
- ✅ Event handlers (`onClick`, `onChange`) на existing buttons/inputs
- ✅ Conditional rendering BLOCK-LEVEL (`{condition && <FrameNN />}`)
- ✅ JSX expressions для substitution real data в text/attributes (но не структуру)
- ✅ React.Fragment для top-level multi-child returns

### Tracking

`_tasks/TASK-039/frame-port-progress.md` (mirror: `himrate-extension/wireframes/frame-port-progress.md`) — статус каждого из 59 frames. Обновлять после commit каждого frame.

### Audit перед commit (visual + functional)

Перед commit каждого FrameNN — открыть `wireframe-frames/NN_*.html` (canonical extract; либо slim для quick-reference) рядом с tsx файлом, **глазами сверить line-by-line**:

**Visual checklist:**
- Каждый `<div class>` соответствует `<div className>` JSX
- Inline styles 1:1
- SVG attrs скопированы вербатим
- Нет лишних wrappers
- Нет hardcoded текста (всё i18n)
- Нет лишних props/handlers которых нет в wireframe

**Functional checklist (КАЖДЫЙ интерактивный element):**
- [ ] **Buttons:** каждая `<button>` имеет рабочий `onClick` (не decorative). Click handler делает то что ожидает wireframe state (toggle/navigate/dispatch action).
- [ ] **Links:** каждый `<a>` имеет рабочий navigation handler. `e.preventDefault()` + `onNavigate(...)` или `chrome.tabs.create(...)`. Не оставлять `href="#"` без onClick.
- [ ] **Inputs:** каждый `<input>` wired в state с `value` + `onChange` + handler на Enter/submit.
- [ ] **Expand chevrons (▾):** каждый chevron toggle state row→detail. `useState<Set<string>>` + click toggle. Visual class `open` синхронизирован с state.
- [ ] **Tabs/locked tabs:** клик по locked tab открывает paywall modal (не silent fail).
- [ ] **Text:** каждый user-facing string через `t('key')`. Hardcoded RU/EN строки в JSX = нарушение. i18n value = wireframe text verbatim (не переписывать).
- [ ] **Real data wiring:** values из props (signals/reputation/audience/etc) реально отображаются. Wireframe defaults — только fallback.
- [ ] **Color logic:** computed per data value (signalColor / ervColor) не hardcoded "green".
- [ ] **State props:** isWatched/expanded/loading реально влияют на UI (active class / disabled / opacity).

**Build + tsc + manual reload:**
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run build` — green
- [ ] **Manual reload extension в Chrome** + click КАЖДОГО button/link/expand чтобы verify работают (или явно declare что не verified)

Если PO ловит divergence от wireframe ИЛИ broken interactivity — это нарушение workflow, frame нужно переделать.
