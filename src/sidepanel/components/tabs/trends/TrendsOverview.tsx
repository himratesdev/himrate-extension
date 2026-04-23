// TASK-039 Phase D1: Trends Overview screen — module list (Screen 1 из wireframe).
// Lays out 3 core modules (D1 scope): M1 ERV hero, M2 TI timeline, M6 Rehabilitation (conditional).
// D2 добавит M3/M4/M5/M11/M12/M13 + paywalls + Insights banner.

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
