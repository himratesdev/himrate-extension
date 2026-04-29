// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/10_live-guest-green.html.
// Каждый <div>, <svg>, <circle>, <span>, <button> + class + inline style скопирован вербатим.
//
// LEGAL COMPLIANCE NOTE:
// Wireframe slim/10 содержит "11 сигналов накрутки" — запрещённое слово per CLAUDE.md
// ERV labels v3 (никаких "боты"/"накрутка"/"фейк"). Используется i18n значение
// `paywall.guest_description` = "11 сигналов аудитории, репутация канала, графики
// и тренды — бесплатно после входа". Это deliberate divergence wireframe text → legal-safe text.

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../shared/format';

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
}

const CIRCUMFERENCE = 326.7;
const ERV_STROKE: Record<string, string> = { green: '#059669', yellow: '#D97706', red: '#DC2626' };

export function Frame10LiveGuestGreen({ ervPercent, ervCount, ccv, ervLabelColor, tiScore }: Props) {
  const { t, i18n } = useTranslation();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const color = ervLabelColor || 'green';
  const stroke = ERV_STROKE[color];
  const pct = ervPercent ?? 85;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const handleSignIn = () => {
    chrome.runtime.sendMessage({ action: 'AUTH_TWITCH' });
  };

  return (
    // <div class="sp-content">
    <div className="sp-content" role="tabpanel">
      {/* <!-- Info Banner: Link Twitch --> */}
      {!bannerDismissed && (
        // <div class="sp-info-banner" role="alert">
        <div className="sp-info-banner" role="alert">
          {/* <span class="sp-info-banner-text"><svg ...>...</svg> Войдите через Twitch для полного доступа.</span> */}
          <span className="sp-info-banner-text">
            <svg
              className="ico ico-sm"
              viewBox="0 0 24 24"
              style={{ verticalAlign: '-0.2em' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>{' '}
            {t('banner.guest_signin')}
          </span>
          {/* <button class="sp-info-banner-close" aria-label="Закрыть">×</button> */}
          <button
            className="sp-info-banner-close"
            aria-label={t('aria.close') || 'Close'}
            onClick={() => setBannerDismissed(true)}
          >
            ×
          </button>
        </div>
      )}

      {/* <!-- Gauge --> */}
      {/* <div class="sp-gauge-section" role="img" aria-label="ERV 85%"> */}
      <div className="sp-gauge-section" role="img" aria-label={`ERV ${pct}%`}>
        {/* <div class="sp-gauge-wrap"> */}
        <div className="sp-gauge-wrap">
          {/* <svg class="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120"> */}
          <svg className="sp-gauge-ring" width="120" height="120" viewBox="0 0 120 120">
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" stroke-width="8"/> */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            {/* <circle cx="60" cy="60" r="52" fill="none" stroke="#059669" stroke-width="8" stroke-dasharray="326.7" stroke-dashoffset="49" stroke-linecap="round" transform="rotate(-90 60 60)"/> */}
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={stroke}
              strokeWidth="8"
              strokeDasharray="326.7"
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          {/* <div class="sp-gauge-center"> */}
          <div className="sp-gauge-center">
            {/* <span class="sp-gauge-percent green">85%</span> */}
            <span className={`sp-gauge-percent ${color}`}>{pct}%</span>
            {/* <span class="sp-gauge-sub" title="...">Реальные зрители</span> */}
            <span className="sp-gauge-sub" title={t('erv.tooltip')}>
              {t('erv.real_viewers_label')}
            </span>
          </div>
        </div>
      </div>

      {/* <div class="sp-erv-hero green">~4,200 реальных зрителей</div> */}
      <div className={`sp-erv-hero ${color}`}>
        {ervCount != null
          ? t('erv.real_viewers_count', { N: formatNumber(ervCount, i18n.language) })
          : '—'}
      </div>

      {/* <div class="sp-erv-ccv">Twitch онлайн: 5,000</div> */}
      <div className="sp-erv-ccv">
        {ccv != null ? t('popup.twitch_online', { N: formatNumber(ccv, i18n.language) }) : ''}
      </div>

      {/* <div style="text-align:center;"><span class="sp-erv-label green">...</span></div> */}
      <div style={{ textAlign: 'center' }}>
        <span className={`sp-erv-label ${color}`}>
          <span className="erv-dot"></span> {t(`erv_label.${color}`)} · {pct}%
        </span>
      </div>

      {/* <!-- TI --> */}
      {/* <div class="sp-ti-section"> */}
      <div className="sp-ti-section">
        {/* <div class="sp-ti-header"> */}
        <div className="sp-ti-header">
          {/* <div class="sp-ti-left"> */}
          <div className="sp-ti-left">
            {/* <span class="sp-ti-label" title="...">Рейтинг доверия</span> */}
            <span className="sp-ti-label" title={t('sp.ti_tooltip')}>
              {t('sp.trust_rating')}
            </span>
            {/* <span class="sp-ti-score green">85</span> */}
            <span className={`sp-ti-score ${color}`}>{tiScore ?? '—'}</span>
            {/* <span class="sp-ti-classification">— Порядочный</span> */}
            <span className="sp-ti-classification">— {t('classification.trusted')}</span>
          </div>
          {/* <button class="sp-ti-expand">▾</button> */}
          <button className="sp-ti-expand" aria-label="Expand">▾</button>
        </div>
      </div>

      {/* <!-- Combined Sign-In paywall block (full, not cut off) --> */}
      {/* <div class="sp-paywall" style="min-height:180px;"> */}
      <div className="sp-paywall" style={{ minHeight: '180px' }}>
        {/* <div class="sp-paywall-blurred"> */}
        <div className="sp-paywall-blurred">
          {/* <div class="sp-signals" style="padding:8px;"> */}
          <div className="sp-signals" style={{ padding: '8px' }}>
            {/* <div class="sp-signal-row"><span class="sp-signal-name">Авторизация</span>...<span class="sp-signal-val green">82%</span></div> */}
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.auth_ratio')}</span>
              <div className="sp-signal-bar-bg">
                <div className="sp-signal-bar-fill green" style={{ width: '82%' }}></div>
              </div>
              <span className="sp-signal-val green">82%</span>
            </div>
            {/* <div class="sp-signal-row"><span class="sp-signal-name">Чат/зрители</span>...<span class="sp-signal-val green">норма</span></div> */}
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.chatter_ccv')}</span>
              <div className="sp-signal-bar-bg">
                <div className="sp-signal-bar-fill green" style={{ width: '75%' }}></div>
              </div>
              <span className="sp-signal-val green">{t('signal.value_norm')}</span>
            </div>
            {/* <div class="sp-signal-row"><span class="sp-signal-name">Рост зрителей</span>...<span class="sp-signal-val green">норма</span></div> */}
            <div className="sp-signal-row">
              <span className="sp-signal-name">{t('signal.ccv_step')}</span>
              <div className="sp-signal-bar-bg">
                <div className="sp-signal-bar-fill green" style={{ width: '90%' }}></div>
              </div>
              <span className="sp-signal-val green">{t('signal.value_norm')}</span>
            </div>
          </div>
          {/* <div class="sp-reputation" style="padding:4px 8px;border:2.5px solid #8B5CF6;..."> */}
          <div
            className="sp-reputation"
            style={{
              padding: '4px 8px',
              border: '2.5px solid #8B5CF6',
              borderRadius: '12px',
              background: 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 100%)',
            }}
          >
            {/* <div class="sp-rep-row"><span class="sp-rep-name">Естественность роста</span>...<span class="sp-rep-val" style="color:#7C3AED;">72</span></div> */}
            <div className="sp-rep-row">
              <span className="sp-rep-name">{t('sp.rep_growth')}</span>
              <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                <div className="sp-rep-bar-fill" style={{ width: '72%', background: '#8B5CF6' }}></div>
              </div>
              <span className="sp-rep-val" style={{ color: '#7C3AED' }}>72</span>
            </div>
            {/* <div class="sp-rep-row"><span class="sp-rep-name">Качество подписчиков</span>...<span class="sp-rep-val" style="color:#7C3AED;">88</span></div> */}
            <div className="sp-rep-row">
              <span className="sp-rep-name">{t('sp.rep_quality')}</span>
              <div className="sp-rep-bar-bg" style={{ border: '1px solid #DDD6FE' }}>
                <div className="sp-rep-bar-fill" style={{ width: '88%', background: '#8B5CF6' }}></div>
              </div>
              <span className="sp-rep-val" style={{ color: '#7C3AED' }}>88</span>
            </div>
          </div>
        </div>
        {/* <div class="sp-paywall-overlay" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;"> */}
        <div
          className="sp-paywall-overlay"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 12px',
          }}
        >
          {/* <div style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;color:var(--ink);">Хотите видеть полный анализ?</div> */}
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--ink)',
            }}
          >
            {t('paywall.guest_title')}
          </div>
          {/* <div style="font-size:11px;color:var(--ink-50);text-align:center;line-height:1.4;max-width:260px;">
                11 сигналов накрутки, репутация канала, графики и тренды — бесплатно после входа
              </div>
              ⚠️ wireframe contains forbidden word "накрутки" → using legal-safe i18n value */}
          <div
            style={{
              fontSize: '11px',
              color: 'var(--ink-50)',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '260px',
            }}
          >
            {t('paywall.guest_description')}
          </div>
          {/* <button class="sp-paywall-cta" style="background:var(--color-twitch);border-color:var(--color-twitch);font-size:13px;padding:8px 24px;">Войти через Twitch</button> */}
          <button
            className="sp-paywall-cta"
            style={{
              background: 'var(--color-twitch)',
              borderColor: 'var(--color-twitch)',
              fontSize: '13px',
              padding: '8px 24px',
            }}
            onClick={handleSignIn}
          >
            {t('auth.twitch')}
          </button>
        </div>
      </div>
    </div>
  );
}
