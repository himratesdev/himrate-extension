// LITERAL PORT — wireframe slim/18_offline-1ch-ostalos.html.
// Идентично Frame16, отличие: countdown WARNING variant ("Осталось N м" в красной рамке).

import { Frame16OfflineWithin18h } from './Frame16OfflineWithin18h';

interface Signal {
  type: string;
  value: number;
  confidence: number | null;
  weight: number | null;
  contribution: number;
  metadata: Record<string, unknown> | null;
}

interface ReputationData {
  growth_pattern_score: number | null;
  follower_quality_score: number | null;
  engagement_consistency_score: number | null;
}

interface Country {
  country_code: string;
  percentage: number;
  viewer_count: number;
}

interface Props {
  ervPercent: number | null;
  ervCount: number | null;
  ccv: number | null;
  ervLabelColor: 'green' | 'yellow' | 'red' | null;
  tiScore: number | null;
  percentile: number | null;
  remainingMinutes: number;
  streamDuration: string | null;
  peakViewers: number | null;
  avgCcv: number | null;
  signals?: Signal[];
  reputation?: ReputationData | null;
  topCountries?: Country[] | null;
  onNavigate?: (tab: string) => void;
}

export function Frame18OfflineLessThan1h(props: Props) {
  // Frame18 = Frame16 с countdown warning variant (<1h remaining → red border).
  // Wireframe slim/18: <div class="sp-countdown warning"><span>⏱</span><span>Осталось</span><span class="sp-countdown-time">42м</span></div>
  return (
    <Frame16OfflineWithin18h
      {...props}
      countdownText={`${props.remainingMinutes}м`}
      countdownWarning={true}
    />
  );
}
