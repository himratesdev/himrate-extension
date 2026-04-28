// TASK-035 FR-020: Alert Counter — LIVE-only alert badges.
// CCV spike, TI drop, bot wave computed from TrustCache fields.
// Auto-dismiss 5min. Max 3 visible.

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { TrustCache } from '../../shared/api';

interface Alert {
  id: string;
  type: 'ccv_spike' | 'ti_drop' | 'bot_wave';
  label: string;
  createdAt: number;
}

interface Props {
  trustCache: TrustCache;
}

const AUTO_DISMISS_MS = 5 * 60 * 1000; // 5 minutes

export function AlertCounter({ trustCache }: Props) {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const prevRef = useRef<{ erv_percent: number | null; ti_score: number | null; ccv: number | null }>({
    erv_percent: null, ti_score: null, ccv: null,
  });

  // Detect threshold breaches on each trustCache update
  useEffect(() => {
    const prev = prevRef.current;
    const now = Date.now();
    const newAlerts: Alert[] = [];

    // Bot wave: ERV% < 50 → frame 13 "Волна ботов"
    if (trustCache.erv_percent != null && trustCache.erv_percent < 50) {
      if (prev.erv_percent == null || prev.erv_percent >= 50) {
        newAlerts.push({ id: `bot_wave_${now}`, type: 'bot_wave', label: t('sp.alert_bot_wave'), createdAt: now });
      }
    }
    // TI drop: TI dropped by 10+ points → "Падение TI"
    if (trustCache.ti_score != null && prev.ti_score != null && prev.ti_score - trustCache.ti_score >= 10) {
      newAlerts.push({ id: `ti_drop_${now}`, type: 'ti_drop', label: t('sp.alert_ti_drop'), createdAt: now });
    }
    // CCV spike: CCV jumped 50%+ from previous reading → "Скачок CCV"
    if (trustCache.ccv != null && prev.ccv != null && prev.ccv > 0 && trustCache.ccv / prev.ccv >= 1.5) {
      newAlerts.push({ id: `ccv_spike_${now}`, type: 'ccv_spike', label: t('sp.alert_ccv_spike'), createdAt: now });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...prev, ...newAlerts].slice(-3));
    }

    prevRef.current = { erv_percent: trustCache.erv_percent, ti_score: trustCache.ti_score, ccv: trustCache.ccv };
  }, [trustCache.erv_percent, trustCache.ti_score, trustCache.ccv, t]);

  // Auto-dismiss expired alerts every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setAlerts((prev) => prev.filter((a) => Date.now() - a.createdAt < AUTO_DISMISS_MS));
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  if (alerts.length === 0) return null;

  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="sp-alert-stack">
      {alerts.map((alert) => {
        // bot_wave is red severity (ERV < 50); other alerts are yellow.
        const severity = alert.type === 'bot_wave' ? 'red' : 'yellow';
        return (
          <div key={alert.id} className={`sp-alert ${severity}`} role="alert" aria-live="polite">
            <span className="sp-alert-dot" />
            <span>{alert.label}</span>
            <button
              className="sp-alert-dismiss"
              onClick={() => dismiss(alert.id)}
              aria-label={t('aria.dismiss')}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
