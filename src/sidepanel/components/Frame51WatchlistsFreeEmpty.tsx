// LITERAL PORT — wireframe slim/51_watchlists-free-empty.html.
// Empty state with default list created.

interface Props {
  onCreateList?: () => void;
}

export function Frame51WatchlistsFreeEmpty({ onCreateList }: Props) {
  return (
    <div className="sp-content" role="tabpanel">
      {/* M1 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <button style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid var(--ink-90)', borderRadius: 20, background: 'var(--ink-90)', color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}>Мой список (0)</button>
        <button onClick={() => onCreateList?.()} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", border: '2px solid rgba(99,102,241,0.3)', borderRadius: 20, background: 'rgba(99,102,241,0.05)', color: '#6366f1', whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}>+ Создать</button>
      </div>
      {/* Stats: zeros */}
      <div style={{ fontSize: 11, color: 'var(--ink-30)', fontFamily: "'JetBrains Mono', monospace", padding: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', marginBottom: 20 }}>
        ERV —% · 0 live · 0 tracked
      </div>
      {/* Empty state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <svg viewBox="0 0 24 24" style={{ width: 48, height: 48, color: 'var(--ink-20)', marginBottom: 12, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink-70)', marginBottom: 4 }}>Watchlist пуст</div>
        <div style={{ fontSize: 12, color: 'var(--ink-50)' }}>Нажмите ★ на&nbsp;любом канале</div>
      </div>
    </div>
  );
}
