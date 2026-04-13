// TASK-035 FR-015: "Channel not tracked" screen for Overview tab.
// Shows CCV if live. "Request tracking" button. Requires login to submit.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';

interface Props {
  ccv: number | null;
  login: string;
  loggedIn: boolean;
}

export function NotTrackedOverview({ ccv, login, loggedIn }: Props) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (submitted || loading) return;

    if (!loggedIn) {
      chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
      return;
    }

    setLoading(true);
    const result = await api.requestTracking(login);
    setLoading(false);

    if (result) setSubmitted(true);
  };

  return (
    <div
      className="sp-not-tracked"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 20px',
        gap: '12px',
        textAlign: 'center',
        flex: 1,
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px dashed #9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          color: '#9ca3af',
          fontWeight: 700,
        }}
      >
        ?
      </div>

      <div style={{ fontWeight: 700, fontSize: '14px' }}>{t('not_tracked.badge')}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '220px' }}>
        {t('not_tracked.tooltip')}
      </div>

      {ccv != null && (
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
          {t('not_tracked.platform_viewers', { N: ccv.toLocaleString() })}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <button
        className={`btn ${submitted ? 'btn-submitted' : 'btn-request'}`}
        style={{ width: '100%' }}
        onClick={handleRequest}
        disabled={submitted || loading}
      >
        {loading ? '...' : submitted ? t('not_tracked.submitted_btn') : t('not_tracked.request_btn')}
      </button>

      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
        {t('not_tracked.request_hint')}
      </div>

      {!loggedIn && (
        <button
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '12px' }}
          onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}
        >
          {t('auth.login')}
        </button>
      )}
    </div>
  );
}
