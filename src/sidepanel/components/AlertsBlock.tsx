// BUG-016 PR-1a: AlertsBlock — persistent anomaly attribution box (frame 26).
// Wireframe: wireframe-screens/slim/26_anomaly-dots-premium-live-erv-62.html.
// Yellow/red bordered box с list of detected anomalies (raid attribution, audience overlap, etc.).
// Distinct from AlertCounter (transient threshold-triggered alerts с auto-dismiss).

import { useTranslation } from 'react-i18next';

export interface AnomalyAlert {
  id: string;
  severity: 'red' | 'yellow';
  /** Short title (i18n-translated). */
  title: string;
  /** Optional details under title (i18n-translated). */
  detail?: string;
}

interface Props {
  alerts: AnomalyAlert[];
}

export function AlertsBlock({ alerts }: Props) {
  const { t: _t } = useTranslation();
  if (alerts.length === 0) return null;

  return (
    <div className="sp-alerts-block">
      {alerts.map((a, i) => (
        <div key={a.id}>
          <div className={`sp-alerts-title sp-alerts-title-${a.severity}`}>
            <span className={`sp-alerts-dot ${a.severity}`} />
            {a.title}
          </div>
          {a.detail && <div className="sp-alerts-detail">{a.detail}</div>}
          {i < alerts.length - 1 && <div style={{ height: 4 }} />}
        </div>
      ))}
    </div>
  );
}
