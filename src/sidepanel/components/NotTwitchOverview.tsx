// BUG-016 PR-1 (Section 1 of wireframe): "Вы не на Twitch" state.
// Canonical wireframe: side-panel-wireframe-TASK-039.html lines 1290-1326.
// Pixel-match: state-icon.twitch-icon + state-title + state-subtitle + search-input.
//
// Search input is visual-only здесь. Wiring search handler (open SearchOverlay) — отдельный
// follow-up; sidepanel context может либо open popup search либо inline overlay.

import { useTranslation } from 'react-i18next';

export function NotTwitchOverview() {
  const { t } = useTranslation();

  return (
    <div className="state-center">
      <div className="state-icon twitch-icon" style={{ width: '48px', height: '48px', fontSize: '22px' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>H</span>
      </div>
      <div className="state-title" style={{ fontSize: '15px' }}>{t('not_twitch.title')}</div>
      <div className="state-subtitle" style={{ maxWidth: '240px' }}>
        {t('not_twitch.subtitle')}
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={t('search.placeholder')}
        style={{ width: '100%' }}
      />
    </div>
  );
}
