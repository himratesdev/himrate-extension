// BUG-016 PR-1 (Section 1 of wireframe): "Вы не на Twitch" state.
// Canonical wireframe: side-panel-wireframe-TASK-039.html lines 1290-1326.
// Pixel-match: state-icon.twitch-icon + state-title + state-subtitle + search-input.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NotTwitchOverview() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  // Search submit → open Twitch search in new tab. Real popup-search overlay
  // wiring is owned by TASK-034 search/discovery; this surface routes the user
  // to Twitch directory which already supports streamer search.
  const submitSearch = () => {
    const term = query.trim();
    if (!term) return;
    chrome.tabs.create({ url: `https://www.twitch.tv/search?term=${encodeURIComponent(term)}` });
  };

  return (
    <div className="state-center">
      <div className="state-icon twitch-icon sp-state-icon-lg">
        <span className="sp-state-icon-letter">H</span>
      </div>
      <div className="state-title sp-state-title-sm">{t('not_twitch.title')}</div>
      <div className="state-subtitle sp-state-subtitle-narrow">
        {t('not_twitch.subtitle')}
      </div>
      <input
        type="text"
        className="search-input sp-search-input-full"
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submitSearch();
        }}
        aria-label={t('search.placeholder')}
      />
    </div>
  );
}
