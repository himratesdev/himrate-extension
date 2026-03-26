import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

interface LangSwitcherProps {
  compact?: boolean;
}

export function LangSwitcher({ compact = false }: LangSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = i18n.language;
  const ref = useRef<HTMLDivElement>(null);

  // N2: Close dropdown on click outside
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
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        className="lang-switch"
        onClick={() => setOpen(!open)}
        aria-label={t('aria.lang')}
        role="button"
        tabIndex={0}
        style={compact ? { padding: '4px 8px' } : undefined}
      >
        <span className="globe" style={compact ? { fontSize: '12px' } : undefined}>&#127760;</span>
        <span className="lang-code" style={compact ? { fontSize: '11px' } : undefined}>{current.toUpperCase()}</span>
        {!compact && <span className="chevron">&#9662;</span>}
      </div>
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
