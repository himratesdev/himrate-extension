// TASK-039 Phase D2: Unit tests для 6 новых Trends modules + InsightsBanner + Paywall.

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
  it('renders score + label + category baseline', async () => {
    vi.spyOn(trendsApi, 'getStability').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          stability: {
            score: 88, label: 'stable', cv: 0.12, streams_count: 28,
            ti_avg: 77, ti_std: 9, category_avg: 78, category: 'Just Chatting',
          },
          weekly_history: [
            { week_start: '2026-03-01', ti_avg: 82, streams_count: 7 },
            { week_start: '2026-03-08', ti_avg: 84, streams_count: 7 },
          ],
          peer_comparison: {
            category: 'Just Chatting', sample_size: 2340,
            channel_score: 88, p50: 77, p90: 93,
          },
          explanation_ru: 'ru exp', explanation_en: 'Низкая волатильность TI за период',
        },
        meta: META,
      },
    });
    r(<StabilityModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('88 / 100')).toBeInTheDocument());
    expect(screen.getByText('Stable channel')).toBeInTheDocument();
    expect(screen.getByText(/Category average: 78/)).toBeInTheDocument();
  });

  it('shows InsufficientData when label=insufficient_data', async () => {
    vi.spyOn(trendsApi, 'getStability').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          stability: {
            score: 0, label: 'insufficient_data', cv: 0, streams_count: 1,
            ti_avg: 0, ti_std: 0, category_avg: null, category: null,
          },
          weekly_history: [],
          peer_comparison: null,
          explanation_ru: '', explanation_en: '',
        },
        meta: META,
      },
    });
    r(<StabilityModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Stability needs 7+ streams')).toBeInTheDocument());
  });
});

describe('AnomaliesModule', () => {
  it('renders count + frequency verdict + DoW chart', async () => {
    vi.spyOn(trendsApi, 'getAnomalies').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          total: 5, unattributed_count: 1,
          anomalies: [
            { id: 'a1', date: '2026-03-15', type: 'raid_organic', severity: 'medium', attribution: 'raid_organic', description_ru: 'ru', description_en: 'organic raid', ti_delta: -3 },
          ],
          frequency_score: {
            current_per_month: 5, baseline_per_month: 2, delta_percent: 150,
            verdict: 'elevated', verdict_ru: 'ru', verdict_en: 'en',
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
    expect(screen.getByText('organic raid')).toBeInTheDocument();
  });

  it('shows event_empty message when anomalies array is empty', async () => {
    vi.spyOn(trendsApi, 'getAnomalies').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          total: 0, unattributed_count: 0, anomalies: [],
          frequency_score: { current_per_month: 0, baseline_per_month: 0, delta_percent: 0, verdict: 'normal', verdict_ru: '', verdict_en: '' },
          distribution: { by_day_of_week: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }, by_type: {} },
        },
        meta: META,
      },
    });
    r(<AnomaliesModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('No anomalies in this period')).toBeInTheDocument());
  });
});

describe('ComponentsModule', () => {
  it('renders contribution stack + discovery + coupling cards', async () => {
    vi.spyOn(trendsApi, 'getComponents').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          points: [],
          summary: {
            top_components: [
              { name: 'auth_ratio', delta: -3, current_pts: 35, contribution_pct: 35 },
              { name: 'engagement', delta: 0, current_pts: 25, contribution_pct: 25 },
            ],
          },
          improvement_signals: [{ name: 'engagement', delta: 2, current_pts: 25, contribution_pct: 25 }],
          degradation_signals: [{ name: 'auth_ratio', delta: -3, current_pts: 35, contribution_pct: 35 }],
          discovery_phase: { status: 'organic', score: 0.82, details_ru: 'ru', details_en: 'Followers and viewers grow together' },
          follower_ccv_coupling: { health: 'healthy', current_r: 0.78, description_ru: 'ru', description_en: 'Healthy correlation' },
          botted_streams: { count: 0, total_streams: 28, period_label: '30d' },
          explanation_ru: 'ru', explanation_en: 'Components steady',
        },
        meta: META,
      },
    });
    r(<ComponentsModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText(/Channel growth type:/)).toBeInTheDocument());
    expect(screen.getByText(/Followers ↔ viewers coupling:/)).toBeInTheDocument();
    expect(screen.getByText('Streams with inflation signs')).toBeInTheDocument();
    // botted count = 0 → "None detected" message
    expect(screen.getByText(/None detected/)).toBeInTheDocument();
  });

  it('shows InsufficientData when top_components empty', async () => {
    vi.spyOn(trendsApi, 'getComponents').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          points: [], summary: { top_components: [] },
          improvement_signals: [], degradation_signals: [],
          discovery_phase: null, follower_ccv_coupling: null, botted_streams: null,
          explanation_ru: '', explanation_en: '',
        },
        meta: META,
      },
    });
    r(<ComponentsModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Component breakdown needs 14+ days')).toBeInTheDocument());
  });
});

describe('ComparisonModule', () => {
  it('renders top-pct + percentile rows + history', async () => {
    vi.spyOn(trendsApi, 'getComparison').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d',
          category: 'Just Chatting', sample_size: 2340,
          channel: { ti: 77, erv_percent: 83, stability: 88 },
          percentiles: {
            trust_index: { percentile: 88, value: 77, channel_value: 77 },
            erv_percent: { percentile: 82, value: 83, channel_value: 83 },
            stability: { percentile: 90, value: 88, channel_value: 88 },
          },
          percentile_history: [
            { weeks_ago: 4, percentile: 80 },
            { weeks_ago: 0, percentile: 88 },
          ],
        },
        meta: META,
      },
    });
    r(<ComparisonModule channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Top 12%')).toBeInTheDocument());
    expect(screen.getByText('Just Chatting')).toBeInTheDocument();
    expect(screen.getByText(/Better than 88% of 2340 channels/)).toBeInTheDocument();
    expect(screen.getByText('Position dynamics')).toBeInTheDocument();
  });
});

describe('CategoriesModule', () => {
  it('renders per-category cards with baseline ticks + best badge', async () => {
    vi.spyOn(trendsApi, 'getCategories').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '90d',
          categories: [
            { name: 'Just Chatting', streams_count: 28, ti_avg: 74, erv_avg_percent: 81, stability_avg: 85, vs_baseline_ti_delta: 3, vs_baseline_erv_delta: 5, is_best: false },
            { name: 'Fortnite', streams_count: 6, ti_avg: 81, erv_avg_percent: 88, stability_avg: 90, vs_baseline_ti_delta: 10, vs_baseline_erv_delta: 11, is_best: true },
          ],
          baseline: { ti_avg: 71, erv_avg_percent: 76, stability_avg: 77 },
          verdict_ru: 'ru', verdict_en: 'Best in Fortnite',
        },
        meta: META,
      },
    });
    r(<CategoriesModule channelId="c1" period="90d" />);
    await waitFor(() => expect(screen.getByText('Fortnite')).toBeInTheDocument());
    expect(screen.getByText('Just Chatting')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    // Two categories × TI baseline = 71 → 2 baseline cells reading "avg 71".
    expect(screen.getAllByText(/avg 71/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('WeekdayModule', () => {
  it('renders 7-bar chart + best/worst day cards', async () => {
    vi.spyOn(trendsApi, 'getWeekdayPatterns').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '90d',
          weekday_patterns: {
            mon: { ti_avg: 78, erv_avg_percent: 82, streams_count: 12 },
            tue: { ti_avg: 76, erv_avg_percent: 80, streams_count: 11 },
            wed: { ti_avg: 75, erv_avg_percent: 79, streams_count: 10 },
            thu: { ti_avg: 77, erv_avg_percent: 81, streams_count: 11 },
            fri: { ti_avg: 81, erv_avg_percent: 87, streams_count: 12 },
            sat: { ti_avg: 70, erv_avg_percent: 74, streams_count: 8 },
            sun: { ti_avg: 68, erv_avg_percent: 72, streams_count: 7 },
          },
          best_weekday: { day: 'fri', ti_avg: 81, erv_avg_percent: 87 },
          worst_weekday: { day: 'sun', ti_avg: 68, erv_avg_percent: 72 },
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
});

describe('InsightsBanner', () => {
  it('renders P0/P1/P2 cards и dismiss работает с localStorage', async () => {
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

    // Dismiss P0
    fireEvent.click(screen.getAllByRole('button', { name: 'Dismiss' })[0]);
    await waitFor(() => expect(screen.queryByText('TI dropped 12 pts')).not.toBeInTheDocument());

    const stored = JSON.parse(localStorage.getItem('trends_insights_dismissed_c1') ?? '[]');
    expect(stored.length).toBe(1);
  });

  it('returns null when API returns empty insights', async () => {
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
  it('Free variant renders 6 features + Premium tier + CTA', () => {
    const onUpgrade = vi.fn();
    r(<Paywall variant="free" onUpgrade={onUpgrade} />);
    expect(screen.getByText('Real Viewers')).toBeInTheDocument();
    expect(screen.getByText('Anomaly Detector')).toBeInTheDocument();
    expect(screen.getByText('Premium $9.99/mo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Unlock full access/ }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });

  it('Business variant renders 365d + peers + CTA', () => {
    const onUpgrade = vi.fn();
    r(<Paywall variant="business" onUpgrade={onUpgrade} />);
    expect(screen.getByText('365 days of history')).toBeInTheDocument();
    expect(screen.getByText('Peer comparison')).toBeInTheDocument();
    expect(screen.getByText('Business $99/mo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Unlock full access/ }));
    expect(onUpgrade).toHaveBeenCalledOnce();
  });
});
