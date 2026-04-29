// LITERAL PORT — wireframe slim/45_screen-16b-trends-365d-default-business.html.
// Business 365d default — same module grid as Frame28 but with 365d period active
// и без lock (Business has access). Implementation: reuse Frame28 с isPremium=true (Business),
// initialPeriod="90d" so user can switch to 365d.

import { Frame28TrendsOverview } from './Frame28TrendsOverview';

interface Props {
  onOpenModule?: (key: string) => void;
}

export function Frame45Trends365dBusiness({ onOpenModule }: Props) {
  // Business user: full access, 365d unlocked. Frame28 with isPremium=true (treats как Business).
  // Period state managed in Frame28; default 30d but user switches к 365d via toggle.
  return <Frame28TrendsOverview initialPeriod="90d" isPremium={true} onOpenModule={onOpenModule} />;
}
