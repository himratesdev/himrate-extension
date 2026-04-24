// TASK-039: Trends Overview screen — 9 modules + Movement Insights banner.
// Modules: M1 ERV, M2 TI, M3 Stability, M4 Anomalies, M5 Components, M6 Rehabilitation
// (conditional), M11 Comparison, M13 Categories, M14 Weekday.

import type { TrendsPeriod } from '../../../../shared/trends-types';
import { ErvTimeline } from './modules/ErvTimeline';
import { TrustIndexTimeline } from './modules/TrustIndexTimeline';
import { StabilityModule } from './modules/StabilityModule';
import { AnomaliesModule } from './modules/AnomaliesModule';
import { ComponentsModule } from './modules/ComponentsModule';
import { RehabilitationCurve } from './modules/RehabilitationCurve';
import { ComparisonModule } from './modules/ComparisonModule';
import { CategoriesModule } from './modules/CategoriesModule';
import { WeekdayModule } from './modules/WeekdayModule';
import { InsightsBanner } from './InsightsBanner';

interface Props {
  channelId: string;
  period: TrendsPeriod;
  /** Deep-link handler — parent navigates to module drill-down on insight action. */
  onInsightAction?: (action: string) => void;
}

export function TrendsOverview({ channelId, period, onInsightAction }: Props) {
  return (
    <div className="trends-overview">
      <InsightsBanner channelId={channelId} period={period} onAction={onInsightAction} />
      <ErvTimeline channelId={channelId} period={period} variant="overview" />
      <TrustIndexTimeline channelId={channelId} period={period} variant="overview" />
      <StabilityModule channelId={channelId} period={period} variant="overview" />
      <AnomaliesModule channelId={channelId} period={period} variant="overview" />
      <ComponentsModule channelId={channelId} period={period} variant="overview" />
      <RehabilitationCurve channelId={channelId} />
      <ComparisonModule channelId={channelId} period={period} variant="overview" />
      <CategoriesModule channelId={channelId} period={period} variant="overview" />
      <WeekdayModule channelId={channelId} period={period} variant="overview" />
    </div>
  );
}
