// BUG-016 PR-1 Section 6: AudiencePreview new component (wireframe lines 2076-2097).
// Wireframe: side-panel-wireframe-TASK-039.html sp-audience.
// Canonical: sp-audience + sp-audience-header + sp-audience-title + sp-audience-more
// + sp-audience-row + sp-audience-flag + sp-audience-country + sp-audience-pct.
// Top 3 countries from trust_cache.top_countries. Uses Intl.DisplayNames for country names.

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Country {
  country_code: string;
  percentage: number;
  viewer_count: number;
}

interface Props {
  countries: Country[] | null;
  onNavigate?: (tab: string) => void;
}

function flagEmoji(code: string): string {
  if (code.length !== 2) return '🏳️';
  const A = 0x1f1e6;
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    A + upper.charCodeAt(0) - 'A'.charCodeAt(0),
    A + upper.charCodeAt(1) - 'A'.charCodeAt(0),
  );
}

export function AudiencePreview({ countries, onNavigate }: Props) {
  const { t, i18n } = useTranslation();

  const displayNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([i18n.language || 'en'], { type: 'region' });
    } catch {
      return null;
    }
  }, [i18n.language]);

  if (!countries || countries.length === 0) return null;

  const top3 = countries.slice(0, 3);

  return (
    <div className="sp-audience">
      <div className="sp-audience-header">
        <span className="sp-audience-title">{t('sp.audience_preview')}</span>
        <a
          href="#"
          className="sp-audience-more"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.('audience');
          }}
        >
          {t('sp.more')}
        </a>
      </div>
      {top3.map((c) => (
        <div key={c.country_code} className="sp-audience-row">
          <span className="sp-audience-flag">{flagEmoji(c.country_code)}</span>
          <span className="sp-audience-country">
            {displayNames?.of(c.country_code) || c.country_code}
          </span>
          <span className="sp-audience-pct">{Math.round(c.percentage)}%</span>
        </div>
      ))}
    </div>
  );
}
