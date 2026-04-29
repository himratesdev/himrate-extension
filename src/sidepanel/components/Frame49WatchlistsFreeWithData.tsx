// LITERAL PORT — wireframe slim/49_watchlists-free-with-data.html.
// M1 Selector + Stats + Search + Filters/Sort (locked) + Cards (5) + Add + Conversion Banner.

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
  isInactive?: boolean;
  hasFollowCta?: boolean;
}

interface Props {
  lists?: ListTab[];
  activeListIndex?: number;
  cards?: ChannelCard[];
  avgErv?: number;
  liveCount?: number;
  trackedCount?: number;
  trackedMax?: number;
  onCreateList?: () => void;
  onAddChannel?: () => void;
  onUpgradeBusiness?: () => void;
  onDismissBanner?: () => void;
  onOpenChannel?: (login: string) => void;
  onFollow?: (login: string) => void;
}

const DEFAULT_LISTS: ListTab[] = [
  { name: 'Кандидаты', count: 5 },
  { name: 'Топ', count: 3 },
  { name: 'Конкуренты', count: 2 },
];

const DEFAULT_CARDS: ChannelCard[] = [
  { login: 'shroud', letter: 'S', avatarBg: 'var(--color-twitch)', online: true, viewerCount: 5200, ervPct: 85, ervColor: 'green', trustValue: 88, tags: ['#fps', '#partner'], updatedLabel: 'Обн. сейчас', hasFollowCta: true },
  { login: 'xQc', letter: 'X', avatarBg: 'var(--color-erv-yellow)', online: true, viewerCount: 42000, ervPct: 62, ervColor: 'yellow', trustValue: 70, tags: ['#variety'], updatedLabel: 'Обн. сейчас', hasFollowCta: true },
  { login: 'pokimane', letter: 'P', avatarBg: 'var(--ink-30)', online: false, offlineLabel: 'Офлайн · 3ч назад', ervPct: 92, ervColor: 'green', trustValue: 90, tags: ['#justchatting', '#partner'], updatedLabel: 'Обн. 3ч назад', opacity: 0.6, hasFollowCta: true },
  { login: 'HasanAbi', letter: 'H', avatarBg: 'var(--ink-30)', online: false, offlineLabel: 'Офлайн · 5 дней назад', ervPct: 78, ervColor: 'green', trustValue: 80, tags: ['#politics'], updatedLabel: 'Обн. 5д назад', opacity: 0.4 },
  { login: 'Amouranth', letter: 'A', avatarBg: 'var(--ink-30)', online: false, offlineLabel: 'Офлайн · 45 дней назад', ervPct: 0, ervColor: 'green', trustValue: 0, opacity: 0.4, isInactive: true },
];

const ervBg = (c: ChannelCard['ervColor']) => c === 'green' ? 'var(--color-erv-green-bg)' : c === 'yellow' ? 'var(--color-erv-yellow-bg)' : 'var(--color-erv-red-bg)';
const ervColor = (c: ChannelCard['ervColor']) => c === 'green' ? 'var(--color-erv-green)' : c === 'yellow' ? 'var(--color-erv-yellow)' : 'var(--color-erv-red)';

export function Frame49WatchlistsFreeWithData({
  lists = DEFAULT_LISTS,
  activeListIndex = 0,
  cards = DEFAULT_CARDS,
  avgErv = 82,
  liveCount = 2,
  trackedCount = 0,
  trackedMax = 5,
  onCreateList,
  onAddChannel,
  onUpgradeBusiness,
  onDismissBanner,
  onOpenChannel,
  onFollow,
}: Props) {
  const [bannerHidden, setBannerHidden] = useState(false);
  const [activeList, setActiveList] = useState(activeListIndex);

  return (
    <div className="sp-content" role="tabpanel">
      {/* M1: Selector */}
      <div style={{ borderBottom: '1px solid var(--border-light)', marginBottom: 8, paddingBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', overflowY: 'hidden', padding: '6px 0', scrollbarWidth: 'none' }}>
          {lists.map((l, i) => (
            <button
              key={l.name}
              onClick={() => setActiveList(i)}
              style={{
                padding: '6px 12px', fontSize: 11, fontWeight: i === activeList ? 600 : 500, fontFamily: "'Space Grotesk', sans-serif",
                border: i === activeList ? '2px solid var(--ink-90)' : '2px solid var(--border-dark)', borderRadius: 20,
                background: i === activeList ? 'var(--ink-90)' : 'white', color: i === activeList ? 'white' : 'var(--ink-70)',
                whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, lineHeight: 1.2,
              }}
            >{l.name} ({l.count})</button>
          ))}
          <button
            onClick={() => onCreateList?.()}
            style={{ padding: '6px 12px', fontSize: 11, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid rgba(99,102,241,0.3)', borderRadius: 20, background: 'rgba(99,102,241,0.05)', color: '#6366f1', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, lineHeight: 1.2 }}
          >+ Создать</button>
          <button title="Переименовать / Удалить" style={{ padding: '4px 6px', fontSize: 14, color: 'var(--ink-30)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1, flexShrink: 0 }}>⋮</button>
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
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--color-erv-green)' }}></span>
            {liveCount}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '6px 8px', textAlign: 'center' }}>
          <div title="Каналов с подпиской Premium/Business" style={{ fontSize: 9, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 1 }}>Tracked</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-50)', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{trackedCount}<span style={{ fontSize: 10, color: 'var(--ink-30)' }}>/{trackedMax}</span></div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 8, top: 7, color: 'var(--ink-30)', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Поиск в&nbsp;списке..." disabled style={{ width: '100%', padding: '6px 10px 6px 28px', fontSize: 11, fontFamily: "'Inter', sans-serif", border: '2px solid var(--border-dark)', borderRadius: 8, background: 'white', boxSizing: 'border-box' }} />
      </div>

      {/* Filters + Sort (locked for Free) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['Фильтры', 'Сортировка'].map((label) => (
          <button key={label} disabled style={{ flex: 1, padding: '5px 10px', fontSize: 10, fontWeight: 500, fontFamily: "'Inter', sans-serif", border: '1.5px solid var(--border-light)', borderRadius: 6, background: 'white', color: 'var(--ink-30)', cursor: 'not-allowed', opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" stroke="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" fill="none" strokeWidth="2" /></svg>
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {cards.map((c) => (
        <div key={c.login}
          onClick={() => onOpenChannel?.(c.login)}
          role="button"
          style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: '10px 12px', marginBottom: 6, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)', cursor: 'pointer', position: 'relative', opacity: c.opacity }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {!c.isInactive && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span title="Estimated Real Viewers" style={{ fontSize: 9, padding: '2px 7px', background: ervBg(c.ervColor), color: ervColor(c.ervColor), borderRadius: 6, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", opacity: c.opacity && c.opacity < 0.5 ? 0.5 : undefined }}>Зрит. {c.ervPct}%</span>
                <span title="Trust Index" style={{ fontSize: 8, padding: '1px 5px', background: c.ervColor === 'green' ? 'rgba(34,197,94,0.06)' : 'rgba(234,179,8,0.06)', color: ervColor(c.ervColor), borderRadius: 4, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", opacity: c.opacity && c.opacity < 0.5 ? 0.5 : undefined }}>Дов. {c.trustValue}</span>
              </div>
            )}
            {c.isInactive && (
              <span style={{ fontSize: 8, padding: '2px 6px', background: 'rgba(0,0,0,0.06)', color: 'var(--ink-30)', borderRadius: 4, fontWeight: 500 }}>Неактивен</span>
            )}
            <button onClick={(e) => { e.stopPropagation(); }} style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: 'var(--ink-30)', fontSize: 14, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>⋮</button>
          </div>
          {c.tags && c.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, paddingTop: 5, borderTop: '1px solid var(--border-light)' }}>
              {c.tags.map((tag) => (
                <span key={tag} style={{ fontSize: 9, padding: '1px 6px', background: 'rgba(0,0,0,0.04)', color: 'var(--ink-50)', borderRadius: 4 }}>{tag}</span>
              ))}
              <span style={{ flex: 1 }}></span>
              <span style={{ fontSize: 9, color: c.opacity === 0.4 ? 'var(--color-erv-yellow)' : 'var(--ink-30)' }}>{c.updatedLabel}</span>
            </div>
          )}
          {c.isInactive && (
            <div style={{ fontSize: 9, color: 'var(--color-erv-yellow)', marginTop: 4 }}>⚠ Данные могут быть неактуальны</div>
          )}
          {c.hasFollowCta && (
            <button onClick={(e) => { e.stopPropagation(); onFollow?.(c.login); }} style={{ width: '100%', marginTop: 6, padding: 5, fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: 6, background: 'rgba(99,102,241,0.04)', color: '#6366f1', cursor: 'pointer' }}>Следить — $9.99/мес</button>
          )}
        </div>
      ))}

      <button onClick={() => onAddChannel?.()} className="btn btn-secondary" style={{ fontSize: 11, padding: 8, width: '100%', marginTop: 4 }}>+ Добавить канал</button>

      {/* Conversion Banner */}
      {!bannerHidden && cards.length >= 5 && (
        <div style={{ marginTop: 10, padding: '14px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1e5e 100%)', border: '2.5px solid #1a1a1a', color: 'white', position: 'relative', boxShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Business · для&nbsp;агентств</div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'white', marginBottom: 4, lineHeight: 1.3 }}>5 каналов в&nbsp;watchlist — пора перейти на&nbsp;Business</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: 10 }}>Мониторьте до&nbsp;50 каналов одновременно, сравнивайте до&nbsp;5 в&nbsp;одном отчёте, экспортируйте PDF клиентам, получайте API-доступ для&nbsp;своих дашбордов.</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => onUpgradeBusiness?.()} style={{ flex: 1, padding: '8px 14px', fontSize: 11, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid white', borderRadius: 8, background: 'white', color: '#1a1a1a', cursor: 'pointer' }}>Попробовать Business</button>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', fontWeight: 700, whiteSpace: 'nowrap' }}>$99/мес</span>
          </div>
          <button title="Скрыть на 1 день" onClick={() => { setBannerHidden(true); onDismissBanner?.(); }} style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 2 }}>×</button>
        </div>
      )}
    </div>
  );
}
