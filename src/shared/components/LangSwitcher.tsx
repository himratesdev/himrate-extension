import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';

export function LangSwitcher() {
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
      <button
        onClick={() => setOpen(!open)}
        aria-label={t('aria.lang')}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontSize: '11px', color: '#525252', cursor: 'pointer',
          background: 'none', border: 'none', padding: '4px 8px',
          borderRadius: '4px',
        }}
      >
        <span>🌐</span>
        <span>{current.toUpperCase()}</span>
        <span>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 10,
          background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: '8px',
          padding: '4px', minWidth: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <button
            onClick={() => handleChange('ru')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '6px 8px', border: 'none', background: current === 'ru' ? '#F3F4F6' : 'transparent',
              cursor: 'pointer', borderRadius: '4px', fontSize: '12px',
            }}
          >
            🇷🇺 Русский {current === 'ru' && '✓'}
          </button>
          <button
            onClick={() => handleChange('en')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
              padding: '6px 8px', border: 'none', background: current === 'en' ? '#F3F4F6' : 'transparent',
              cursor: 'pointer', borderRadius: '4px', fontSize: '12px',
            }}
          >
            🇬🇧 English {current === 'en' && '✓'}
          </button>
        </div>
      )}
    </div>
  );
}
