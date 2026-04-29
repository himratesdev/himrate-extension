// LITERAL PORT — wireframe slim/50_watchlists-guest.html.
// Guest state: blurred decorative cards behind + overlay CTA (Sign Up + Sign In).

interface Props {
  onSignUp?: () => void;
  onSignIn?: () => void;
}

export function Frame50WatchlistsGuest({ onSignUp, onSignIn }: Props) {
  return (
    <div className="sp-content" role="tabpanel" style={{ position: 'relative', padding: 0, gap: 0 }}>
      {/* Blurred decorative cards behind */}
      <div style={{ filter: 'blur(8px)', opacity: 0.4, pointerEvents: 'none', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 80, height: 24, borderRadius: 20, background: '#1a1a1a' }}></div>
          <div style={{ width: 60, height: 24, borderRadius: 20, border: '2px solid var(--border-dark)', background: 'white' }}></div>
          <div style={{ width: 70, height: 24, borderRadius: 20, border: '2px solid var(--border-dark)', background: 'white' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 4 }}>
          <div style={{ height: 34, borderRadius: 6, background: 'rgba(34,197,94,0.08)' }}></div>
          <div style={{ height: 34, borderRadius: 6, background: 'rgba(34,197,94,0.08)' }}></div>
          <div style={{ height: 34, borderRadius: 6, background: 'rgba(0,0,0,0.04)' }}></div>
        </div>
        {[
          { bg: 'var(--color-twitch)', titleW: 80, subW: 120, badge: 'var(--color-erv-green-bg)' },
          { bg: 'var(--color-erv-yellow)', titleW: 60, subW: 100, badge: 'var(--color-erv-yellow-bg)' },
          { bg: 'var(--ink-30)', titleW: 70, subW: 90, badge: 'var(--color-erv-green-bg)' },
          { bg: 'var(--color-twitch)', titleW: 75, subW: 110, badge: 'var(--color-erv-green-bg)' },
        ].map((m, i) => (
          <div key={i} style={{ border: '2.5px solid var(--border-dark)', borderRadius: 10, padding: 10, background: 'white', boxShadow: '2px 2px 0 rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.bg }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ width: m.titleW, height: 10, background: 'var(--ink-20)', borderRadius: 4, marginBottom: 4 }}></div>
                <div style={{ width: m.subW, height: 8, background: 'var(--ink-10)', borderRadius: 4 }}></div>
              </div>
              <span style={{ width: 42, height: 18, background: m.badge, borderRadius: 6 }}></span>
            </div>
          </div>
        ))}
      </div>
      {/* Overlay CTA */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 2, padding: 20, textAlign: 'center' }}>
        <svg viewBox="0 0 24 24" style={{ width: 44, height: 44, color: 'var(--ink-30)', marginBottom: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--ink-90)', marginBottom: 6, maxWidth: 260, lineHeight: 1.3 }}>Войдите, чтобы сохранять стримеров</div>
        <div style={{ fontSize: 11, color: 'var(--ink-50)', marginBottom: 16, maxWidth: 240, lineHeight: 1.4 }}>Добавляйте каналы в&nbsp;списки, отслеживайте реальных зрителей и&nbsp;получайте alerts бесплатно.</div>
        <button onClick={() => onSignUp?.()} style={{ padding: '11px 28px', fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", border: '2.5px solid var(--ink-90)', borderRadius: 10, background: 'var(--ink-90)', color: 'white', cursor: 'pointer', boxShadow: '3px 3px 0 rgba(0,0,0,0.15)', marginBottom: 8 }}>Создать аккаунт — бесплатно</button>
        <button onClick={() => onSignIn?.()} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 500, fontFamily: "'Inter', sans-serif", border: 'none', background: 'transparent', color: 'var(--ink-50)', cursor: 'pointer', textDecoration: 'underline' }}>Уже есть аккаунт? Войти</button>
      </div>
    </div>
  );
}
