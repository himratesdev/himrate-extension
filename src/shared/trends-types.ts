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
// Server shape: app/services/trends/api/stability_endpoint_service.rb. Score = 0..1 decimal
// (1 - CV(TI) clamped); UI multiplies × 100 for display.

export type StabilityLabel = 'stable' | 'moderate' | 'volatile' | 'insufficient_data';

export interface PercentileQuartiles {
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
}

export interface StabilityPeerComparisonOk {
  category: string;
  sample_size: number;
  channel_values: {
    ti_avg: number | null;
    erv_avg_percent: number | null;
    stability: number | null;
  };
  percentiles: {
    ti: PercentileQuartiles;
    erv: PercentileQuartiles;
    stability: PercentileQuartiles;
  };
  verdict: { verdict_ru: string | null; verdict_en: string | null };
  insufficient_data?: false;
}

export interface StabilityPeerComparisonInsufficient {
  category: string | null;
  sample_size: number;
  insufficient_data: true;
  reason?: string;
}

export type StabilityPeerComparison = StabilityPeerComparisonOk | StabilityPeerComparisonInsufficient;

export interface StabilityResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    from: string;
    to: string;
    score: number | null;
    label: StabilityLabel;
    cv: number | null;
    ti_mean: number | null;
    ti_std: number | null;
    streams_count: number;
    insufficient_data: boolean;
    reason?: string;
    min_streams_required?: number;
    peer_comparison?: StabilityPeerComparison | null;
  };
  meta: TrendsMeta;
}

// === Anomalies endpoint (FR-004, M4) ===
// Server shape: app/services/trends/api/anomalies_endpoint_service.rb.
// Severity derived client-side from confidence threshold (server emits raw confidence).

export interface AnomalyAttributionDetail {
  source: string;
  confidence: number;
  attributed_at: string;
  raw_source_data?: Record<string, unknown> | null;
}

export interface AnomalyEvent {
  anomaly_id: string;
  date: string;
  stream_id: string;
  type: string;
  cause: string | null;
  confidence: number | null;
  ccv_impact: number | null;
  details: Record<string, unknown> | null;
  attribution: AnomalyAttributionDetail | null;
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

export interface AnomalyPagination {
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
}

export interface AnomaliesResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    from: string;
    to: string;
    total: number;
    unattributed_count: number;
    anomalies: AnomalyEvent[];
    pagination: AnomalyPagination;
    frequency_score: AnomalyFrequencyScore;
    distribution: AnomalyDistribution;
  };
  meta: TrendsMeta;
}

// === Components endpoint (FR-005, M5) ===
// Server shape: app/services/trends/api/components_endpoint_service.rb.
// degradation_signals only (improvement signals not exposed at this endpoint —
// surfaced via /trends/insights MovementInsights). botted_fraction = single
// decimal 0..1 (not block).

export interface ComponentDegradationSignal {
  name: string;
  delta: number;
  start_value: number;
  end_value: number;
}

export type ComponentValue = number | { value: number | null; confidence?: number | null } | null;

export interface ComponentsPoint {
  date: string;
  ti: number | null;
  components: Record<string, ComponentValue>;
}

export interface DiscoveryPhase {
  status: 'organic' | 'anomalous_burst' | 'suspicious' | 'missing' | 'not_applicable';
  score: number | null;
  details_ru: string | null;
  details_en: string | null;
}

export interface FollowerCcvCouplingTimelineEntry {
  date: string;
  r: number | null;
  health: 'healthy' | 'weakening' | 'decoupled' | null;
}

export interface FollowerCcvCouplingSummary {
  current_r: number | null;
  current_health: 'healthy' | 'weakening' | 'decoupled' | null;
  avg_r: number | null;
  healthy_threshold?: number;
  weakening_threshold?: number;
}

export interface ComponentsResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    from: string;
    to: string;
    group: string | null;
    components: string[];
    points: ComponentsPoint[];
    degradation_signals: ComponentDegradationSignal[];
    discovery_phase: DiscoveryPhase | null;
    follower_ccv_coupling_timeline: FollowerCcvCouplingTimelineEntry[];
    follower_ccv_coupling_summary: FollowerCcvCouplingSummary | null;
    botted_fraction: number | null;
  };
  meta: TrendsMeta;
}

// === Comparison endpoint (FR-007, M11) ===
// Server shape: app/services/trends/api/comparison_endpoint_service.rb +
// app/services/trends/analysis/peer_comparison_service.rb. Returns quartile
// percentile object (p25/p50/p75/p90) per metric; UI computes channel position.

export type ComparisonResponse =
  | {
      data: {
        channel_id: string;
        period: TrendsPeriod;
        from: string;
        to: string;
        category: string | null;
        sample_size?: number;
        insufficient_data: true;
        reason: string;
      };
      meta: TrendsMeta;
    }
  | {
      data: {
        channel_id: string;
        period: TrendsPeriod;
        from: string;
        to: string;
        category: string;
        sample_size: number;
        channel_values: {
          ti_avg: number | null;
          erv_avg_percent: number | null;
          stability: number | null;
        };
        percentiles: {
          ti: PercentileQuartiles;
          erv: PercentileQuartiles;
          stability: PercentileQuartiles;
        };
        verdict: { verdict_ru: string | null; verdict_en: string | null };
        insufficient_data?: false;
      };
      meta: TrendsMeta;
    };

// === Categories endpoint (FR-008, M13) ===
// Server shape: app/services/trends/api/categories_endpoint_service.rb +
// app/services/trends/analysis/category_pattern.rb. is_best derived client-side
// from top_category. Per-row baseline reconstructed from value − vs_baseline_delta.

export interface CategoryRow {
  name: string;
  streams_count: number;
  ti_avg: number | null;
  erv_avg_percent: number | null;
  vs_baseline_ti_delta: number | null;
  vs_baseline_erv_delta: number | null;
}

export interface CategoriesResponse {
  data: {
    channel_id: string;
    period: TrendsPeriod;
    from: string;
    to: string;
    categories: CategoryRow[];
    single_category: boolean;
    top_category: string | null;
    total_streams: number;
    verdict: { verdict_ru: string | null; verdict_en: string | null };
  };
  meta: TrendsMeta;
}

// === Weekday patterns endpoint (FR-009, M14) ===
// Server shape: app/services/trends/api/weekday_patterns_endpoint_service.rb +
// app/services/trends/analysis/weekday_pattern.rb. best/worst day fields
// derived client-side from weekday_patterns max/min ti_avg.

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
    from: string;
    to: string;
    insufficient_data: boolean;
    weekday_patterns: Record<WeekdayKey, WeekdayCell>;
    total_days?: number;
    min_days_required?: number;
    insight_ru: string | null;
    insight_en: string | null;
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
