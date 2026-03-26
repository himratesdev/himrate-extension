# HimRate — Chrome Extension (MV3)

Twitch streamer audience analysis. Detects viewer anomalies, calculates Estimated Real Viewers (ERV), and provides trust metrics.

## Tech Stack

- **Framework:** React 19 + TypeScript 5
- **Build:** Vite
- **i18n:** react-i18next (RU/EN)
- **Target:** Chrome Extension Manifest V3
- **Minimum Chrome:** 114+ (Side Panel API)

## Development

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Chrome browser

### Setup

```bash
git clone https://github.com/himratesdev/himrate-extension.git
cd himrate-extension
npm install
```

### Build

```bash
npm run build
```

Creates `dist/` directory with the built extension.

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` directory
5. HimRate icon appears in the toolbar

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production → dist/ |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint check |

### Self-Check Before PR

All checks MUST pass before creating a PR:

1. `npm run typecheck` → 0 errors
2. `npm run lint` → 0 errors
3. `npm run build` → dist/ created, all files present
4. Load dist/ in Chrome → Extension works
5. `git status` → no unexpected files

## Project Structure

```
src/
  popup/           — Popup UI (7 states)
    Popup.tsx
    popup.html
    main.tsx
  sidepanel/       — Side Panel UI (8 tabs)
    SidePanel.tsx
    sidepanel.html
    main.tsx
    components/
      TabBar.tsx
      tabs/         — Tab content components
  background/      — Service Worker (MV3)
    background.ts
  content/         — Content Script (twitch.tv injection)
    content.ts
  shared/          — Shared modules
    api.ts          — API client stub (Phase 2: real API calls)
    i18n.ts         — i18n configuration
    components/     — Shared React components
  locales/         — i18n translations
    ru.json
    en.json
public/
  manifest.json    — Chrome Extension manifest (MV3)
  icons/           — Extension icons
```

## Git Workflow

- **Branches:** `feature/TASK-{id}-{slug}` from `main`
- **Commits:** Conventional Commits — `feat(TASK-009): description`
- **Merge:** Squash merge into main (branches preserved for history)
- **CI:** GitHub Actions — lint + build + security on every PR
- **Protection:** main + production branches protected

## Permissions

| Permission | Why | CWS Justification |
|-----------|-----|-------------------|
| `sidePanel` | Side Panel API for 8-tab analytics dashboard | Core product feature — analytics displayed in Chrome Side Panel alongside Twitch pages |
| `activeTab` | Content script needs current tab URL to detect which Twitch channel user is watching | Required to identify streamer channel for real-time audience analysis (Phase 2) |
| `storage` | Persist user language preference and UI state (banner dismiss) | Settings persistence between Extension sessions, no sensitive data stored |

## Related

- **Backend API:** [himrate-platform](https://github.com/himratesdev/himrate-platform)
- **Documentation:** See `ai-dev-team/` in the project workspace

## License

See [LICENSE](LICENSE).
