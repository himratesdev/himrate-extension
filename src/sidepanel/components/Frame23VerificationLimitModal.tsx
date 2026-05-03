// LITERAL PORT — wireframe slim/23_zapros-na-proverku-limit-ischerpan.html.
// Verification limit reached — informational modal с close button.

import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface Props {
  onClose: () => void;
}

export function Frame23VerificationLimitModal({ onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('sp.modal_verification_limit_title')}
      onClose={onClose}
      footer={
        <button className="btn btn-primary" onClick={onClose}>
          {t('sp.verification_limit_close')}
        </button>
      }
    >
      {/* Warning icon centered */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div
          className="state-icon error-icon"
          style={{
            width: 48,
            height: 48,
            fontSize: 22,
            margin: '0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >!</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-50)', textAlign: 'center', lineHeight: 1.5 }}>
        {t('sp.verification_limit_message')}
      </div>
    </Modal>
  );
}
