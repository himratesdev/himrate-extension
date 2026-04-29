// TASK-039: Trends Tab shell — Period toggle + Overview routing + access gating.
// Phase D2 wiring (CR fixes):
//   M-2: onRequestUpgrade callback threaded к Paywall CTA
//   S-1: StaleBanner shown when meta.data_freshness === 'stale'

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrendsPeriod, AccessLevel, TrendsMeta } from '../../../../shared/trends-types';
import { PeriodToggle } from './PeriodToggle';
// TrendsOverview — old implementation (own architecture, not literal port).
// Replaced by Frame28TrendsOverview. Kept import commented for now until full
// trends frames port done (frames 29-47) — then remove TrendsOverview.tsx файл.
// import { TrendsOverview } from './TrendsOverview';
import { Frame28TrendsOverview } from '../../Frame28TrendsOverview';
import { AnonymousState } from './states/AnonymousState';
import { InsufficientData } from './states/InsufficientData';
import { StaleBanner } from './states/StaleBanner';
import { Paywall } from './Paywall';

interface Props {
  channelId: string | null;
  accessLevel: AccessLevel;
  /** Optional hook — when user clicks "Sign in" в AnonymousState. Parent wires to login flow. */
  onRequestSignIn?: () => void;
  /** Called when user clicks paywall CTA — parent navigates to checkout. */
  onRequestUpgrade?: (target: 'premium' | 'business') => void;
  /** Reconnect Twitch OAuth handler — parent triggers re-auth flow. */
  onReconnectTwitch?: () => void;
  /** OAuth state: when true, content shows revoked banner с Reconnect CTA. */
  oauthRevoked?: boolean;
}

const DEFAULT_PERIOD: TrendsPeriod = '30d';

export function TrendsTab({
  channelId,
  accessLevel,
  onRequestSignIn,
  onRequestUpgrade,
  onReconnectTwitch,
  oauthRevoked = false,
}: Props) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendsPeriod>(DEFAULT_PERIOD);
  const [meta, setMeta] = useState<TrendsMeta | null>(null);

  // Stable identity — child useEffect avoid refetch на render.
  // Stable identity — kept для future Frame28 meta integration when API wired.
  void useCallback((m: TrendsMeta) => setMeta(m), []);

  // Anonymous viewer — sign-in CTA, no fetches.
  if (accessLevel === 'anonymous') {
    return (
      <div className="trends-tab">
        <AnonymousState onSignIn={onRequestSignIn} />
      </div>
    );
  }

  // Free viewer — full upgrade screen, no fetches.
  if (accessLevel === 'free') {
    return (
      <div className="trends-tab">
        <Paywall variant="free" onUpgrade={() => onRequestUpgrade?.('premium')} />
      </div>
    );
  }

  if (!channelId) {
    return (
      <div className="trends-tab trends-tab-empty">
        <InsufficientData reasonKey="no_channel" />
      </div>
    );
  }

  // Premium viewer hits 365d Business gate — Business paywall replaces overview.
  const showBusinessPaywall = period === '365d' && accessLevel !== 'business';

  const handlePeriodChange = (next: TrendsPeriod) => setPeriod(next);
  const handleRequestUpgrade = (_p: TrendsPeriod) => setPeriod('365d');

  return (
    <div className="trends-tab">
      <PeriodToggle
        currentPeriod={period}
        onChange={handlePeriodChange}
        accessLevel={accessLevel}
        onRequestUpgrade={handleRequestUpgrade}
      />
      {oauthRevoked && (
        <StaleBanner variant="revoked" onReconnect={onReconnectTwitch} />
      )}
      {!oauthRevoked && meta?.data_freshness === 'stale' && (
        <StaleBanner variant="stale" relative={t('tooltip.data_stale')} />
      )}
      {showBusinessPaywall ? (
        <Paywall variant="business" onUpgrade={() => onRequestUpgrade?.('business')} />
      ) : (
        // Frame 28 LITERAL PORT — replaces previous TrendsOverview (own architecture).
        // Wireframe slim/28: 9 module cards + 3 insights + period toggle.
        // Old TrendsOverview (kept for now) handles real API integration; Frame28 is
        // the canonical visual structure. Real data wiring needs API endpoints (TBD).
        <Frame28TrendsOverview initialPeriod={period === '365d' ? '90d' : period as '7d' | '30d' | '60d' | '90d'} isPremium={true} />
      )}
      <span className="sr-only">{t('trends.period.aria')}</span>
    </div>
  );
}
