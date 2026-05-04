// GlobalStateRouter — hierarchical routing per ADR-089 D-1.
// Routes "global" Side Panel states (NotStreaming / Skeleton / NotTracked
// variants / Error) к соответствующим Frame*.tsx. Возвращает null если
// состояние не "global" — caller (Overview.tsx) делает fall-through к
// cold-start / live / offline drill-down логике.
//
// Used by: Overview.tsx (Batch 1 — Frame01-05; Batch 4 — Frame19 Error).

import type { TrustCache } from '../../shared/api';
import { Frame01NotStreamingSite } from './Frame01NotStreamingSite';
import { Frame02SkeletonLoading } from './Frame02SkeletonLoading';
import { Frame03NotTrackedLiveRegistered } from './Frame03NotTrackedLiveRegistered';
import { Frame04NotTrackedLiveGuest } from './Frame04NotTrackedLiveGuest';
import { Frame05NotTrackedOffline } from './Frame05NotTrackedOffline';
import { ErrorOverview } from './ErrorOverview';

export type GlobalState =
  | 'skeleton'
  | 'not_streaming'
  | 'error'
  | 'not_tracked_live_registered'
  | 'not_tracked_live_guest'
  | 'not_tracked_offline';

interface ResolveOptions {
  /** undefined = detection in flight; null = no channel; string = found */
  currentChannel: string | null | undefined;
  trustCache: TrustCache | null;
  loading: boolean;
  authLoggedIn: boolean;
}

/**
 * Pure resolver: returns canonical GlobalState или null если в "non-global"
 * branch (cold start / live / offline drill-down).
 *
 * Order matches existing Overview.tsx state machine (FR-019):
 *   1. currentChannel undefined OR loading + has channel → skeleton
 *   2. currentChannel === null OR trustCache.login missing → not_streaming
 *   3. trustCache.error → error
 *   4. !trustCache.is_tracked → not_tracked_{live_registered|live_guest|offline}
 *   5. else → null (fall-through к live/cold-start logic)
 */
export function resolveGlobalState(opts: ResolveOptions): GlobalState | null {
  const { currentChannel, trustCache, loading, authLoggedIn } = opts;

  if (currentChannel === undefined) return 'skeleton';
  if (currentChannel === null) return 'not_streaming';
  if (loading || !trustCache) return 'skeleton';
  if (trustCache.error) return 'error';
  if (!trustCache.login) return 'not_streaming';

  if (!trustCache.is_tracked) {
    // is_live alone gates live vs offline; ccv null/undefined → 0 default
    // в Frame03/04 callsite (avoids transient Frame05 misroute when EventSub
    // sends is_live=true ahead of CCV snapshot). Per CR S-2 fix.
    if (trustCache.is_live) {
      return authLoggedIn ? 'not_tracked_live_registered' : 'not_tracked_live_guest';
    }
    return 'not_tracked_offline';
  }

  return null;
}

interface RouterProps {
  state: GlobalState;
  /** Required for not_tracked_* states (login + ccv when live) */
  trustCache: TrustCache | null;
  authLoggedIn: boolean;
}

export function GlobalStateRouter({ state, trustCache, authLoggedIn }: RouterProps) {
  switch (state) {
    case 'skeleton':
      return <Frame02SkeletonLoading />;
    case 'not_streaming':
      return <Frame01NotStreamingSite />;
    case 'error':
      // Frame19 ErrorGeneric placeholder until Batch 4 (per ADR-089 D-1 scope).
      // Reuses existing ErrorOverview (BUG-016 PR-1a literal port from slim/19).
      return <ErrorOverview />;
    case 'not_tracked_live_registered':
      return (
        <Frame03NotTrackedLiveRegistered
          ccv={trustCache?.ccv ?? 0}
          login={trustCache?.login ?? ''}
        />
      );
    case 'not_tracked_live_guest':
      return <Frame04NotTrackedLiveGuest ccv={trustCache?.ccv ?? 0} />;
    case 'not_tracked_offline':
      return (
        <Frame05NotTrackedOffline
          login={trustCache?.login ?? ''}
          loggedIn={authLoggedIn}
        />
      );
  }
}
