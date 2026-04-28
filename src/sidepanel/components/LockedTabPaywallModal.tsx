// BUG-016 PR-1 Section 11: Locked tab paywall modal (wireframe lines 3773-3805).
// Wireframe: sp-modal-overlay (dim 0.4) + sp-modal with title=tab name +
// purple reputation icon + "Обновите до Premium" body + "Обновить — $9.99/мес" CTA.

import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface Props {
  tabName: string;
  onClose: () => void;
  onUpgrade: () => void;
}

const PURPLE_DARK = '#7C3AED';

function LockIcon() {
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      style={{ width: 28, height: 28, stroke: PURPLE_DARK, opacity: 0.3 }}
      aria-hidden="true"
    >
      <rect x="18" y="3" width="4" height="18" rx="1" fill="rgba(139,92,246,0.3)" stroke={PURPLE_DARK} />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="rgba(139,92,246,0.2)" stroke={PURPLE_DARK} />
      <rect x="2" y="13" width="4" height="8" rx="1" fill="rgba(139,92,246,0.15)" stroke={PURPLE_DARK} />
    </svg>
  );
}

export function LockedTabPaywallModal({ tabName, onClose, onUpgrade }: Props) {
  const { t } = useTranslation();

  return (
    <Modal title={tabName} onClose={onClose} dim={0.4}>
      <div className="sp-modal-content-centered">
        <LockIcon />
        <div className="sp-modal-headline">{t('sp.locked_paywall_title')}</div>
        <div className="sp-modal-subtext">{t('sp.locked_paywall_subtitle')}</div>
        <button className="btn btn-primary sp-modal-action" onClick={onUpgrade}>
          {t('sp.locked_paywall_cta')}
        </button>
      </div>
    </Modal>
  );
}
