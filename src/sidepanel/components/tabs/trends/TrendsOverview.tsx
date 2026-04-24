// TASK-039: Trends Overview screen — module list (Screen 1 из wireframe).
// Renders 3 core modules: M1 ERV hero, M2 TI timeline, M6 Rehabilitation (conditional).
// Analytics modules (M3/M4/M5/M11/M12/M13) + paywalls + Insights banner tracked
// в отдельных feature tickets.

import type { TrendsPeriod } from '../../../../shared/trends-types';
import { ErvTimeline } from './modules/ErvTimeline';
import { TrustIndexTimeline } from './modules/TrustIndexTimeline';
import { RehabilitationCurve } from './modules/RehabilitationCurve';

interface Props {
  channelId: string;
  period: TrendsPeriod;
}

export function TrendsOverview({ channelId, period }: Props) {
  return (
    <div className="trends-overview">
      <ErvTimeline channelId={channelId} period={period} variant="overview" />
      <TrustIndexTimeline channelId={channelId} period={period} variant="overview" />
      <RehabilitationCurve channelId={channelId} />
    </div>
  );
}
