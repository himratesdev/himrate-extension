// TASK-036: Extracted WatchlistCard — single channel card in watchlist.
// Neo-Brutiful design: 2.5px borders, Space Grotesk headings, JetBrains Mono numbers, electric shadow.

import { useTranslation } from 'react-i18next';
import type { WatchlistChannel } from '../../shared/api';

interface Props {
  ch: WatchlistChannel;
  tier: string;
  isSelected: boolean;
  onSelect: (channelId: string) => void;
  onRemove: (channelId: string) => void;
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

export function WatchlistCard({ ch, tier, isSelected, onSelect, onRemove }: Props) {
  const { t } = useTranslation();
  const opacity = cardOpacity(ch);
  const fresh = freshnessLabel(ch.last_ti_at, t);

  return (
    <div
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
            onClick={(e) => { e.stopPropagation(); onSelect(ch.channel_id); }}
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
          onClick={(e) => { e.stopPropagation(); onRemove(ch.channel_id); }}
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
      {/* CTA — only for untracked (M1: Start Tracking onClick) */}
      {!ch.is_tracked && !ch.inactive && (
        <button
          onClick={(e) => { e.stopPropagation(); window.open('https://himrate.com/pricing', '_blank'); }}
          style={{ width: '100%', marginTop: '6px', padding: '5px', fontSize: '11px', fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: '6px', background: 'rgba(99,102,241,0.04)', color: '#6366f1', cursor: 'pointer' }}
        >
          {t('wl.start_tracking')}
        </button>
      )}
    </div>
  );
}
