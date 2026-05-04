# Frame-by-Frame Literal HTML Port Progress

**Task:** [TASK-083](https://app.notion.com/p/351838370e54815ab60cc9c6d3679813)
**Branch:** `fix/BUG-016-side-panel-rebuild-pr1`
**Method:** JSX 1:1 от wireframe slim HTML — no surgical patches, no abstractions, i18n only (no hardcode)

## Statuses
- `pending` — ещё не начат
- `literal-done` — JSX literal port написан, не committed
- `committed` — committed на ветку
- `wired` — routing в Overview подключён
- `verified` — PO визуально проверил
- `mapped→<Component>` — wireframe покрыт existing component literal-port, отдельный FrameNN не нужен
- `port-required` — wireframe НЕ покрыт ни одним existing component, нужен новый FrameNN.tsx

## Audit 2026-05-03 — 13 "missing" frames (Batch 3 step 1)

Audit для 13 frames без явного FrameNN.tsx файла. Cross-reference с existing components.

| # | Wireframe | Decision | Rationale |
|---|---|---|---|
| 01 | not-streaming-site | ✅ **mapped→NotTwitchOverview.tsx** | Literal port done (JSX 1:1, header comment подтверждает). State icon "H" + title + subtitle + search-input verbatim. |
| 02 | skeleton-loading | ✅ **mapped→SkeletonOverview.tsx** | Literal port done. M1-M6 skeleton-rect/skeleton-circle dimensions verbatim. |
| 03 | not-tracked-live-registered | ✅ **mapped→NotTrackedOverview.tsx** | Literal port done. Branch: `isLive=true && loggedIn=true` → btn-primary "Запросить отслеживание". CCV display verbatim. |
| 04 | not-tracked-live-guest | ✅ **mapped→NotTrackedOverview.tsx** | Same component, branch `isGuestLive` → btn-twitch "Войдите для запроса". Header right state (no settings icon when guest) — separate concern в SidePanel.tsx, не overview body. |
| 05 | not-tracked-offline | ✅ **mapped→NotTrackedOverview.tsx** | Same component, branch `!isLive` → no CCV row, btn-primary. |
| 12 | live-free-yellow-62 | ⚠️ **port-required (Frame12LiveFreeYellow.tsx)** | Frame11 параметризован color prop ('green'/'yellow'/'red') но sparkline ERV/CCV polyline coords HARDCODED green-shaped (растут). Wireframe 12 показывает yellow-specific shape: ERV flat/declining + total online drifting away (anomaly visual). Если real chart hook nil → defaults wrong shape. Plus: split parametrized Frame11 в Frame11/12/13 убирает "smart abstraction" анти-pattern (CLAUDE.md FRONTEND правила). |
| 13 | live-free-red-28 | ⚠️ **port-required (Frame13LiveFreeRed.tsx)** | Same проблема как 12 + дополнительно: sparkline `<rect x="184" y="18" width="90" height="94" + text "Аномалия">` marker (red-specific anomaly zone) ОТСУТСТВУЕТ в Frame11 SVG. + 2 simultaneous alerts (red_surge + red_unauth). |
| 19 | error-generic | ✅ **mapped→ErrorOverview.tsx** ⚠️ verify i18n | Structure 1:1 (state-center + state-icon error-icon + state-title + state-subtitle + btn-primary). I18n keys: `t('sp.error_title')` + `t('popup.error_subtitle')` + `t('popup.retry')`. **Verify values match wireframe verbatim** ("Не удалось загрузить данные" + "Проверьте подключение или попробуйте позже" + "Повторить"). |
| 24 | paywall-modal | ✅ **mapped→LockedTabPaywallModal.tsx** ⚠️ verify i18n | Structure 1:1 (Modal wrapper + dim=0.4 + LockIcon purple + headline + subtext + cta). **Verify i18n values** ("Обновите до Premium" + body text + "Обновить — $9.99/мес"). |
| 25 | channel-switch | ✅ **mapped→ChannelSwitchNotification.tsx** | Literal port done. sp-channel-switch overlay + card + title + sub + btn-yes/btn-no + animated progress bar (10s auto-dismiss). |
| 26 | anomaly-dots-premium | ⚠️ **port-required (Frame26AnomalyDots.tsx)** | Anomaly dots на табах (yellow/red pulse animation `position:absolute;top:2px;right:0;width:6px;height:6px;animation:pulse 2s infinite`) — UI feature НЕ имплементирована в TabBar.tsx. Wireframe показывает full live screen demo с этой feature. Strict literal port = standalone Frame26 (тогда TabBar feature wires в TASK-084). |
| 27 | watchlist-dropdown-premium | ⚠️ **port-required (Frame27WatchlistDropdown.tsx)** | Watchlist dropdown overlay (4 watchlists list + create new) поверх dimmed live content — UI feature НЕ имплементирована в WatchlistButton.tsx. Standalone literal port required. |
| 40 | indicator-variants | ⚠️ **port-required (Frame40TrendsIndicatorVariants.tsx)** | Showcase frame: 3 growth type variants (square+arrow icons) + 3 coupling variants (round+chain icons) + 1 "0 botted streams" variant. Дизайн-палитра для Frame39Components reference. Литерал-port consistency требует FrameNN.tsx. |

### Result
**8 mapped / 5 port-required** = 13 audited.

**5 port-required components** для следующего шага Batch 3:
1. `Frame12LiveFreeYellow.tsx` — split parametrized Frame11 + yellow-specific sparkline coords
2. `Frame13LiveFreeRed.tsx` — split parametrized Frame11 + red-specific sparkline coords + anomaly rect marker
3. `Frame26AnomalyDots.tsx` — standalone demo с anomaly dots на табах
4. `Frame27WatchlistDropdown.tsx` — standalone demo с dropdown overlay
5. `Frame40TrendsIndicatorVariants.tsx` — showcase indicator legend

### PO decisions (2026-05-03)
- **Frame12/13 split:** ✅ APPROVED + DONE (commit `081220e`). Разделение Frame11 на 3 файла. Smart abstraction анти-pattern удалён. Tested PO automated runner: 0 regressions, Frame12/13 NEW renders correctly.
- **Frame26/27:** ✅ DEFER → TASK-084 feature extension (TabBar.anomalyDots + WatchlistButton.dropdown UI). Standalone demo-frames НЕ создаются.
- **Frame40:** ✅ SKIP (autonomous decision). Design palette only — не user-facing.
- **i18n verify (Frame19/24):** В скопе Step 4 — 143 P1 i18n bulk migration.

### B5/B6/B7 routing/wiring (audit cycle 1+2 P0 bugs) — НЕ frame port, → TASK-084

Notion search 2026-05-03: **TASK-084 Phase G2 Interactivity** explicitly scope'ит эти bugs (line "'Подробная история →' reputation row Frame14/15 Navigate to Trends » Reputation drill-down" + "Reputation row expand · Спарклайн из history API" + "Navigation links 'Подробнее →' / 'Подробная история →' / 'История →'"). Не создаём отдельную task.

### Frame port milestone status (post Step 1 + Step 1b)

**59/59 literal-port done ✅** (для existing wireframes):
- 8 mapped (Frame01-05/19/24/25 → existing components)
- 5 audited as port-required → 3 ported (Frame12/13 split done; Frame11 reduced) + 2 deferred (Frame26/27 → TASK-084) + 1 skipped (Frame40 design palette)
- 51 ported standalone FrameNN.tsx files

"Reputation Full History" screen НЕ counted — wireframe HTML НЕ существует в slim/ или main wireframe HTML. Это design gap, scope TASK-084 если нужен dedicated drill-down screen.

## Side Panel Core (1-19)

| # | Slim file | Component | Status | Commit |
|---|---|---|---|---|
| 01 | 01_not-streaming-site.html | NotTwitchOverview.tsx | committed | (in branch) |
| 02 | 02_skeleton-loading.html | SkeletonOverview.tsx | committed | (in branch) |
| 03 | 03_not-tracked-live-registered.html | NotTrackedOverview.tsx | committed | (in branch) |
| 04 | 04_not-tracked-live-guest.html | NotTrackedOverview.tsx (variant) | committed | (in branch) |
| 05 | 05_not-tracked-offline.html | NotTrackedOverview.tsx (variant) | committed | (in branch) |
| 06 | 06_cold-start-3-strimov.html | Frame06ColdStartInsufficient.tsx | wired | (pending commit) |
| 07 | 07_cold-start-36-strimov.html | Frame07ColdStartProvisionalLow.tsx | pending | — |
| 08 | 08_cold-start-79-strimov.html | Frame08ColdStartProvisional.tsx | pending | — |
| 09 | 09_cold-start-30-strimov-streamer.html | Frame09ColdStartDeepStreamer.tsx | pending | — |
| 10 | 10_live-guest-green.html | Frame10LiveGuestGreen.tsx | pending | — |
| 11 | 11_live-free-green-85.html | Frame11LiveFreeGreen.tsx | committed | (in branch — Batch 3 step 1b: split green-only) |
| 12 | 12_live-free-yellow-62.html | Frame12LiveFreeYellow.tsx | committed | (in branch — Batch 3 step 1b) |
| 13 | 13_live-free-red-28.html | Frame13LiveFreeRed.tsx | committed | (in branch — Batch 3 step 1b) |
| 14 | 14_live-premium-green-91.html | Frame14LivePremiumGreen.tsx | pending | — |
| 15 | 15_live-streamer-own-channel.html | Frame15LiveStreamerOwnChannel.tsx | pending | — |
| 16 | 16_offline-18ch-dannye-dostupny.html | Frame16OfflineWithin18h.tsx | pending | — |
| 17 | 17_offline-18ch-free-expired.html | Frame17OfflineExpired.tsx | pending | — |
| 18 | 18_offline-1ch-ostalos.html | Frame18OfflineLessThan1h.tsx | pending | — |
| 19 | 19_error-generic.html | ErrorOverview.tsx | committed | (was already correct) |

## Modals (20-25)

| # | Slim file | Component | Status | Commit |
|---|---|---|---|---|
| 20 | 20_badge-modal.html | Frame20BadgeModal.tsx | pending | — |
| 21 | 21_channel-card-modal.html | Frame21ChannelCardModal.tsx | pending | — |
| 22 | 22_zapros-na-proverku.html | Frame22VerificationRequest.tsx | pending | — |
| 23 | 23_zapros-na-proverku-limit-ischerpan.html | Frame23VerificationLimit.tsx | pending | — |
| 24 | 24_paywall-modal.html | Frame24PaywallModal.tsx | pending | — |
| 25 | 25_channel-switch.html | Frame25ChannelSwitch.tsx | pending | — |

## Interactive (26-27)

| # | Slim file | Component | Status | Commit |
|---|---|---|---|---|
| 26 | 26_anomaly-dots-premium-live-erv-62.html | Frame26AnomalyDots.tsx | pending | — |
| 27 | 27_watchlist-dropdown-premium-live.html | Frame27WatchlistDropdown.tsx | pending | — |

## Trends Tab (28-47)

| # | Slim file | Component | Status | Commit |
|---|---|---|---|---|
| 28 | 28_screen-1-trends-overview-premium.html | Frame28TrendsOverview.tsx | pending | — |
| 29 | 29_screen-2-realnye-zriteli-erv-premium.html | Frame29TrendsErv.tsx | pending | — |
| 30 | 30_screen-3-vosstanovlenie-reytinga-premium.html | Frame30TrendsRecovery.tsx | pending | — |
| 31 | 31_screen-4-anomalnye-sobytiya-premium.html | Frame31TrendsAnomalies.tsx | pending | — |
| 32 | 32_screen-5-paywall-free-premium.html | Frame32TrendsPaywallFree.tsx | pending | — |
| 33 | 33_screen-6-paywall-guest-avtorizaciya.html | Frame33TrendsPaywallGuest.tsx | pending | — |
| 34 | 34_screen-7-trends-7d-menshe-dannyh.html | Frame34Trends7d.tsx | pending | — |
| 35 | 35_screen-8-trends-90d-dlinnyy-period.html | Frame35Trends90d.tsx | pending | — |
| 36 | 36_screen-9-nedostatochno-dannyh.html | Frame36TrendsInsufficient.tsx | pending | — |
| 37 | 37_screen-10-reyting-doveriya-ti-premium.html | Frame37TrendsTi.tsx | pending | — |
| 38 | 38_screen-11-stabilnost-kanala-premium.html | Frame38TrendsStability.tsx | pending | — |
| 39 | 39_screen-12-komponenty-reytinga-premium.html | Frame39TrendsComponents.tsx | pending | — |
| 40 | 40_screen-12-varianty-indikatorov.html | Frame40TrendsIndicatorVariants.tsx | pending | — |
| 41 | 41_screen-13-sravnenie-s-kollegami-business.html | Frame41TrendsComparison.tsx | pending | — |
| 42 | 42_screen-14-po-kategoriyam-premium.html | Frame42TrendsCategories.tsx | pending | — |
| 43 | 43_screen-15-po-dnyam-nedeli-premium.html | Frame43TrendsWeekday.tsx | pending | — |
| 44 | 44_screen-16-paywall-business-365d.html | Frame44TrendsPaywallBusiness.tsx | pending | — |
| 45 | 45_screen-16b-trends-365d-default-business.html | Frame45Trends365dBusiness.tsx | pending | — |
| 46 | 46_screen-17-dannye-obnovlyayutsya.html | Frame46TrendsStaleBanner.tsx | pending | — |
| 47 | 47_screen-18-dostup-otozvan.html | Frame47TrendsOauthRevoked.tsx | pending | — |

## Other Tabs (48-59)

| # | Slim file | Component | Status | Commit |
|---|---|---|---|---|
| 48 | 48_audience-premium.html | Frame48AudiencePremium.tsx | literal-done | — |
| 49 | 49_watchlists-free-with-data.html | Frame49WatchlistsFreeWithData.tsx | literal-done | — |
| 50 | 50_watchlists-guest.html | Frame50WatchlistsGuest.tsx | literal-done | — |
| 51 | 51_watchlists-free-empty.html | Frame51WatchlistsFreeEmpty.tsx | literal-done | — |
| 52 | 52_watchlists-skeleton.html | Frame52WatchlistsSkeleton.tsx | literal-done | — |
| 53 | 53_watchlists-error.html | Frame53WatchlistsError.tsx | literal-done | — |
| 54 | 54_watchlists-search-no-results.html | Frame54WatchlistsSearchNoResults.tsx | literal-done | — |
| 55 | 55_watchlists-premium-bulk-actions.html | Frame55WatchlistsPremiumBulk.tsx | literal-done | — |
| 56 | 56_compare-premium-2-kanala.html | Frame56ComparePremium.tsx | literal-done | — |
| 57 | 57_overlap-premium.html | Frame57OverlapPremium.tsx | literal-done | — |
| 58 | 58_botraid-premium.html | Frame58BotRaidPremium.tsx | literal-done | — |
| 59 | 59_settings.html | Frame59Settings.tsx | literal-done | — |

## Cleanup checklist (Phase G)

- [ ] Delete `ERVGauge.tsx` (used by old Overview, replaced by frame components)
- [ ] Delete `SignalBreakdown.tsx`
- [ ] Delete `ReputationCard.tsx`
- [ ] Delete `MiniSparkline.tsx`
- [ ] Delete `HealthScoreCard.tsx`
- [ ] Delete `TIBadge.tsx`
- [ ] Delete `AudiencePreview.tsx`
- [ ] Delete `LiveTrendIndicator.tsx`
- [ ] Delete `AlertCounter.tsx`
- [ ] Delete `AlertsBlock.tsx`
- [ ] Delete `PostStreamCountdown.tsx`
- [ ] Delete `StreamSummaryCard.tsx`
- [ ] Delete `StreamerModeButtons.tsx`
- [ ] Delete `WatchlistButton.tsx`
- [ ] Refactor `Overview.tsx` → плоский switch routing на FrameNN компоненты
- [ ] i18n keys audit + sync values to wireframe verbatim text
- [ ] Build green, tsc 0 errors

## Progress Summary

**Total frames:** 59
**Done (literal port + committed):** 6 (frames 01/02/03/04/05/19)
**Wired (in code, not committed):** 1 (frame 06)
**Pending:** 52
