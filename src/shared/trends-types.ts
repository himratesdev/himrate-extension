// TASK-039: TypeScript types для Trends API responses (SRS §4 response shapes).
// Строгая типизация → compile-time validation что UI consumer матчит backend contract.

export type TrendsPeriod = '7d' | '30d' | '60d' | '90d' | '365d';
export type TrendsGranularity = 'daily' | 'per_stream' | 'weekly';
export type TrendDirection = 'rising' | 'declining' | 'flat';
export type TrendConfidence = 'high' | 'medium' | 'low';
export type AccessLevel = 'anonymous' | 'free' | 'premium' | 'business' | 'streamer';

export interface TrendBlock {
  direction: TrendDirection | null;
  slope_per_day: number | null;
  delta: number | null;
  r_squared: number | null;
  confidence: TrendConfidence | null;
  start_value: number | null;
  end_value: number | null;
  n_points: number;
}

export interface ForecastBand {
  value: number;
  lower: number;
  upper: number;
  saturated: boolean;
}

export interface ForecastBlock {
  forecast_7d: ForecastBand;
  forecast_30d: ForecastBand;
  reliability: TrendConfidence;
  r_squared: number;
  slope_per_day: number;
}

export interface TrendExplanation {
  explanation_en: string;
  explanation_ru: string;
  improvement_signals: { name: string; delta: number }[];
  degradation_signals: { name: string; delta: number }[];
}

export interface BestWorstStream {
  stream_id: string | null;
  date: string | null;
  ti: number | null;
  erv_percent?: number | null;
  classification?: string | null;
  game_name?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface TrendsMeta {
  access_level: AccessLevel;
  data_freshness: 'fresh' | 'stale';
}

// === ERV endpoint (FR-001, M1) ===

export interface ErvPoint {
  date: string;
  erv_percent: number | null;
  erv_min_percent?: number | null;
  erv_max_percent?: number | null;
  erv_absolute: number | null;
  ccv_avg?: number | null;
  ccv?: number | null;
  color: 'green' | 'yellow' | 'red' | null;
  stream_id?: string | null;
}

export interface ErvSummary {
  current: number | null;
  average: number;
  min: number;
  max: number;
  point_count: number;
}

export interface ErvResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    granularity: TrendsGranularity;
    from: string;
    to: string;
    points: ErvPoint[];
    summary: ErvSummary | null;
    trend: TrendBlock;
    forecast: ForecastBlock | null;
    trend_explanation: TrendExplanation;
    best_stream: BestWorstStream | null;
    worst_stream: BestWorstStream | null;
  };
  meta: TrendsMeta;
}

// === Trust Index endpoint (FR-002, M2) ===

export interface TiPoint {
  date: string;
  ti: number | null;
  ti_std?: number | null;
  ti_min?: number | null;
  ti_max?: number | null;
  classification?: string | null;
  stream_id?: string | null;
  confidence?: number | null;
}

export interface TierChangeSummary {
  event_id: string;
  event_type: string;
  from_tier: string | null;
  to_tier: string;
  occurred_at: string;
  hs_before: number | null;
  hs_after: number;
}

export interface TierChanges {
  count: number;
  latest: TierChangeSummary | null;
}

export interface AnomalyMarker {
  anomaly_id: string;
  date: string;
  type: string;
  confidence: number | null;
}

export interface TrustIndexResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    granularity: TrendsGranularity;
    from: string;
    to: string;
    points: TiPoint[];
    summary: ErvSummary | null;
    trend: TrendBlock;
    forecast: ForecastBlock | null;
    trend_explanation: TrendExplanation;
    tier_changes: TierChanges;
    anomaly_markers: AnomalyMarker[];
  };
  meta: TrendsMeta;
}

// === Rehabilitation endpoint (FR-006, M6) ===

export interface RehabilitationBonus {
  bonus_pts_earned: number;
  bonus_pts_max: number;
  qualifying_signals: {
    chatter_to_ccv_percentile: number | null;
    engagement_consistency_percentile: number | null;
  } | null;
  bonus_description_ru: string | null;
  bonus_description_en: string | null;
}

export interface RehabilitationProgress {
  clean_streams_completed: number;
  clean_streams_required: number;
  progress_pct: number;
  completion_percent?: number;
  effective_progress_pct?: number;
}

export interface RehabilitationResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    rehabilitation_active?: boolean;
    active?: boolean;
    incident?: {
      applied_at: string;
      initial_penalty: number;
    };
    progress?: RehabilitationProgress;
    bonus?: RehabilitationBonus;
    current_ti?: number;
    projected_full_recovery?: {
      streams_needed: number;
      estimated_date: string | null;
      estimated_ti: number;
    };
  };
  meta: TrendsMeta;
}

// === Error shape (shared) ===

export interface TrendsApiError {
  error: {
    code: string;
    message: string;
    cta?: { action: string; label: string };
  };
}
