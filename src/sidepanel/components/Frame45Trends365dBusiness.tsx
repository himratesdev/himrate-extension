// LITERAL PORT — wireframe slim/45_screen-16b-trends-365d-default-business.html.
// Business 365d default — same module grid as Frame28. Period toggle owned by parent
// TrendsTab.PeriodToggle (B11 fix); Business gating handled there too. Frame28 — pure module grid.

import { Frame28TrendsOverview } from './Frame28TrendsOverview';

interface Props {
  onOpenModule?: (key: string) => void;
}

export function Frame45Trends365dBusiness({ onOpenModule }: Props) {
  return <Frame28TrendsOverview onOpenModule={onOpenModule} />;
}
