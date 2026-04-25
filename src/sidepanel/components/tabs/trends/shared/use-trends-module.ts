// TASK-039 Phase D2 CR N-1: shared fetch + state machine hook для Trends modules.
// Removes ~80 lines of boilerplate per module. Consistent error handling
// (AbortError ignored, network/insufficient_data → distinct states, retry бьёт
// refreshKey → effect re-runs). Build-for-years foundation для D3+ modules.

import { useEffect, useState } from 'react';
import type { TrendsResult } from '../../../../../shared/trends-api';

export type ModuleState<T> =
  | { status: 'loading' }
  | { status: 'ok'; data: T }
  | { status: 'error' }
  | { status: 'empty' }
  | { status: 'inactive' };

export type ModuleFetcher<T> = (signal: AbortSignal) => Promise<TrendsResult<T>>;

export interface UseTrendsModuleOptions<T> {
  /** Map a successful API response to a UI state. Default: 'ok'. Use to surface
   * insufficient_data (server flag) as 'empty' or domain-disabled responses
   * (e.g. rehabilitation_active=false) as 'inactive'. */
  classifyOk?: (data: T) => 'ok' | 'empty' | 'inactive';
}

export function useTrendsModule<T>(
  fetcher: ModuleFetcher<T>,
  deps: ReadonlyArray<unknown>,
  options: UseTrendsModuleOptions<T> = {}
): { state: ModuleState<T>; retry: () => void } {
  const [state, setState] = useState<ModuleState<T>>({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setState({ status: 'loading' });
    const ctrl = new AbortController();
    fetcher(ctrl.signal)
      .then((result) => {
        if (!result.ok) {
          setState({ status: result.error === 'insufficient_data' ? 'empty' : 'error' });
          return;
        }
        const verdict = options.classifyOk ? options.classifyOk(result.data) : 'ok';
        if (verdict === 'empty') {
          setState({ status: 'empty' });
        } else if (verdict === 'inactive') {
          setState({ status: 'inactive' });
        } else {
          setState({ status: 'ok', data: result.data });
        }
      })
      .catch((e: unknown) => {
        // AbortError on unmount — expected, не regression.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => ctrl.abort();
    // Deps spread from caller (channelId/period/etc.) + internal refreshKey.
    // fetcher/options excluded by design — they're recreated on каждый parent render
    // (closures over caller's state); refetching on their identity change → infinite loop.
  }, [...deps, refreshKey]);

  const retry = () => setRefreshKey((k) => k + 1);
  return { state, retry };
}
