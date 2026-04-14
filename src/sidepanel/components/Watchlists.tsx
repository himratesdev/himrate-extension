// TASK-036: Watchlists tab — M1 Selector + Stats Row + Search + M2 Cards + M3 Bulk Actions + Conversion Banner.
// Replaces PlaceholderTab for 'watchlists' tab.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../shared/api';
import type { WatchlistItem, WatchlistChannel } from '../../shared/api';

interface Props {
  tier: string;
  authState: { loggedIn: boolean; tier: string };
}

// FR-026: Freshness label from last_ti_at
function freshnessLabel(lastTiAt: string | null, t: (key: string, opts?: Record<string, unknown>) => string): { text: string; color: string } {
  if (!lastTiAt) return { text: t('wl.stale_data'), color: '#D97706' };
  const hours = (Date.now() - new Date(lastTiAt).getTime()) / 3_600_000;
  if (hours < 1) return { text: t('wl.freshness_now'), color: '#9CA3AF' };
  if (hours < 24) return { text: t('wl.freshness_hours', { n: Math.floor(hours) }), color: '#9CA3AF' };
  const days = Math.floor(hours / 24);
  if (days <= 30) return { text: t('wl.freshness_days', { n: days }), color: '#D97706' };
  return { text: t('wl.stale_data'), color: '#D97706' };
}

// BR-010: Card opacity by status
function cardOpacity(ch: WatchlistChannel): number {
  if (ch.is_live) return 1.0;
  if (!ch.last_stream_at) return 0.4;
  const days = (Date.now() - new Date(ch.last_stream_at).getTime()) / 86_400_000;
  if (days < 1) return 0.6;
  return 0.4;
}

// ERV color
function ervColor(pct: number | null): string {
  if (pct == null) return '#9CA3AF';
  if (pct >= 80) return '#059669';
  if (pct >= 50) return '#D97706';
  return '#DC2626';
}

export function Watchlists({ tier, authState }: Props) {
  const { t } = useTranslation();
  const [watchlists, setWatchlists] = useState<WatchlistItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [channels, setChannels] = useState<WatchlistChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Load watchlists
  const loadWatchlists = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const wls = await api.getWatchlists();
      setWatchlists(wls);
      if (wls.length > 0 && (!activeId || !wls.find(w => w.id === activeId))) {
        setActiveId(wls[0].id);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [activeId]);

  // Load channels for active watchlist
  const loadChannels = useCallback(async () => {
    if (!activeId) return;
    try {
      const result = await api.getWatchlistChannels(activeId);
      setChannels(result.data);
    } catch {
      setChannels([]);
    }
  }, [activeId]);

  useEffect(() => { loadWatchlists(); }, []);
  useEffect(() => { if (activeId) loadChannels(); }, [activeId, loadChannels]);

  // Check banner dismiss
  useEffect(() => {
    chrome.storage.local.get('wl_banner_dismissed_at', (data) => {
      if (data.wl_banner_dismissed_at) {
        const dismissed = new Date(String(data.wl_banner_dismissed_at)).getTime();
        if (Date.now() - dismissed < 86_400_000) setBannerDismissed(true);
      }
    });
  }, []);

  // Filtered channels (client-side search — FR-024)
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const q = searchQuery.toLowerCase();
    return channels.filter(ch =>
      ch.display_name.toLowerCase().includes(q) || ch.login.toLowerCase().includes(q)
    );
  }, [channels, searchQuery]);

  // Active watchlist
  const activeWl = watchlists.find(w => w.id === activeId);

  // Handlers
  const handleCreate = async () => {
    const name = prompt(t('wl.create_title'));
    if (!name?.trim()) return;
    const wl = await api.createWatchlist(name.trim());
    if (wl) {
      setWatchlists(prev => [...prev, wl]);
      setActiveId(wl.id);
    }
  };

  const handleDelete = async () => {
    if (!activeWl) return;
    if (!confirm(t('wl.delete_confirm', { name: activeWl.name }))) return;
    await api.deleteWatchlist(activeWl.id);
    loadWatchlists();
  };

  const handleRename = async () => {
    if (!activeWl) return;
    const name = prompt(t('wl.rename_title'), activeWl.name);
    if (!name?.trim() || name === activeWl.name) return;
    const ok = await api.renameWatchlist(activeWl.id, name.trim());
    if (ok) loadWatchlists();
  };

  const handleRemove = async (channelId: string) => {
    if (!activeId) return;
    await api.removeFromWatchlist(activeId, channelId);
    setChannels(prev => prev.filter(c => c.channel_id !== channelId));
    setSelected(prev => { const s = new Set(prev); s.delete(channelId); return s; });
  };

  const handleSelect = (channelId: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(channelId)) s.delete(channelId); else s.add(channelId);
      return s;
    });
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    chrome.storage.local.set({ wl_banner_dismissed_at: new Date().toISOString() });
  };

  // Guest overlay
  if (!authState.loggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '12px', textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>★</div>
        <div style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{t('wl.guest_title')}</div>
        <div style={{ fontSize: '12px', color: '#6B7280' }}>{t('wl.guest_subtitle')}</div>
        <button
          style={{ marginTop: '12px', padding: '10px 20px', fontSize: '12px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid #0a0a0a', borderRadius: '8px', background: '#0a0a0a', color: 'white', cursor: 'pointer' }}
          onClick={() => chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' })}
        >
          {t('wl.guest_cta')}
        </button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '40px', color: '#D97706', marginBottom: '10px' }}>⚠</div>
        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: '#374151', marginBottom: '4px' }}>{t('wl.error_title')}</div>
        <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '12px' }}>{t('wl.error_subtitle')}</div>
        <button
          style={{ padding: '8px 20px', fontSize: '11px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid #0a0a0a', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
          onClick={() => loadWatchlists()}
        >
          {t('wl.error_retry')}
        </button>
      </div>
    );
  }

  // Skeleton
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '72px', borderRadius: '10px', background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  const showBanner = !bannerDismissed && activeWl && activeWl.stats.total >= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* M1: Watchlist Selector */}
      <div style={{ borderBottom: '1px solid #e5e5e5', marginBottom: '4px', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '6px 0', scrollbarWidth: 'none' }}>
          {watchlists.map(wl => (
            <button
              key={wl.id}
              onClick={() => { setActiveId(wl.id); setSelected(new Set()); setSearchQuery(''); }}
              style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: wl.id === activeId ? 600 : 500,
                fontFamily: "'Space Grotesk', sans-serif",
                border: `2px solid ${wl.id === activeId ? '#1a1a1a' : '#0a0a0a'}`,
                borderRadius: '20px',
                background: wl.id === activeId ? '#1a1a1a' : 'white',
                color: wl.id === activeId ? 'white' : '#374151',
                whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, lineHeight: '1.2',
              }}
            >
              {wl.name} ({wl.channels_count})
            </button>
          ))}
          <button
            onClick={handleCreate}
            style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid rgba(99,102,241,0.3)', borderRadius: '20px', background: 'rgba(99,102,241,0.05)', color: '#6366f1', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0, lineHeight: '1.2' }}
          >
            + {t('wl.create')}
          </button>
          <button
            onClick={() => { const action = prompt(`${t('wl.rename')} / ${t('wl.delete')}`, 'rename'); if (action === 'rename') handleRename(); else if (action === 'delete') handleDelete(); }}
            style={{ padding: '4px 6px', fontSize: '14px', color: '#a3a3a3', cursor: 'pointer', background: 'none', border: 'none', lineHeight: '1', flexShrink: 0 }}
            title={`${t('wl.rename')} / ${t('wl.delete')}`}
          >⋮</button>
        </div>
      </div>

      {/* Stats Row */}
      {activeWl && activeWl.stats.total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', paddingBottom: '8px', borderBottom: '1px solid #e5e5e5', marginBottom: '4px' }}>
          <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>{t('wl.stat_erv')}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: ervColor(activeWl.stats.avg_erv), fontFamily: "'JetBrains Mono', monospace" }}>{activeWl.stats.avg_erv != null ? `${activeWl.stats.avg_erv}%` : '—'}</div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.06)', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>{t('wl.stat_online')}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {activeWl.stats.live_count > 0 && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#059669', animation: 'pulse 2s infinite' }} />}
              {activeWl.stats.live_count}
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B7280', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>Tracked</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: tier === 'free' ? '#6B7280' : '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>{activeWl.stats.tracked_count}<span style={{ fontSize: '10px', color: '#a3a3a3' }}>/{activeWl.stats.total}</span></div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '4px' }}>
        <input
          type="text"
          placeholder={t('wl.search_placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '6px 10px 6px 28px', fontSize: '11px', fontFamily: "'Inter', sans-serif", border: '2px solid #0a0a0a', borderRadius: '8px', background: 'white', boxSizing: 'border-box' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '8px', top: '6px', background: 'none', border: 'none', color: '#a3a3a3', fontSize: '14px', cursor: 'pointer', lineHeight: '1' }}>×</button>
        )}
      </div>

      {/* Empty state */}
      {channels.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>★</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('wl.empty')}</div>
        </div>
      )}

      {/* Search no results */}
      {channels.length > 0 && filteredChannels.length === 0 && searchQuery && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{t('wl.search_empty')}</div>
        </div>
      )}

      {/* M2: Channel Cards */}
      {filteredChannels.map(ch => {
        const opacity = cardOpacity(ch);
        const isSelected = selected.has(ch.channel_id);
        const fresh = freshnessLabel(ch.last_ti_at, t);

        return (
          <div
            key={ch.channel_id}
            style={{
              border: `2.5px solid ${isSelected ? '#6366f1' : '#0a0a0a'}`,
              borderRadius: '10px', padding: '10px 12px', marginBottom: '4px',
              background: isSelected ? 'rgba(99,102,241,0.03)' : 'white',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.06)',
              cursor: 'pointer', position: 'relative', opacity,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Checkbox (Premium/Business) */}
              {tier !== 'free' && tier !== 'guest' && (
                <div
                  onClick={(e) => { e.stopPropagation(); handleSelect(ch.channel_id); }}
                  style={{
                    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
                    background: isSelected ? '#6366f1' : 'white',
                    border: `2px solid ${isSelected ? '#6366f1' : '#a3a3a3'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  {isSelected && <span style={{ color: 'white', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                </div>
              )}
              {/* Avatar */}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ch.avatar_url ? 'transparent' : '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                {ch.avatar_url ? <img src={ch.avatar_url} alt="" width={32} height={32} /> : ch.display_name[0]?.toUpperCase()}
              </div>
              {/* Name + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{ch.display_name}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {ch.is_live && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: ervColor(ch.erv_percent), animation: 'pulse 2s infinite' }} />}
                  {ch.is_live ? `${t('wl.online')} · ${(ch.ccv || 0).toLocaleString()} ${t('wl.viewers')}` : ch.inactive ? t('wl.inactive_label') : t('wl.offline')}
                </div>
              </div>
              {/* ERV + TI badges */}
              {!ch.inactive && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                  <span style={{ fontSize: '9px', padding: '2px 7px', background: `${ervColor(ch.erv_percent)}15`, color: ervColor(ch.erv_percent), borderRadius: '6px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>ERV {ch.erv_percent != null ? `${ch.erv_percent}%` : '—'}</span>
                  <span style={{ fontSize: '8px', padding: '1px 5px', background: `${ervColor(ch.erv_percent)}10`, color: ervColor(ch.erv_percent), borderRadius: '4px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>TI {ch.ti_score ?? '—'}</span>
                </div>
              )}
              {/* Inactive badge */}
              {ch.inactive && (
                <span style={{ fontSize: '8px', padding: '2px 6px', background: 'rgba(0,0,0,0.06)', color: '#a3a3a3', borderRadius: '4px', fontWeight: 500 }}>{t('wl.inactive_badge')}</span>
              )}
              {/* Kebab */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(ch.channel_id); }}
                style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', color: '#a3a3a3', fontSize: '14px', cursor: 'pointer', padding: '2px 4px', lineHeight: '1' }}
                title={t('wl.remove')}
              >×</button>
            </div>
            {/* Tags + freshness */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #e5e7eb' }}>
              {ch.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(0,0,0,0.04)', color: '#6B7280', borderRadius: '4px' }}>#{tag}</span>
              ))}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: '9px', color: fresh.color }}>{fresh.text}</span>
            </div>
            {/* Stale warning */}
            {ch.inactive && (
              <div style={{ fontSize: '9px', color: '#D97706', marginTop: '4px' }}>{t('wl.stale_data')}</div>
            )}
            {/* CTA — only for untracked */}
            {!ch.is_tracked && !ch.inactive && (
              <button style={{ width: '100%', marginTop: '6px', padding: '5px', fontSize: '11px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: '6px', background: 'rgba(99,102,241,0.04)', color: '#6366f1', cursor: 'pointer' }}>
                {t('wl.start_tracking')}
              </button>
            )}
          </div>
        );
      })}

      {/* Conversion Banner (≥5 channels → Business) */}
      {showBanner && (
        <div style={{ marginTop: '10px', padding: '14px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1e5e 100%)', border: '2.5px solid #1a1a1a', color: 'white', position: 'relative', boxShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Business</div>
          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", marginBottom: '4px', lineHeight: '1.3' }}>{t('wl.conversion', { n: activeWl!.stats.total })}</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
            <button style={{ flex: 1, padding: '8px 14px', fontSize: '11px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid white', borderRadius: '8px', background: 'white', color: '#1a1a1a', cursor: 'pointer' }}>{t('wl.business_cta')}</button>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: '#a5b4fc', fontWeight: 700, whiteSpace: 'nowrap' }}>{t('wl.business_price')}</span>
          </div>
          <button onClick={handleDismissBanner} style={{ position: 'absolute', top: '8px', right: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer', lineHeight: '1', padding: '2px' }} title={t('wl.dismiss_1d')}>×</button>
        </div>
      )}

      {/* M3: Bulk Actions Bar */}
      {selected.size > 0 && (
        <div style={{ padding: '10px 14px', background: '#1a1a1a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: '#ffffff', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{t('wl.selected', { n: selected.size })}</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button style={{ padding: '5px 10px', fontSize: '10px', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid #ffffff', borderRadius: '6px', background: '#ffffff', color: '#1a1a1a', cursor: 'pointer' }}>{t('wl.compare')}</button>
            <button style={{ padding: '5px 10px', fontSize: '10px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '6px', background: 'transparent', color: '#ffffff', cursor: 'pointer' }}>{t('wl.export')}</button>
            <button onClick={() => setSelected(new Set())} style={{ padding: '5px 8px', fontSize: '10px', fontWeight: 500, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', textDecoration: 'underline' }}>{t('wl.deselect')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
