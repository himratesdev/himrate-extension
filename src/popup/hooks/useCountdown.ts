// TASK-034: Countdown hook for post-stream expires_at.

import { useState, useEffect } from 'react';

interface CountdownResult {
  remaining: { hours: number; minutes: number } | null;
  expired: boolean;
}

export function useCountdown(expiresAt: string | null): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return { remaining: null, expired: false };

  const expiresMs = new Date(expiresAt).getTime();
  const diff = expiresMs - now;

  if (diff <= 0) return { remaining: null, expired: true };

  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return { remaining: { hours, minutes }, expired: false };
}
