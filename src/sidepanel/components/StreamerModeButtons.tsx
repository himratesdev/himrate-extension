// TASK-035 FR-008: Streamer Mode action buttons.
// Generate Badge / View Channel Card / Request Verification.
// Badge + Card open modal placeholders. Verify shows remaining count.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  channelId: string | null;
  login: string;
}

export function StreamerModeButtons({ channelId, login: _login }: Props) {
  const { t } = useTranslation();
  const [modal, setModal] = useState<'badge' | 'card' | null>(null);
  const [verifyRequested, setVerifyRequested] = useState(false);

  // Placeholder remaining count — will be driven by API in future task
  const verificationsRemaining = 3;

  return (
    <div className="sp-streamer-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Badge modal placeholder */}
      <button
        className="btn btn-secondary"
        style={{ fontSize: '12px' }}
        onClick={() => setModal('badge')}
        disabled={!channelId}
      >
        {t('sp.generate_badge') || 'Generate Badge'}
      </button>

      {/* Channel Card modal placeholder */}
      <button
        className="btn btn-secondary"
        style={{ fontSize: '12px' }}
        onClick={() => setModal('card')}
        disabled={!channelId}
      >
        {t('sp.view_channel_card') || 'View Channel Card'}
      </button>

      {/* Request Verification */}
      <button
        className={`btn ${verifyRequested ? 'btn-submitted' : 'btn-request'}`}
        style={{ fontSize: '12px' }}
        onClick={() => setVerifyRequested(true)}
        disabled={verifyRequested || verificationsRemaining <= 0}
      >
        {verifyRequested
          ? (t('not_tracked.submitted_btn'))
          : `${t('sp.request_verification') || 'Request Verification'} (${verificationsRemaining})`}
      </button>

      {/* Modal placeholder */}
      {modal && (
        <div
          className="sp-modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setModal(null)}
        >
          <div
            className="sp-modal"
            style={{ background: '#fff', border: '2px solid #111', borderRadius: '8px', padding: '24px', minWidth: '260px', maxWidth: '320px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>
              {modal === 'badge' ? (t('sp.generate_badge') || 'Generate Badge') : (t('sp.view_channel_card') || 'View Channel Card')}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
              {t('tab.placeholder_suffix') || '— coming soon'}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', fontSize: '12px' }} onClick={() => setModal(null)}>
              {t('sp.no') || 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
