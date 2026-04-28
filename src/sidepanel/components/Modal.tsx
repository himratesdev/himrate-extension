// BUG-016 PR-1 Section 11: Generic canonical Modal helper.
// Wireframe: side-panel-wireframe-TASK-039.html sp-modal-overlay + sp-modal
// + sp-modal-header + sp-modal-title + sp-modal-close + sp-modal-body + sp-modal-footer.
// Modal renders inside the panel (position:absolute inside Side Panel root).

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Background dim opacity. Defaults to 0.5 per canonical .sp-modal-overlay. */
  dim?: number;
}

export function Modal({ title, onClose, children, footer, dim }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="sp-modal-overlay"
      style={dim != null ? { background: `rgba(0,0,0,${dim})` } : undefined}
      onClick={onClose}
      role="presentation"
    >
      <div className="sp-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sp-modal-header">
          <span className="sp-modal-title">{title}</span>
          <button
            className="sp-modal-close"
            onClick={onClose}
            aria-label={t('aria.dismiss')}
          >
            ×
          </button>
        </div>
        <div className="sp-modal-body">{children}</div>
        {footer && <div className="sp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
