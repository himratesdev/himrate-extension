// TASK-034 FR-016: Data freshness dot (green = fresh, grey = stale).

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TRUST_CACHE_TTL_MS } from '../../shared/config';

interface Props {
  fetchedAt: number;
}

export function FreshnessIndicator({ fetchedAt }: Props) {
  const { t } = useTranslation();
  const [isFresh, setIsFresh] = useState(true);

  useEffect(() => {
    const check = () => setIsFresh(Date.now() - fetchedAt < TRUST_CACHE_TTL_MS);
    check();
    const interval = setInterval(check, 10_000);
    return () => clearInterval(interval);
  }, [fetchedAt]);

  return (
    <span
      className={`freshness-dot ${isFresh ? 'fresh' : 'stale'}`}
      title={isFresh ? t('tooltip.data_fresh') : t('tooltip.data_stale')}
    />
  );
}
