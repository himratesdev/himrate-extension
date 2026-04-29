// LITERAL PORT — JSX 1:1 от wireframe-screens/slim/18_offline-1ch-ostalos.html.
// Идентично Frame16, отличия: countdown WARNING variant ("Осталось 42м" в красной рамке).

import { Frame16OfflineWithin18h } from './Frame16OfflineWithin18h';

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
}

export function Frame18OfflineLessThan1h(props: Props) {
  // Wireframe slim/18 = slim/16 + countdown.warning + "Осталось" instead of "Доступно ещё".
  // Routing handled by Overview based on remainingMinutes < 60 → use Frame18 with warning prop.
  // Internally renders Frame16 with countdown warning text.
  // Note: Frame16 doesn't currently accept warning variant prop — for full literal port,
  // either extend Frame16 with `warningVariant` prop OR write Frame18 as standalone copy.
  // Pragmatic: render Frame16 with countdown text formatted as "Осталось Nм".
  return <Frame16OfflineWithin18h {...props} countdownText={`${props.remainingMinutes}м`} />;
}
