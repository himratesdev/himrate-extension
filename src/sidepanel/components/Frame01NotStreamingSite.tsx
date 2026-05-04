// Frame 01 — NotStreaming · Site
// Literal port от wireframes/frames/01_NotStreaming_Site.html (extracted from
// side-panel-wireframe-TASK-039.html lines 1293-1322).
// User не на twitch.tv → search overlay для перехода к каналу.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  /** Optional override для navigation; default = chrome.tabs.create к twitch search. */
  onSearch?: (term: string) => void;
}

export function Frame01NotStreamingSite({ onSearch }: Props = {}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const submitSearch = () => {
    const term = query.trim();
    if (!term) return;
    if (onSearch) {
      onSearch(term);
    } else {
      chrome.tabs.create({ url: `https://www.twitch.tv/search?term=${encodeURIComponent(term)}` });
    }
  };

  return (
    // <div class="sp-content" style="justify-content:center;align-items:center;text-align:center;gap:14px;">
    <div
      className="sp-content"
      role="tabpanel"
      style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '14px' }}
    >
      {/* <div class="state-icon twitch-icon" style="width:48px;height:48px;font-size:22px;"> */}
      <div className="state-icon twitch-icon" style={{ width: '48px', height: '48px', fontSize: '22px' }}>
        {/* <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;">H</span> */}
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>H</span>
      </div>
      {/* <div class="state-title" style="font-size:15px;">Вы не на Twitch</div> */}
      <div className="state-title" style={{ fontSize: '15px' }}>{t('not_twitch.title')}</div>
      {/* <div class="state-subtitle" style="max-width:240px;">...</div> */}
      <div className="state-subtitle" style={{ maxWidth: '240px' }}>
        {t('not_twitch.subtitle')}
      </div>
      {/* <input type="text" class="search-input" placeholder="Поиск стримера..." style="width:100%;"> */}
      <input
        type="text"
        className="search-input"
        placeholder={t('search.placeholder')}
        style={{ width: '100%' }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
        aria-label={t('search.placeholder')}
      />
    </div>
  );
}
