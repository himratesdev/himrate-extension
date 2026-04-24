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

// === Stability endpoint (FR-003, M3) ===

export interface StabilityWeeklyPoint {
  week_start: string;
  ti_avg: number;
  streams_count: number;
}

export interface StabilityPeerComparison {
  category: string;
  sample_size: number;
  channel_score: number;
  p50: number;
  p90: number;
}

export interface StabilityResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    stability: {
      score: number;
      label: 'stable' | 'moderate' | 'volatile' | 'insufficient_data';
      cv: number;
      streams_count: number;
      ti_avg: number;
      ti_std: number;
      category_avg: number | null;
      category: string | null;
    };
    weekly_history: StabilityWeeklyPoint[];
    peer_comparison: StabilityPeerComparison | null;
    explanation_ru: string;
    explanation_en: string;
  };
  meta: TrendsMeta;
}

// === Anomalies endpoint (FR-004, M4) ===

export interface AnomalyEvent {
  id: string;
  date: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  attribution: string | null;
  description_ru: string;
  description_en: string;
  ti_delta: number | null;
}

export interface AnomalyFrequencyScore {
  current_per_month: number;
  baseline_per_month: number | null;
  delta_percent: number | null;
  verdict: 'elevated' | 'normal' | 'reduced' | 'insufficient_data';
  verdict_ru: string;
  verdict_en: string;
}

export interface AnomalyDistribution {
  by_day_of_week: Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', number>;
  by_type: Record<string, number>;
}

export interface AnomaliesResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    total: number;
    unattributed_count: number;
    anomalies: AnomalyEvent[];
    frequency_score: AnomalyFrequencyScore;
    distribution: AnomalyDistribution;
  };
  meta: TrendsMeta;
}

// === Components endpoint (FR-005, M5) ===

export interface ComponentSignal {
  name: string;
  delta: number;
  current_pts: number | null;
  contribution_pct: number | null;
}

export interface DiscoveryPhase {
  status: 'organic' | 'anomalous_burst' | 'suspicious' | 'missing' | 'not_applicable';
  score: number | null;
  details_ru: string;
  details_en: string;
}

export interface FollowerCcvCoupling {
  health: 'healthy' | 'weakening' | 'decoupled' | 'insufficient_data';
  current_r: number | null;
  description_ru: string;
  description_en: string;
}

export interface BottedStreamsBlock {
  count: number;
  total_streams: number;
  period_label: string;
}

export interface ComponentsPoint {
  date: string;
  components: Record<string, number | null>;
}

export interface ComponentsResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    points: ComponentsPoint[];
    summary: {
      top_components: ComponentSignal[];
    };
    improvement_signals: ComponentSignal[];
    degradation_signals: ComponentSignal[];
    discovery_phase: DiscoveryPhase | null;
    follower_ccv_coupling: FollowerCcvCoupling | null;
    botted_streams: BottedStreamsBlock | null;
    explanation_ru: string;
    explanation_en: string;
  };
  meta: TrendsMeta;
}

// === Comparison endpoint (FR-007, M11) ===

export interface ComparisonPercentileEntry {
  percentile: number;
  value: number;
  channel_value: number;
}

export interface ComparisonHistoryEntry {
  weeks_ago: number;
  percentile: number;
}

export interface ComparisonResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    category: string | null;
    sample_size: number;
    channel: {
      ti: number;
      erv_percent: number;
      stability: number | null;
    };
    percentiles: {
      trust_index: ComparisonPercentileEntry;
      erv_percent: ComparisonPercentileEntry;
      stability: ComparisonPercentileEntry | null;
    };
    percentile_history: ComparisonHistoryEntry[];
  };
  meta: TrendsMeta;
}

// === Categories endpoint (FR-008, M13) ===

export interface CategoryRow {
  name: string;
  streams_count: number;
  ti_avg: number | null;
  erv_avg_percent: number | null;
  stability_avg: number | null;
  vs_baseline_ti_delta: number | null;
  vs_baseline_erv_delta: number | null;
  is_best: boolean;
}

export interface CategoriesResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    categories: CategoryRow[];
    baseline: {
      ti_avg: number | null;
      erv_avg_percent: number | null;
      stability_avg: number | null;
    };
    verdict_ru: string;
    verdict_en: string;
  };
  meta: TrendsMeta;
}

// === Weekday patterns endpoint (FR-009, M14) ===

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WeekdayCell {
  ti_avg: number | null;
  erv_avg_percent: number | null;
  streams_count: number;
}

export interface WeekdayPatternsResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    weekday_patterns: Record<WeekdayKey, WeekdayCell>;
    best_weekday: { day: WeekdayKey; ti_avg: number; erv_avg_percent: number } | null;
    worst_weekday: { day: WeekdayKey; ti_avg: number; erv_avg_percent: number } | null;
    insight_ru: string;
    insight_en: string;
  };
  meta: TrendsMeta;
}

// === Movement Insights endpoint (FR-010, banner) ===

export interface InsightCard {
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  icon: string;
  message_ru: string;
  message_en: string;
  action: string | null;
  recency_score?: number;
}

export interface InsightsResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    insights: InsightCard[];
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
