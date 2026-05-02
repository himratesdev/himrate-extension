// LITERAL PORT — wireframe slim/54_watchlists-search-no-results.html.
// Client-side search filter returned no matches.

import { useTranslation } from 'react-i18next';

interface ListTab { name: string; count: number }
interface Props {
  lists?: ListTab[];
  activeListIndex?: number;
  query?: string;
  avgErv?: number;
  liveCount?: number;
  trackedCount?: number;
  onClearSearch?: () => void;
  onSelectList?: (index: number) => void;
}

const DEFAULT_LISTS: ListTab[] = [
  { name: 'Кандидаты', count: 5 },
  { name: 'Топ', count: 3 },
];

export function Frame54WatchlistsSearchNoResults({
  lists = DEFAULT_LISTS,
  activeListIndex = 0,
  query = 'zzxyz',
  avgErv = 82,
  liveCount = 2,
  trackedCount = 0,
  onClearSearch,
  onSelectList,
}: Props) {
  const { t } = useTranslation();
  return (
    <div className="sp-content" role="tabpanel">
      {/* M1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
        {lists.map((l, i) => (
          <button key={l.name} onClick={() => onSelectList?.(i)}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: i === activeListIndex ? 600 : 500, fontFamily: "'Space Grotesk', sans-serif",
              border: i === activeListIndex ? '2px solid var(--ink-90)' : '2px solid var(--border-dark)', borderRadius: 20,
              background: i === activeListIndex ? 'var(--ink-90)' : 'white', color: i === activeListIndex ? 'white' : 'var(--ink-70)',
              whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >{l.name} ({l.count})</button>
        ))}
      </div>
      {/* Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", padding: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
        <span style={{ color: 'var(--color-erv-green)', fontWeight: 600 }}>Зрит. {avgErv}%</span>
        <span style={{ color: 'var(--ink-20)' }}>·</span>
        <span><span style={{ color: 'var(--color-erv-green)' }}>●</span> {liveCount} live</span>
        <span style={{ color: 'var(--ink-20)' }}>·</span>
        <span>{trackedCount} tracked</span>
      </div>
      {/* Search with query and clear */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 8, top: 7, color: 'var(--ink-30)', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div style={{ width: '100%', padding: '6px 28px 6px 28px', fontSize: 11, fontFamily: "'Inter', sans-serif", border: '2px solid #6366f1', borderRadius: 8, background: 'white', boxSizing: 'border-box', color: 'var(--ink-70)' }}>{query}</div>
        <button onClick={() => onClearSearch?.()} style={{ position: 'absolute', right: 8, top: 6, background: 'none', border: 'none', color: 'var(--ink-30)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      {/* No results */}
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-30)' }}>{t('watchlists.search.no_results')}</div>
      </div>
    </div>
  );
}
