// LITERAL PORT — wireframe slim/53_watchlists-error.html.
// Error loading. M1 tabs remain for switching.

interface ListTab { name: string; count: number }
interface Props {
  lists?: ListTab[];
  activeListIndex?: number;
  onRetry?: () => void;
  onSelectList?: (index: number) => void;
}

const DEFAULT_LISTS: ListTab[] = [
  { name: 'Кандидаты', count: 5 },
  { name: 'Топ', count: 3 },
];

export function Frame53WatchlistsError({ lists = DEFAULT_LISTS, activeListIndex = 0, onRetry, onSelectList }: Props) {
  return (
    <div className="sp-content" role="tabpanel">
      {/* M1: tabs still visible */}
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
      {/* Error state */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '50px 20px', textAlign: 'center' }}>
        <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, color: 'var(--color-erv-yellow)', marginBottom: 10, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink-70)', marginBottom: 4 }}>Не удалось загрузить</div>
        <div style={{ fontSize: 11, color: 'var(--ink-30)', marginBottom: 12 }}>Проверьте соединение и&nbsp;попробуйте снова</div>
        <button onClick={() => onRetry?.()} style={{ padding: '8px 20px', fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid var(--border-dark)', borderRadius: 8, background: 'white', color: 'var(--ink-70)', cursor: 'pointer', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>Повторить</button>
      </div>
    </div>
  );
}
