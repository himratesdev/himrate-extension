// TASK-039 FR-043 — Paywall screens (Free → Premium, Premium → Business 365d).
// Inline pattern (НЕ modal): занимает место content area для visibility.

import { useTranslation } from 'react-i18next';

type PaywallVariant = 'free' | 'business';

interface Props {
  variant: PaywallVariant;
  /** Called when user clicks the unified CTA button — parent navigates to checkout/upgrade flow. */
  onUpgrade?: () => void;
}

interface FeatureCard {
  titleKey: string;
  descKey: string;
}

const FREE_FEATURES: FeatureCard[] = [
  { titleKey: 'trends.paywall.free.feature_real_viewers', descKey: 'trends.paywall.free.feature_real_viewers_desc' },
  { titleKey: 'trends.paywall.free.feature_anomalies', descKey: 'trends.paywall.free.feature_anomalies_desc' },
  { titleKey: 'trends.paywall.free.feature_forecast', descKey: 'trends.paywall.free.feature_forecast_desc' },
  { titleKey: 'trends.paywall.free.feature_recovery', descKey: 'trends.paywall.free.feature_recovery_desc' },
  { titleKey: 'trends.paywall.free.feature_stability', descKey: 'trends.paywall.free.feature_stability_desc' },
  { titleKey: 'trends.paywall.free.feature_weekday', descKey: 'trends.paywall.free.feature_weekday_desc' },
];

const BUSINESS_FEATURES: FeatureCard[] = [
  { titleKey: 'trends.paywall.business.feature_year', descKey: 'trends.paywall.business.feature_year_desc' },
  { titleKey: 'trends.paywall.business.feature_peers', descKey: 'trends.paywall.business.feature_peers_desc' },
  { titleKey: 'trends.paywall.business.feature_50', descKey: 'trends.paywall.business.feature_50_desc' },
  { titleKey: 'trends.paywall.business.feature_components', descKey: 'trends.paywall.business.feature_components_desc' },
  { titleKey: 'trends.paywall.business.feature_categories', descKey: 'trends.paywall.business.feature_categories_desc' },
  { titleKey: 'trends.paywall.business.feature_export', descKey: 'trends.paywall.business.feature_export_desc' },
];

export function Paywall({ variant, onUpgrade }: Props) {
  const { t } = useTranslation();

  const features = variant === 'free' ? FREE_FEATURES : BUSINESS_FEATURES;
  const ns = variant === 'free' ? 'trends.paywall.free' : 'trends.paywall.business';

  return (
    <div className={`trends-paywall trends-paywall-${variant}`}>
      <div className="trends-paywall-hook">{t(`${ns}.hook`)}</div>
      <div className="trends-paywall-social-proof">{t(`${ns}.social_proof`)}</div>

      <div className="trends-paywall-features">
        {features.map((f) => (
          <div key={f.titleKey} className="trends-paywall-feature">
            <div className="trends-paywall-feature-visual" aria-hidden="true" />
            <div className="trends-paywall-feature-lock" aria-hidden="true">
              🔒
            </div>
            <span className="trends-paywall-feature-title">{t(f.titleKey)}</span>
            <span className="trends-paywall-feature-desc">{t(f.descKey)}</span>
          </div>
        ))}
      </div>

      <div className="trends-paywall-pricing">
        {variant === 'free' ? (
          <>
            <PricingTier mainKey="trends.paywall.free.tier_premium" subKey="trends.paywall.free.tier_premium_sub" />
            <PricingTier mainKey="trends.paywall.free.tier_report" subKey="trends.paywall.free.tier_report_sub" />
          </>
        ) : (
          <>
            <PricingTier mainKey="trends.paywall.business.tier_main" subKey="trends.paywall.business.tier_main_sub" />
            <PricingTier mainKey="trends.paywall.business.tier_report" subKey="trends.paywall.business.tier_report_sub" />
          </>
        )}
        <button type="button" className="trends-paywall-cta" onClick={onUpgrade}>
          {t(`${ns}.cta`)}
        </button>
      </div>

      {variant === 'free' && (
        <div className="trends-paywall-refund">{t('trends.paywall.free.refund')}</div>
      )}
    </div>
  );
}

function PricingTier({ mainKey, subKey }: { mainKey: string; subKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="trends-paywall-tier">
      <span className="trends-paywall-tier-main">{t(mainKey)}</span>
      <span className="trends-paywall-tier-sub">{t(subKey)}</span>
    </div>
  );
}
