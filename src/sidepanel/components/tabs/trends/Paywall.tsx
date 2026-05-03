// BUG-016 PR-1a: Paywall canonical port (frames 32 Free→Premium, 44 Business→365d).
// Wireframe: wireframe-frames/32_Trends_PaywallFreeToPremium.html.
// 6 feature cards с blurred chart SVG previews + purple lock icon.
// Dark electric pricing block + dual CTA.

import { useTranslation } from 'react-i18next';

type PaywallVariant = 'free' | 'business';

interface Props {
  variant: PaywallVariant;
  /** Channel name for dynamic hook ("У {channel} N аномалий за месяц"). */
  channelName?: string | null;
  onUpgrade?: () => void;
}

function LockBadge() {
  return (
    <div className="sp-paywall-card-lock" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    </div>
  );
}

// 6 feature cards with distinct chart visuals (slim/32 lines 25-100).
function CardRealViewers() {
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      <path d="M0,30 L20,24 L40,26 L60,20 L80,22 L100,16 L120,14 L140,10 L140,38 L0,38 Z" fill="#22C55E" fillOpacity="0.15" />
      <polyline points="0,30 20,24 40,26 60,20 80,22 100,16 120,14 140,10" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CardAnomalies() {
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      <polyline points="0,28 15,26 30,28 45,26 55,24 60,4 65,26 80,28 95,26 110,28 125,26 140,28" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round" />
      <line x1="57" y1="0" x2="63" y2="0" stroke="#EF4444" strokeWidth="6" opacity="0.15" />
      <circle cx="60" cy="4" r="3" fill="#EF4444" opacity="0.3" />
    </svg>
  );
}

function CardForecast() {
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      <polyline points="0,30 20,26 40,22 60,18 80,16 95,14" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round" />
      <polyline points="95,14 110,10 125,8 140,4" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 3" strokeLinejoin="round" />
      <rect x="90" y="0" width="50" height="38" fill="#3B82F6" opacity="0.04" />
    </svg>
  );
}

function CardRecovery() {
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      <rect x="0" y="6" width="140" height="10" rx="4" fill="#E5E7EB" />
      <rect x="0" y="6" width="90" height="10" rx="4" fill="#22C55E" opacity="0.5" />
      <rect x="0" y="22" width="140" height="10" rx="4" fill="#E5E7EB" />
      <rect x="0" y="22" width="50" height="10" rx="4" fill="#EAB308" opacity="0.5" />
    </svg>
  );
}

function CardStability() {
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      <line x1="0" y1="19" x2="140" y2="19" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      {[15, 30, 50].map((cx, i) => <circle key={i} cx={cx} cy={[16, 22, 18][i]} r="3" fill="#3B82F6" opacity="0.35" />)}
      {[65, 80, 100, 115, 130].map((cx, i) => <circle key={i + 3} cx={cx} cy={[20, 17, 19, 18, 19][i]} r="3" fill="#22C55E" opacity="0.45" />)}
    </svg>
  );
}

function CardWeekday() {
  const cells: Array<{ x: number; y: number; w: number; fill: string; opacity: number }> = [
    { x: 4, y: 4, w: 16, fill: '#22C55E', opacity: 0.5 },
    { x: 24, y: 4, w: 16, fill: '#22C55E', opacity: 0.3 },
    { x: 44, y: 4, w: 16, fill: '#3B82F6', opacity: 0.25 },
    { x: 64, y: 4, w: 16, fill: '#EAB308', opacity: 0.3 },
    { x: 84, y: 4, w: 16, fill: '#22C55E', opacity: 0.45 },
    { x: 104, y: 4, w: 16, fill: '#3B82F6', opacity: 0.2 },
    { x: 124, y: 4, w: 14, fill: '#EF4444', opacity: 0.2 },
    { x: 4, y: 22, w: 16, fill: '#3B82F6', opacity: 0.2 },
    { x: 24, y: 22, w: 16, fill: '#22C55E', opacity: 0.4 },
    { x: 44, y: 22, w: 16, fill: '#22C55E', opacity: 0.5 },
    { x: 64, y: 22, w: 16, fill: '#3B82F6', opacity: 0.3 },
    { x: 84, y: 22, w: 16, fill: '#EAB308', opacity: 0.25 },
    { x: 104, y: 22, w: 16, fill: '#22C55E', opacity: 0.35 },
    { x: 124, y: 22, w: 14, fill: '#3B82F6', opacity: 0.2 },
  ];
  return (
    <svg width="100%" height="38" viewBox="0 0 140 38" preserveAspectRatio="none">
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height="14" rx="2" fill={c.fill} opacity={c.opacity} />)}
    </svg>
  );
}

const FREE_CARDS = [
  { titleKey: 'trends.paywall.free.feature_real_viewers', descKey: 'trends.paywall.free.feature_real_viewers_desc', Chart: CardRealViewers },
  { titleKey: 'trends.paywall.free.feature_anomalies', descKey: 'trends.paywall.free.feature_anomalies_desc', Chart: CardAnomalies },
  { titleKey: 'trends.paywall.free.feature_forecast', descKey: 'trends.paywall.free.feature_forecast_desc', Chart: CardForecast },
  { titleKey: 'trends.paywall.free.feature_recovery', descKey: 'trends.paywall.free.feature_recovery_desc', Chart: CardRecovery },
  { titleKey: 'trends.paywall.free.feature_stability', descKey: 'trends.paywall.free.feature_stability_desc', Chart: CardStability },
  { titleKey: 'trends.paywall.free.feature_weekday', descKey: 'trends.paywall.free.feature_weekday_desc', Chart: CardWeekday },
];

export function Paywall({ variant, channelName, onUpgrade }: Props) {
  const { t } = useTranslation();
  const ns = variant === 'free' ? 'trends.paywall.free' : 'trends.paywall.business';

  return (
    <div className="sp-paywall-rich">
      {variant === 'free' && (
        <div className="sp-paywall-hook">
          <div className="sp-paywall-hook-title">
            {channelName ? t('trends.paywall.free.hook_dynamic', { channel: channelName }) : t('trends.paywall.free.hook')}
          </div>
          <div className="sp-paywall-hook-detail">{t('trends.paywall.free.hook_detail')}</div>
        </div>
      )}
      <div className="sp-paywall-social">{t(`${ns}.social_proof`)}</div>

      {variant === 'free' && (
        <div className="sp-paywall-grid">
          {FREE_CARDS.map(({ titleKey, descKey, Chart }) => (
            <div key={titleKey} className="sp-paywall-card">
              <LockBadge />
              <div className="sp-paywall-card-chart">
                <Chart />
              </div>
              <div className="sp-paywall-card-title">{t(titleKey)}</div>
              <div className="sp-paywall-card-desc">{t(descKey)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="sp-paywall-pricing-dark">
        <div className="sp-paywall-pricing-tiers">
          <div className="sp-paywall-pricing-tier">
            <div className="sp-paywall-pricing-tier-label">
              {variant === 'free' ? t('trends.paywall.free.tier_premium_label') : t('trends.paywall.business.tier_main_label')}
            </div>
            <div className="sp-paywall-pricing-tier-price">
              {variant === 'free' ? t('trends.paywall.free.tier_premium_price') : t('trends.paywall.business.tier_main_price')}
            </div>
            <div className="sp-paywall-pricing-tier-sub">
              {variant === 'free' ? t('trends.paywall.free.tier_premium_sub') : t('trends.paywall.business.tier_main_sub')}
            </div>
          </div>
          <div className="sp-paywall-pricing-divider" />
          <div className="sp-paywall-pricing-tier">
            <div className="sp-paywall-pricing-tier-label">{t('trends.paywall.free.tier_report_label')}</div>
            <div className="sp-paywall-pricing-tier-price">{t('trends.paywall.free.tier_report_price')}</div>
            <div className="sp-paywall-pricing-tier-sub">{t('trends.paywall.free.tier_report_sub')}</div>
          </div>
        </div>
        <button className="sp-paywall-pricing-cta" onClick={onUpgrade}>
          {t(`${ns}.cta`)}
        </button>
      </div>

      {variant === 'free' && (
        <div className="sp-paywall-refund">{t('trends.paywall.free.refund')}</div>
      )}
    </div>
  );
}
