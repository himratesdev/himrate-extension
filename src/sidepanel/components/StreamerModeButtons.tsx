// BUG-016 PR-1 Section 8: Streamer tools accordion canonical (wireframe lines 2966-3000).
// Wireframe: side-panel-wireframe-TASK-039.html "Streamer Tools (accordion)".
// Canonical: sp-signals container (gap:0) + sp-signals-title + sp-signal-row.expandable
// + sp-signal-detail with title + description + sp-streamer-btn.{primary/secondary}.
// Three tools: Бейдж доверия (badge generator) / Карточка канала (channel card)
// / Запрос на проверку (verification request with 5/mo usage counter).

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface Props {
  channelId: string | null;
  login: string;
}

const VERIFICATION_LIMIT = 5;

function BadgeIcon() {
  return (
    <svg className="ico ico-xs" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      style={{ width: 12, height: 12, verticalAlign: '-0.1em' }}
      aria-hidden="true"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function VerifyIcon() {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      style={{ width: 13, height: 13, verticalAlign: '-0.1em' }}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22,4 12,13 2,4" />
    </svg>
  );
}

type Tool = 'badge' | 'card' | 'verify';

export function StreamerModeButtons({ channelId, login: _login }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Set<Tool>>(new Set());
  const [verifyRequested, setVerifyRequested] = useState(false);
  const [modal, setModal] = useState<'badge' | 'card' | null>(null);

  // Placeholder usage — driven by API in future task (verification quota endpoint)
  const verificationsUsed = verifyRequested ? 3 : 2;
  const verificationsRemaining = VERIFICATION_LIMIT - verificationsUsed;

  const toggle = (tool: Tool) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  };

  return (
    <div className="sp-signals" style={{ gap: 0 }}>
      <div className="sp-signals-title">{t('sp.streamer_tools_title')}</div>

      {/* 1. Бейдж доверия */}
      <div
        className="sp-signal-row sp-signal-expandable"
        style={{ padding: '8px 0' }}
        onClick={() => toggle('badge')}
        role="button"
        aria-expanded={expanded.has('badge')}
      >
        <span style={{ fontSize: 11, fontWeight: 600 }}>
          <BadgeIcon /> {t('sp.streamer_badge_label')}
        </span>
        <span className={`sp-signal-expand-icon${expanded.has('badge') ? ' open' : ''}`}>▾</span>
      </div>
      {expanded.has('badge') && (
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('sp.streamer_badge_title')}</div>
          {t('sp.streamer_badge_desc')}
          <button
            className="sp-streamer-btn primary"
            style={{ marginTop: 6 }}
            onClick={() => setModal('badge')}
            disabled={!channelId}
          >
            {t('sp.streamer_badge_action')}
          </button>
        </div>
      )}

      {/* 2. Карточка канала */}
      <div
        className="sp-signal-row sp-signal-expandable"
        style={{ padding: '8px 0' }}
        onClick={() => toggle('card')}
        role="button"
        aria-expanded={expanded.has('card')}
      >
        <span style={{ fontSize: 11, fontWeight: 600 }}>
          <CardIcon /> {t('sp.streamer_card_label')}
        </span>
        <span className={`sp-signal-expand-icon${expanded.has('card') ? ' open' : ''}`}>▾</span>
      </div>
      {expanded.has('card') && (
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('sp.streamer_card_title')}</div>
          {t('sp.streamer_card_desc')}
          <button
            className="sp-streamer-btn secondary"
            style={{ marginTop: 6 }}
            onClick={() => setModal('card')}
            disabled={!channelId}
          >
            {t('sp.streamer_card_action')}
          </button>
        </div>
      )}

      {/* 3. Запрос на проверку */}
      <div
        className="sp-signal-row sp-signal-expandable"
        style={{ padding: '8px 0' }}
        onClick={() => toggle('verify')}
        role="button"
        aria-expanded={expanded.has('verify')}
      >
        <span style={{ fontSize: 11, fontWeight: 600 }}>
          <VerifyIcon /> {t('sp.streamer_verify_label')}
        </span>
        <span className={`sp-signal-expand-icon${expanded.has('verify') ? ' open' : ''}`}>▾</span>
      </div>
      {expanded.has('verify') && (
        <div className="sp-signal-detail">
          <div className="sp-signal-detail-title">{t('sp.streamer_verify_title')}</div>
          {t('sp.streamer_verify_desc')}
          <div className="sp-streamer-limit" style={{ marginTop: 4 }}>
            {t('sp.streamer_verify_usage', {
              used: verificationsUsed,
              limit: VERIFICATION_LIMIT,
            })}
          </div>
          <button
            className={`sp-streamer-btn secondary${verificationsRemaining <= 0 ? ' disabled' : ''}`}
            style={{ marginTop: 6 }}
            onClick={() => setVerifyRequested(true)}
            disabled={verifyRequested || verificationsRemaining <= 0}
          >
            {verifyRequested
              ? t('not_tracked.submitted_btn')
              : t('sp.streamer_verify_action')}
          </button>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'badge' ? t('sp.streamer_badge_action') : t('sp.streamer_card_action')}
          onClose={() => setModal(null)}
        >
          <div style={{ fontSize: 12, color: 'var(--ink-50)', textAlign: 'center', padding: '24px 0' }}>
            {t('tab.placeholder_suffix')}
          </div>
        </Modal>
      )}
    </div>
  );
}
