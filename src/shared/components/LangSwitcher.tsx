// Compact mode: renders canonical sp-header-icon button (globe SVG) for use в Side Panel header.
// Non-compact mode: legacy lang-switch + RU code + chevron (used в popup).
// Wireframe ref: side-panel-wireframe-TASK-039.html sp-header-right (frames 01, 03, 06+...).

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

interface LangSwitcherProps {
  compact?: boolean;
}

function GlobeIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function LangSwitcher({ compact = false }: LangSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = i18n.language;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleChange = async (locale: string) => {
    await changeLanguage(locale);
    setOpen(false);
  };

  return (
    <div ref={ref} className="lang-switch-wrapper">
      {compact ? (
        <button
          className="sp-header-icon"
          onClick={() => setOpen(!open)}
          aria-label={t('aria.lang')}
        >
          <GlobeIcon />
        </button>
      ) : (
        <div
          className="lang-switch"
          onClick={() => setOpen(!open)}
          aria-label={t('aria.lang')}
          role="button"
          tabIndex={0}
        >
          <span className="globe">&#127760;</span>
          <span className="lang-code">{current.toUpperCase()}</span>
          <span className="chevron">&#9662;</span>
        </div>
      )}
      {open && (
        <div className="lang-dropdown">
          <button
            className={`lang-dropdown-item${current === 'ru' ? ' active' : ''}`}
            onClick={() => handleChange('ru')}
          >
            &#127479;&#127482; Русский {current === 'ru' && '\u2713'}
          </button>
          <button
            className={`lang-dropdown-item${current === 'en' ? ' active' : ''}`}
            onClick={() => handleChange('en')}
          >
            &#127468;&#127463; English {current === 'en' && '\u2713'}
          </button>
        </div>
      )}
    </div>
  );
}
