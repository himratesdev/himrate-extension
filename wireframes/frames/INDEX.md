# Wireframe Frames — Index

**59 individual canonical frames** extracted from `../side-panel-wireframe-TASK-039.html` (7297 lines, kept intact). One frame = one `<div class="screen-group">` (one screen variant). Each frame is standalone HTML loading `_shared.css`.

## Common files

| File | Purpose |
|------|---------|
| `_shared.css` | Design tokens + sp-* classes (1265 lines from original `<style>` block 11-1275). Linked via `<link rel="stylesheet">` in every frame. |
| `_template-header.html` | DOCTYPE/head/body skeleton. Used by split script. |
| `INDEX.md` | This file. |

## Side Panel Overview states (12 sections)

### §1 NotStreaming
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 01 | [01_NotStreaming_Site.html](01_NotStreaming_Site.html) | 1293-1322 | Not on Twitch · search overlay |

### §2 Skeleton
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 02 | [02_Skeleton_Loading.html](02_Skeleton_Loading.html) | 1333-1396 | Skeleton · Loading |

### §3 Not Tracked
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 03 | [03_NotTracked_LiveRegistered.html](03_NotTracked_LiveRegistered.html) | 1408-1441 | Not Tracked · Live (registered) |
| 04 | [04_NotTracked_LiveGuest.html](04_NotTracked_LiveGuest.html) | 1444-1475 | Not Tracked · Live (guest) |
| 05 | [05_NotTracked_Offline.html](05_NotTracked_Offline.html) | 1478-1510 | Not Tracked · Offline |

### §4 Cold Start (5 levels)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 06 | [06_ColdStart_LT3.html](06_ColdStart_LT3.html) | 1522-1572 | <3 streams · Insufficient |
| 07 | [07_ColdStart_3to6.html](07_ColdStart_3to6.html) | 1575-1631 | 3-6 streams · Provisional Low |
| 08 | [08_ColdStart_7to9.html](08_ColdStart_7to9.html) | 1634-1692 | 7-9 streams · Provisional |
| 09 | [09_ColdStart_30plus.html](09_ColdStart_30plus.html) | 1697-1788 | 30+ streams · Streamer Deep Analytics |

### §5 Live · Guest
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 10 | [10_LiveGuest_Green.html](10_LiveGuest_Green.html) | 1799-1886 | Live · Guest · Green (combined paywall) |

### §6 Live · Free (3 ERV variants)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 11 | [11_LiveFree_Green85.html](11_LiveFree_Green85.html) | 1899-2115 | Live · Free · Green 85% |
| 12 | [12_LiveFree_Yellow62.html](12_LiveFree_Yellow62.html) | 2118-2272 | Live · Free · Yellow 62% |
| 13 | [13_LiveFree_Red28.html](13_LiveFree_Red28.html) | 2275-2433 | Live · Free · Red 28% |

### §7 Live · Premium
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 14 | [14_LivePremium_Green91.html](14_LivePremium_Green91.html) | 2445-2782 | Live · Premium · Green 91% (expandable signals + reputation) |

### §8 Live · Streamer (own channel)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 15 | [15_LiveStreamer_OwnChannel.html](15_LiveStreamer_OwnChannel.html) | 2793-3056 | 160px gauge + HealthScore + Streamer Tools accordion |

### §9 Offline (3 variants)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 16 | [16_Offline_Within18h.html](16_Offline_Within18h.html) | 3068-3225 | <18h (data available) |
| 17 | [17_Offline_Expired.html](17_Offline_Expired.html) | 3228-3330 | >18h Free (expired, drill-down blurred + dual CTA) |
| 18 | [18_Offline_LessThan1h.html](18_Offline_LessThan1h.html) | 3333-3490 | <1h remaining (countdown warning) |

### §10 Error
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 19 | [19_Error_Generic.html](19_Error_Generic.html) | 3501-3528 | Error · Generic (API timeout) |

### §11 Modals (6 modals)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 20 | [20_Modal_Badge.html](20_Modal_Badge.html) | 3540-3588 | Badge embed · SVG preview + HTML/MD/BBCode tabs |
| 21 | [21_Modal_ChannelCard.html](21_Modal_ChannelCard.html) | 3591-3703 | Channel Card · stats + 5 streams + PDF export |
| 22 | [22_Modal_Verification.html](22_Modal_Verification.html) | 3706-3739 | Verification · textarea + char limit + 3/5 used |
| 23 | [23_Modal_VerificationLimit.html](23_Modal_VerificationLimit.html) | 3742-3771 | Verification · Limit reached (5/5) |
| 24 | [24_Modal_Paywall.html](24_Modal_Paywall.html) | 3774-3805 | Paywall · locked tab click |
| 25 | [25_Modal_ChannelSwitch.html](25_Modal_ChannelSwitch.html) | 3808-3836 | Channel Switch · Yes/No + 10s progress bar |

### §12 Interactive States
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 26 | [26_Interactive_AnomalyDots.html](26_Interactive_AnomalyDots.html) | 3849-3939 | Anomaly Dots на табах · Premium · LIVE 62% |
| 27 | [27_Interactive_WatchlistDropdown.html](27_Interactive_WatchlistDropdown.html) | 3942-4059 | Watchlist Dropdown · Premium · LIVE |

## Trends Tab (20 frames)

| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 28 | [28_Trends_Overview.html](28_Trends_Overview.html) | 4072-4209 | Trends Overview · Premium |
| 29 | [29_Trends_ERV.html](29_Trends_ERV.html) | 4212-4328 | ERV (Real Viewers) module |
| 30 | [30_Trends_Rehab.html](30_Trends_Rehab.html) | 4331-4460 | Rehabilitation Curve module |
| 31 | [31_Trends_Anomalies.html](31_Trends_Anomalies.html) | 4463-4584 | Anomalous Events module |
| 32 | [32_Trends_PaywallFreeToPremium.html](32_Trends_PaywallFreeToPremium.html) | 4587-4714 | Paywall · Free → Premium (dynamic hook + 6 cards) |
| 33 | [33_Trends_PaywallGuestAuth.html](33_Trends_PaywallGuestAuth.html) | 4717-4750 | Paywall Guest · Twitch+Google sign-in |
| 34 | [34_Trends_7d_LessData.html](34_Trends_7d_LessData.html) | 4753-4793 | 7d period (less data) |
| 35 | [35_Trends_90d_LongPeriod.html](35_Trends_90d_LongPeriod.html) | 4796-4836 | 90d period (long range) |
| 36 | [36_Trends_InsufficientData.html](36_Trends_InsufficientData.html) | 4839-4866 | Insufficient data state |
| 37 | [37_Trends_TI.html](37_Trends_TI.html) | 4869-4975 | Trust Index module |
| 38 | [38_Trends_Stability.html](38_Trends_Stability.html) | 4978-5059 | Channel Stability module |
| 39 | [39_Trends_Components.html](39_Trends_Components.html) | 5062-5158 | Rating Components module |
| 40 | [40_Trends_Components_Variants.html](40_Trends_Components_Variants.html) | 5161-5211 | Indicator Variants |
| 41 | [41_Trends_PeerComparison.html](41_Trends_PeerComparison.html) | 5214-5301 | Peer Comparison · Business |
| 42 | [42_Trends_Categories.html](42_Trends_Categories.html) | 5304-5378 | By Categories module |
| 43 | [43_Trends_Weekday.html](43_Trends_Weekday.html) | 5381-5459 | By Weekday module |
| 44 | [44_Trends_PaywallBusiness365d.html](44_Trends_PaywallBusiness365d.html) | 5462-5605 | Paywall Business 365d |
| 45 | [45_Trends_365d_Business.html](45_Trends_365d_Business.html) | 5608-5719 | 365d Default · Business |
| 46 | [46_Trends_StaleBanner.html](46_Trends_StaleBanner.html) | 5722-5761 | Stale data banner |
| 47 | [47_Trends_RevokedAccess.html](47_Trends_RevokedAccess.html) | 5764-5807 | Access revoked · Reconnect Twitch |

## Other Tabs

### Audience
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 48 | [48_Audience_Premium.html](48_Audience_Premium.html) | 5820-5951 | Audience · Premium · Demographics + Heatmap |

### Watchlists (7 screens)
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 49 | [49_Watchlists_FreeWithData.html](49_Watchlists_FreeWithData.html) | 5964-6143 | Free · With data |
| 50 | [50_Watchlists_Guest.html](50_Watchlists_Guest.html) | 6146-6213 | Guest |
| 51 | [51_Watchlists_FreeEmpty.html](51_Watchlists_FreeEmpty.html) | 6216-6246 | Free · Empty |
| 52 | [52_Watchlists_Skeleton.html](52_Watchlists_Skeleton.html) | 6249-6323 | Skeleton (loading) |
| 53 | [53_Watchlists_Error.html](53_Watchlists_Error.html) | 6326-6353 | Error |
| 54 | [54_Watchlists_NoResults.html](54_Watchlists_NoResults.html) | 6356-6394 | Search · No results |
| 55 | [55_Watchlists_PremiumBulk.html](55_Watchlists_PremiumBulk.html) | 6397-6545 | Premium · Bulk Actions |

### Compare / Overlap / Bot-Raid / Settings
| # | File | Original lines | Screen |
|---|------|---------------|--------|
| 56 | [56_Compare_2Channels.html](56_Compare_2Channels.html) | 6557-6727 | Compare · Premium · 2 channels |
| 57 | [57_Overlap_Premium.html](57_Overlap_Premium.html) | 6738-6919 | Overlap · Premium |
| 58 | [58_BotRaid_Premium.html](58_BotRaid_Premium.html) | 6930-7192 | Bot-Raid · Premium |
| 59 | [59_Settings_Default.html](59_Settings_Default.html) | 7203-7293 | Settings (all tiers) |

## How to use

When fixing a bug referenced as `#NN` (e.g. #14.3 — Premium Overview Signals):
1. Open `wireframe-frames/14_LivePremium_Green91.html` in a browser → see canonical UI
2. Cross-check React DOM structure + classes against the frame HTML
3. Inline styles в frames приходят из original демо-данных — production-side migrate to canonical CSS classes per BUG-016 PR-1 CR M-2 conventions

## Bug ID → Frame mapping (from PO Visual QA)

| Bug ID | Frame |
|--------|-------|
| #C1-C9 | applies to all (cross-cutting) |
| #01.1 NotOnTwitch stuck on Skeleton | 01 |
| #14.3-14.6 Premium M3/M4/M5/M6 absent | 14 |
| #15.1 HealthScore for own channel absent | 15 |
| #16.1 PostStreamCountdown absent | 16, 17, 18 |
| #17.1-17.3 Offline expired | 17 |
| #20-23.1 Streamer Modals not opening | 20, 21, 22, 23 |
| #25.1 ChannelSwitch | 25 |
| #27.1 Watchlist Dropdown | 27 |
| #32.1-32.4 Free Paywall (Trends) | 32 |
| #33.1-33.3 Anonymous Sign-in (Trends) | 33 |
| #51.1-51.7 Watchlists Free Empty | 51 (+ 49, 52) |
| #T1 Trends Error | 28-47 (всё Trends) |
| #T2 5 placeholder tabs | 48, 56, 57, 58, 59 |
