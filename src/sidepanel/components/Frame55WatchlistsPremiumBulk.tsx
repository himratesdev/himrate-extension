// LITERAL PORT — wireframe slim/55_watchlists-premium-bulk-actions.html.
// Premium with active Filters/Sort, 2 selected → M3 Bulk Bar (Compare, Export PDF, Deselect).

import { useState } from 'react';

interface ListTab { name: string; count: number }
interface ChannelCard {
  login: string;
  letter: string;
  avatarBg: string;
  online: boolean;
  viewerCount?: number;
  offlineLabel?: string;
  ervPct: number;
  ervColor: 'green' | 'yellow' | 'red';
  trustValue: number;
  tags?: string[];
  updatedLabel?: string;
  opacity?: number;
}

interface Props {
  lists?: ListTab[];
  activeListIndex?: number;
  cards?: ChannelCard[];
  selectedLogins?: string[];
  avgErv?: number;
  liveCount?: number;
  trackedCount?: number;
  trackedMax?: number;
  filtersCount?: number;
  sortLabel?: string;
  onCreateList?: () => void;
  onCompare?: () => void;
  onExportPdf?: () => void;
  onDeselectAll?: () => void;
  onToggleSelection?: (login: string) => void;
  onOpenFilters?: () => void;
  onOpenSort?: () => void;
  onOpenChannel?: (login: string) => void;
  onListMenu?: () => void;
  onChannelMenu?: (login: string) => void;
}

const DEFAULT_LISTS: ListTab[] = [
  { name: 'Кандидаты', count: 8 },
  { name: 'Топ', count: 5 },
  { name: 'Q2', count: 12 },
  { name: 'Архив', count: 3 },
];

const DEFAULT_CARDS: ChannelCard[] = [
  { login: 'shroud', letter: 'S', avatarBg: 'var(--color-twitch)', online: true, viewerCount: 5200, ervPct: 85, ervColor: 'green', trustValue: 88, tags: ['#fps', '#partner'], updatedLabel: 'Обн. сейчас' },
  { login: 'xQc', letter: 'X', avatarBg: 'var(--color-erv-yellow)', online: true, viewerCount: 42000, ervPct: 62, ervColor: 'yellow', trustValue: 70, tags: ['#variety', '#gambling'], updatedLabel: 'Обн. сейчас' },
  { login: 'pokimane', letter: 'P', avatarBg: 'var(--ink-30)', online: false, offlineLabel: 'Офлайн · 3ч назад', ervPct: 92, ervColor: 'green', trustValue: 90, opacity: 0.6 },
];

const ervBg = (c: ChannelCard['ervColor']) => c === 'green' ? 'var(--color-erv-green-bg)' : c === 'yellow' ? 'var(--color-erv-yellow-bg)' : 'var(--color-erv-red-bg)';
const ervColor = (c: ChannelCard['ervColor']) => c === 'green' ? 'var(--color-erv-green)' : c === 'yellow' ? 'var(--color-erv-yellow)' : 'var(--color-erv-red)';

export function Frame55WatchlistsPremiumBulk({
  lists = DEFAULT_LISTS,
  activeListIndex = 0,
  cards = DEFAULT_CARDS,
  selectedLogins = ['shroud', 'xQc'],
  avgErv = 78,
  liveCount = 3,
  trackedCount = 4,
  trackedMax = 8,
  filtersCount = 2,
  sortLabel = 'Зрит.%↓',
  onCreateList,
  onCompare,
  onExportPdf,
  onDeselectAll,
  onToggleSelection,
  onOpenFilters,
  onOpenSort,
  onOpenChannel,
  onListMenu,
  onChannelMenu,
}: Props) {
  const [activeList, setActiveList] = useState(activeListIndex);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedLogins));

  const toggleSelection = (login: string) => {
    const next = new Set(selected);
    if (next.has(login)) next.delete(login); else next.add(login);
    setSelected(next);
    onToggleSelection?.(login);
  };

  const handleDeselect = () => {
    setSelected(new Set());
    onDeselectAll?.();
  };

  return (
    <>
      <div className="sp-content" role="tabpanel">
        {/* M1: Selector */}
        <div style={{ borderBottom: '1px solid var(--border-light)', marginBottom: 8, paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', overflowY: 'hidden', padding: '6px 0', scrollbarWidth: 'none' }}>
            {lists.map((l, i) => (
              <button key={l.name} onClick={() => setActiveList(i)}
                style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: i === activeList ? 600 : 500, fontFamily: "'Space Grotesk', sans-serif",
                  border: i === activeList ? '2px solid var(--ink-90)' : '2px solid var(--border-dark)', borderRadius: 20,
                  background: i === activeList ? 'var(--ink-90)' : 'white', color: i === activeList ? 'white' : 'var(--ink-70)',
                  whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.2, cursor: 'pointer',
                }}
              >{l.name} ({l.count})</button>
            ))}
            <button onClick={() => onCreateList?.()} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid rgba(99,102,241,0.3)', borderRadius: 20, background: 'rgba(99,102,241,0.05)', color: '#6366f1', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.2, cursor: 'pointer' }}>+ Создать</button>
            <button onClick={() => onListMenu?.()} title="Переименовать / Удалить" style={{ padding: '4px 6px', fontSize: 14, color: 'var(--ink-30)', background: 'none', border: 'none', lineHeight: 1, flexShrink: 0, cursor: 'pointer' }}>⋮</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, padding: '0 0 10px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
          <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div title="Средний ERV по списку" style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Средний ERV</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-erv-green)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{avgErv}%</div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Онлайн</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-erv-green)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-erv-green)' }}></span>{liveCount}
            </div>
          </div>
          <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
            <div title="Каналов с подпиской Premium/Business" style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Tracked</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{trackedCount}<span style={{ fontSize: 10, color: 'var(--ink-30)' }}>/{trackedMax}</span></div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 8, top: 7, color: 'var(--ink-30)', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Поиск в&nbsp;списке..." style={{ width: '100%', padding: '6px 10px 6px 28px', fontSize: 11, fontFamily: "'Inter', sans-serif", border: '2px solid var(--border-dark)', borderRadius: 8, background: 'white', boxSizing: 'border-box' }} />
        </div>

        {/* Filters + Sort (active for Premium) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          <button onClick={() => onOpenFilters?.()} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid var(--ink-90)', borderRadius: 8, background: 'white', color: 'var(--ink-90)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, boxShadow: '2px 2px 0 rgba(0,0,0,0.08)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Фильтры
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: '#6366f1' }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#6366f1' }}></span>{filtersCount}
            </span>
          </button>
          <button onClick={() => onOpenSort?.()} style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid var(--ink-90)', borderRadius: 8, background: 'white', color: 'var(--ink-90)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, boxShadow: '2px 2px 0 rgba(0,0,0,0.08)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}><path d="M3 6h18M6 12h12M10 18h4" /></svg>
              Сортировка
            </span>
            <span style={{ fontSize: 9, color: 'var(--color-erv-green)', fontFamily: "'JetBrains Mono', monospace" }}>{sortLabel}</span>
          </button>
        </div>

        {/* Cards */}
        {cards.map((c) => {
          const isSelected = selected.has(c.login);
          return (
            <div key={c.login} role="button" onClick={() => onOpenChannel?.(c.login)}
              style={{
                border: isSelected ? '2.5px solid #6366f1' : '2.5px solid var(--border-dark)', borderRadius: 10, padding: '10px 12px', marginBottom: 6,
                background: isSelected ? 'rgba(99,102,241,0.03)' : 'white',
                boxShadow: isSelected ? '2px 2px 0 rgba(99,102,241,0.1)' : '2px 2px 0 rgba(0,0,0,0.06)',
                cursor: 'pointer', position: 'relative', opacity: c.opacity,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div onClick={(e) => { e.stopPropagation(); toggleSelection(c.login); }} role="button" aria-checked={isSelected}
                  style={{ width: 16, height: 16, borderRadius: 4, background: isSelected ? '#6366f1' : 'white', border: isSelected ? '2px solid #6366f1' : '2px solid var(--ink-30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                  {isSelected && (
                    <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, fill: 'none', stroke: 'white', strokeWidth: 3 }}><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.letter}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{c.login}</div>
                  {c.online ? (
                    <div style={{ fontSize: 10, color: 'var(--ink-50)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: c.ervColor === 'green' ? 'var(--color-erv-green)' : 'var(--color-erv-yellow)' }}></span>
                      Онлайн · {c.viewerCount?.toLocaleString()} зр.
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: 'var(--ink-30)' }}>{c.offlineLabel}</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <span style={{ fontSize: 9, padding: '2px 7px', background: ervBg(c.ervColor), color: ervColor(c.ervColor), borderRadius: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>Зрит. {c.ervPct}%</span>
                  <span style={{ fontSize: 8, padding: '1px 5px', background: c.ervColor === 'green' ? 'rgba(34,197,94,0.06)' : 'rgba(234,179,8,0.06)', color: ervColor(c.ervColor), borderRadius: 4, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>Дов. {c.trustValue}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onChannelMenu?.(c.login); }} title="Действия с каналом" style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: 'var(--ink-30)', fontSize: 14, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>⋮</button>
              </div>
              {c.tags && c.tags.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, paddingTop: 5, borderTop: isSelected ? '1px solid rgba(99,102,241,0.15)' : '1px solid var(--border-light)' }}>
                  {c.tags.map((tag) => (
                    <span key={tag} style={{ fontSize: 9, padding: '1px 6px', background: 'rgba(0,0,0,0.04)', color: 'var(--ink-50)', borderRadius: 4 }}>{tag}</span>
                  ))}
                  <span style={{ flex: 1 }}></span>
                  <span style={{ fontSize: 9, color: 'var(--ink-30)' }}>{c.updatedLabel}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* M3: Bulk Actions Bar */}
      {selected.size > 0 && (
        <div style={{ padding: '10px 14px', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#ffffff', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>{selected.size} выбрано</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => onCompare?.()} style={{ padding: '5px 10px', fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid #ffffff', borderRadius: 6, background: '#ffffff', color: '#1a1a1a', cursor: 'pointer' }}>Сравнить</button>
            <button onClick={() => onExportPdf?.()} style={{ padding: '5px 10px', fontSize: 10, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 6, background: 'transparent', color: '#ffffff', cursor: 'pointer' }}>Экспорт PDF</button>
            <button onClick={handleDeselect} style={{ padding: '5px 8px', fontSize: 10, fontWeight: 500, fontFamily: "'Inter', sans-serif", border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>Снять</button>
          </div>
        </div>
      )}
    </>
  );
}
