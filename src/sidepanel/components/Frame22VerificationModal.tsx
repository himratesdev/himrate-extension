// LITERAL PORT — wireframe slim/22_zapros-na-proverku.html.
// Verification request form: textarea (limit 500 chars) + char counter + submit/cancel.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface Props {
  requestsUsed: number;
  onClose: () => void;
  onSubmit: (message: string) => void | Promise<void>;
}

const MIN_CHARS = 50;
const MAX_CHARS = 500;

export function Frame22VerificationModal({ requestsUsed, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const charCount = message.length;
  const canSubmit = charCount >= MIN_CHARS && charCount <= MAX_CHARS && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(message);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t('sp.modal_verification_title')}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {t('sp.verification_cancel')}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? '...' : t('sp.verification_submit')}
          </button>
        </>
      }
    >
      <div style={{ fontSize: 12, color: 'var(--ink-50)', marginBottom: 8 }}>
        {t('sp.tools_verification_desc')}
      </div>
      <textarea
        className="sp-verification-textarea"
        placeholder={t('sp.verification_textarea_placeholder')}
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
        maxLength={MAX_CHARS}
        rows={6}
        style={{
          width: '100%',
          padding: '8px 10px',
          fontSize: 12,
          fontFamily: "'Inter', sans-serif",
          border: '1.5px solid var(--border-light)',
          borderRadius: 6,
          resize: 'vertical',
          minHeight: 100,
        }}
      />
      <div
        style={{
          fontSize: 10,
          color: charCount < MIN_CHARS ? 'var(--color-erv-red)' : 'var(--ink-30)',
          textAlign: 'right',
          marginTop: 4,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {t('sp.verification_chars', { used: charCount, limit: MAX_CHARS })}
      </div>
      <div style={{ fontSize: 10, color: 'var(--ink-30)', marginTop: 6 }}>
        {t('sp.verification_quota', { used: requestsUsed })}
      </div>
    </Modal>
  );
}
