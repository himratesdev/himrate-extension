// TASK-039 Phase D2 (CR iter1 fixes): Unit tests for 6 new Trends modules + InsightsBanner + Paywall.
// Mock shapes match actual server responses (verified против endpoint services Phase C2).

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import en from '../locales/en.json';

vi.mock('uplot', () => {
  class UPlotMock {
    destroy() {}
    setData() {}
    setSize() {}
  }
  return { default: UPlotMock };
});

import { StabilityModule } from '../sidepanel/components/tabs/trends/modules/StabilityModule';
import { AnomaliesModule } from '../sidepanel/components/tabs/trends/modules/AnomaliesModule';
import { ComponentsModule } from '../sidepanel/components/tabs/trends/modules/ComponentsModule';
import { ComparisonModule } from '../sidepanel/components/tabs/trends/modules/ComparisonModule';
import { CategoriesModule } from '../sidepanel/components/tabs/trends/modules/CategoriesModule';
import { WeekdayModule } from '../sidepanel/components/tabs/trends/modules/WeekdayModule';
import { InsightsBanner } from '../sidepanel/components/tabs/trends/InsightsBanner';
import { Paywall } from '../sidepanel/components/tabs/trends/Paywall';
import { trendsApi } from '../shared/trends-api';

class ResizeObserverStub {
  observe() {}
  disconnect() {}
  unobserve() {}
}

beforeAll(async () => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
  }
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      resources: { en: { translation: en } },
      interpolation: { escapeValue: false },
    });
  }
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function r(element: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

const META = { access_level: 'premium' as const, data_freshness: 'fresh' as const };

describe('StabilityModule', () => {
  it('renders score (× 100) + label, score 0..1 decimal от server', async () => {
    vi.spyOn(trendsApi, 'getStability').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '2026-03-01', to: '2026-03-30',
          score: 0.88, label: 'stable', cv: 0.12,
          ti_mean: 77, ti_std: 9, streams_count: 28,
          insufficient_data: false,
        },
        meta: META,
      },
    });
    r(<StabilityModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('88 / 100')).toBeInTheDocument());
    expect(screen.getByText('Stable channel')).toBeInTheDocument();
  });

  it('shows InsufficientData когда server returns label=insufficient_data', async () => {
    vi.spyOn(trendsApi, 'getStability').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          score: null, label: 'insufficient_data', cv: null,
          ti_mean: null, ti_std: null, streams_count: 1,
          insufficient_data: true, reason: 'streams_below_min', min_streams_required: 7,
        },
        meta: META,
      },
    });
    r(<StabilityModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Stability needs 7+ streams')).toBeInTheDocument());
  });

  it('renders peer comparison rows когда include_peer_comparison + accessLevel premium', async () => {
    const spy = vi.spyOn(trendsApi, 'getStability').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          score: 0.88, label: 'stable', cv: 0.12,
          ti_mean: 77, ti_std: 9, streams_count: 28,
          insufficient_data: false,
          peer_comparison: {
            category: 'Just Chatting',
            sample_size: 2340,
            channel_values: { ti_avg: 77, erv_avg_percent: 83, stability: 0.88 },
            percentiles: {
              ti: { p25: 70, p50: 75, p75: 82, p90: 88 },
              erv: { p25: 65, p50: 75, p75: 82, p90: 90 },
              stability: { p25: 0.65, p50: 0.77, p75: 0.85, p90: 0.93 },
            },
            verdict: { verdict_ru: 'ru', verdict_en: 'en' },
          },
        },
        meta: META,
      },
    });
    r(<StabilityModule channelId="c1" period="30d" accessLevel="premium" />);
    await waitFor(() => expect(screen.getByText(/Comparison · Just Chatting/)).toBeInTheDocument());
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith('c1', '30d', expect.objectContaining({ includePeerComparison: true }));
  });
});

describe('AnomaliesModule', () => {
  it('renders count + frequency verdict + DoW + paginated event list', async () => {
    vi.spyOn(trendsApi, 'getAnomalies').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          total: 5, unattributed_count: 1,
          anomalies: [
            {
              anomaly_id: 'a1',
              date: '2026-03-15T10:00:00Z',
              stream_id: 's1',
              type: 'ccv_spike_unexplained',
              cause: 'organic raid from another streamer',
              confidence: 0.75,
              ccv_impact: 320,
              details: null,
              attribution: { source: 'raid_organic', confidence: 0.85, attributed_at: '2026-03-15T10:01:00Z' },
            },
          ],
          pagination: { page: 1, per_page: 50, total_pages: 1, has_next: false },
          frequency_score: {
            current_per_month: 5, baseline_per_month: 2, delta_percent: 150,
            verdict: 'elevated',
          },
          distribution: {
            by_day_of_week: { mon: 1, tue: 0, wed: 0, thu: 0, fri: 0, sat: 2, sun: 2 },
            by_type: { raid_organic: 2, ccv_spike_unexplained: 1, platform_cleanup: 2 },
          },
        },
        meta: META,
      },
    });
    r(<AnomaliesModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText(/2\.5×/)).toBeInTheDocument();
    expect(screen.getByText('When anomalies happen')).toBeInTheDocument();
    expect(screen.getAllByText(/raid organic/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+320')).toBeInTheDocument();
  });

  it('CR S-2: handles "insufficient_baseline" verdict explicitly (не fallthrough в normal)', async () => {
    vi.spyOn(trendsApi, 'getAnomalies').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '7d', from: '', to: '',
          total: 1, unattributed_count: 0,
          anomalies: [],
          pagination: { page: 1, per_page: 50, total_pages: 1, has_next: false },
          frequency_score: { current_per_month: 4, baseline_per_month: null, delta_percent: null, verdict: 'insufficient_baseline' },
          distribution: { by_day_of_week: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, by_type: {} },
        },
        meta: META,
      },
    });
    r(<AnomaliesModule channelId="c1" period="7d" />);
    await waitFor(() => expect(screen.getByText('insufficient baseline for comparison')).toBeInTheDocument());
  });

  it('shows event_empty + total_pages > 1 → pagination buttons', async () => {
    vi.spyOn(trendsApi, 'getAnomalies').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '365d', from: '', to: '',
          total: 120, unattributed_count: 0, anomalies: [],
          pagination: { page: 1, per_page: 50, total_pages: 3, has_next: true },
          frequency_score: { current_per_month: 0, baseline_per_month: 0, delta_percent: 0, verdict: 'normal' },
          distribution: { by_day_of_week: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, by_type: {} },
        },
        meta: META,
      },
    });
    r(<AnomaliesModule channelId="c1" period="365d" />);
    await waitFor(() => expect(screen.getByText('No anomalies in this period')).toBeInTheDocument());
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});

describe('ComponentsModule', () => {
  it('renders contribution stack из degradation_signals + Discovery + Coupling + Botted', async () => {
    vi.spyOn(trendsApi, 'getComponents').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          group: null,
          components: ['auth_ratio', 'engagement'],
          points: [
            { date: '2026-03-01T00:00:00Z', ti: 70, components: { auth_ratio: 35, engagement: 25 } },
          ],
          degradation_signals: [
            { name: 'auth_ratio', delta: -3, start_value: 38, end_value: 35 },
            { name: 'engagement', delta: -1, start_value: 26, end_value: 25 },
          ],
          discovery_phase: { status: 'organic', score: 0.82, details_ru: 'ru', details_en: 'Organic growth' },
          follower_ccv_coupling_timeline: [{ date: '2026-03-01', r: 0.78, health: 'healthy' }],
          follower_ccv_coupling_summary: { current_r: 0.78, current_health: 'healthy', avg_r: 0.75 },
          botted_fraction: 0,
        },
        meta: META,
      },
    });
    r(<ComponentsModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText(/Channel growth type:/)).toBeInTheDocument());
    expect(screen.getByText(/Followers ↔ viewers coupling:/)).toBeInTheDocument();
    expect(screen.getByText('Streams with inflation signs')).toBeInTheDocument();
    expect(screen.getByText(/None detected/)).toBeInTheDocument();
  });

  it('shows InsufficientData когда no points + no degradation signals', async () => {
    vi.spyOn(trendsApi, 'getComponents').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          group: null, components: [], points: [],
          degradation_signals: [],
          discovery_phase: null, follower_ccv_coupling_timeline: [],
          follower_ccv_coupling_summary: null, botted_fraction: null,
        },
        meta: META,
      },
    });
    r(<ComponentsModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Component breakdown needs 14+ days')).toBeInTheDocument());
  });
});

describe('ComparisonModule', () => {
  it('renders top-pct (derived from quartile percentiles) + verdict', async () => {
    vi.spyOn(trendsApi, 'getComparison').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          category: 'Just Chatting',
          sample_size: 2340,
          channel_values: { ti_avg: 92, erv_avg_percent: 83, stability: 0.88 },
          percentiles: {
            ti: { p25: 60, p50: 70, p75: 80, p90: 88 },
            erv: { p25: 60, p50: 70, p75: 80, p90: 90 },
            stability: { p25: 0.5, p50: 0.65, p75: 0.8, p90: 0.9 },
          },
          verdict: { verdict_ru: 'ru', verdict_en: 'Channel performs above peer median' },
        },
        meta: META,
      },
    });
    r(<ComparisonModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Just Chatting')).toBeInTheDocument());
    // ti=92 > p90=88 → rank≈95, top≈5%
    expect(screen.getByText(/Top 5%/)).toBeInTheDocument();
  });

  it('shows InsufficientData когда server returns insufficient_data=true', async () => {
    vi.spyOn(trendsApi, 'getComparison').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', from: '', to: '',
          category: null,
          insufficient_data: true,
          reason: 'no_category_history',
        },
        meta: META,
      },
    });
    r(<ComparisonModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Minimum 3 streams required')).toBeInTheDocument());
  });
});

describe('CategoriesModule', () => {
  it('renders per-category cards + best badge derived из top_category', async () => {
    vi.spyOn(trendsApi, 'getCategories').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '90d', from: '', to: '',
          categories: [
            { name: 'Just Chatting', streams_count: 28, ti_avg: 74, erv_avg_percent: 81, vs_baseline_ti_delta: 3, vs_baseline_erv_delta: 5 },
            { name: 'Fortnite', streams_count: 6, ti_avg: 81, erv_avg_percent: 88, vs_baseline_ti_delta: 10, vs_baseline_erv_delta: 11 },
          ],
          single_category: false,
          top_category: 'Fortnite',
          total_streams: 34,
          verdict: { verdict_ru: 'ru', verdict_en: 'Best in Fortnite' },
        },
        meta: META,
      },
    });
    r(<CategoriesModule channelId="c1" period="90d" />);
    await waitFor(() => expect(screen.getByText('Fortnite')).toBeInTheDocument());
    expect(screen.getByText('Just Chatting')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    // baseline Just Chatting TI = 74 - 3 = 71
    expect(screen.getAllByText(/avg 71/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('WeekdayModule', () => {
  it('derives best/worst day client-side from weekday_patterns', async () => {
    vi.spyOn(trendsApi, 'getWeekdayPatterns').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '90d', from: '', to: '',
          insufficient_data: false,
          weekday_patterns: {
            mon: { ti_avg: 78, erv_avg_percent: 82, streams_count: 12 },
            tue: { ti_avg: 76, erv_avg_percent: 80, streams_count: 11 },
            wed: { ti_avg: 75, erv_avg_percent: 79, streams_count: 10 },
            thu: { ti_avg: 77, erv_avg_percent: 81, streams_count: 11 },
            fri: { ti_avg: 81, erv_avg_percent: 87, streams_count: 12 },
            sat: { ti_avg: 70, erv_avg_percent: 74, streams_count: 8 },
            sun: { ti_avg: 68, erv_avg_percent: 72, streams_count: 7 },
          },
          total_days: 71,
          insight_ru: 'ru', insight_en: 'Friday is best',
        },
        meta: META,
      },
    });
    r(<WeekdayModule channelId="c1" period="90d" />);
    await waitFor(() => expect(screen.getByText('Friday')).toBeInTheDocument());
    expect(screen.getByText('Sunday')).toBeInTheDocument();
    expect(screen.getByText('Best day')).toBeInTheDocument();
    expect(screen.getByText('Worst day')).toBeInTheDocument();
  });

  it('shows InsufficientData когда insufficient_data=true', async () => {
    vi.spyOn(trendsApi, 'getWeekdayPatterns').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '7d', from: '', to: '',
          insufficient_data: true,
          weekday_patterns: {
            mon: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            tue: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            wed: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            thu: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            fri: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            sat: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
            sun: { ti_avg: null, erv_avg_percent: null, streams_count: 0 },
          },
          min_days_required: 14,
          insight_ru: null, insight_en: null,
        },
        meta: META,
      },
    });
    r(<WeekdayModule channelId="c1" period="7d" />);
    await waitFor(() => expect(screen.getByText('Component breakdown needs 14+ days')).toBeInTheDocument());
  });
});

describe('InsightsBanner', () => {
  it('renders P0/P1/P2 cards и dismiss persistance в localStorage', async () => {
    vi.spyOn(trendsApi, 'getInsights').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          insights: [
            { priority: 'P0', icon: '🔴', message_ru: 'ru', message_en: 'TI dropped 12 pts', action: 'view_components' },
            { priority: 'P2', icon: '🟢', message_ru: 'ru', message_en: 'No anomalies', action: null },
          ],
        },
        meta: META,
      },
    });

    localStorage.clear();
    r(<InsightsBanner channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('TI dropped 12 pts')).toBeInTheDocument());
    expect(screen.getByText('No anomalies')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0]);
    await waitFor(() => expect(screen.queryByText('TI dropped 12 pts')).not.toBeInTheDocument());

    const stored = JSON.parse(localStorage.getItem('trends_insights_dismissed_c1') ?? '[]');
    expect(stored.length).toBe(1);
  });

  it('returns null когда API returns empty insights', async () => {
    vi.spyOn(trendsApi, 'getInsights').mockResolvedValue({
      ok: true,
      data: {
        data: { channel_id: 'c1', period: '30d', insights: [] },
        meta: META,
      },
    });

    const { container } = r(<InsightsBanner channelId="c1" period="30d" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});

describe('Paywall', () => {
  it('Free variant renders 6 features + Premium tier + CTA fires onUpgrade', () => {
    const onUpgrade = vi.fn();
    r(<Paywall variant="free" onUpgrade={onUpgrade} />);
    expect(screen.getByText('Real Viewers')).toBeInTheDocument();
    expect(screen.getByText('Anomaly Detector')).toBeInTheDocument();
    expect(screen.getByText('Premium $9.99/mo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Unlock full access/ }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it('Business variant renders 365d + peers + CTA fires onUpgrade', () => {
    const onUpgrade = vi.fn();
    r(<Paywall variant="business" onUpgrade={onUpgrade} />);
    expect(screen.getByText('365 days of history')).toBeInTheDocument();
    expect(screen.getByText('Peer comparison')).toBeInTheDocument();
    expect(screen.getByText('Business $99/mo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Unlock full access/ }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });
});
