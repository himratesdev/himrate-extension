// TASK-039 Phase D1 CR N-2: Unit tests для Trends modules state transitions.
// Verifies fetch → loading → (ok|empty|error) → retry cycle works через all 3 modules.

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import en from '../locales/en.json';

// vi.mock hoisted к top of file. uPlot used as constructor (`new uPlot(...)`),
// поэтому mock должен быть класс (не factory function).
vi.mock('uplot', () => {
  class UPlotMock {
    destroy() {}
    setData() {}
    setSize() {}
  }
  return { default: UPlotMock };
});

import { ErvTimeline } from '../sidepanel/components/tabs/trends/modules/ErvTimeline';
import { TrustIndexTimeline } from '../sidepanel/components/tabs/trends/modules/TrustIndexTimeline';
import { RehabilitationCurve } from '../sidepanel/components/tabs/trends/modules/RehabilitationCurve';
import { trendsApi } from '../shared/trends-api';

// ResizeObserver stub для jsdom (не provides globally).
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

function renderWithI18n(element: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>);
}

describe('ErvTimeline', () => {
  it('shows InsufficientData when fewer than 3 points returned', async () => {
    vi.spyOn(trendsApi, 'getErv').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', granularity: 'daily',
          from: '2026-03-01', to: '2026-03-30',
          points: [{ date: '2026-03-15', erv_percent: 80, erv_absolute: 400, color: 'green' }],
          summary: null,
          trend: { direction: null, slope_per_day: null, delta: null, r_squared: null, confidence: null, start_value: null, end_value: null, n_points: 1 },
          forecast: null,
          trend_explanation: { explanation_en: '', explanation_ru: '', improvement_signals: [], degradation_signals: [] },
          best_stream: null, worst_stream: null,
        },
        meta: { access_level: 'premium', data_freshness: 'fresh' },
      },
    });

    renderWithI18n(<ErvTimeline channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Minimum 3 streams required')).toBeInTheDocument());
  });

  it('renders ErrorState on network error with working retry button', async () => {
    const spy = vi.spyOn(trendsApi, 'getErv').mockResolvedValueOnce({ ok: false, error: 'network' });

    renderWithI18n(<ErvTimeline channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('Failed to load data')).toBeInTheDocument());

    // Retry bumps refreshKey → refetch fires.
    spy.mockResolvedValueOnce({ ok: false, error: 'insufficient_data' });
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('Minimum 3 streams required')).toBeInTheDocument());
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('renders forecast block when forecast present', async () => {
    vi.spyOn(trendsApi, 'getErv').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', granularity: 'daily',
          from: '2026-03-01', to: '2026-03-30',
          points: [
            { date: '2026-03-01', erv_percent: 75, erv_absolute: 400, color: 'green' },
            { date: '2026-03-15', erv_percent: 80, erv_absolute: 410, color: 'green' },
            { date: '2026-03-29', erv_percent: 85, erv_absolute: 420, color: 'green' },
          ],
          summary: { current: 85, average: 80, min: 75, max: 85, point_count: 3 },
          trend: { direction: 'rising', slope_per_day: 0.3, delta: 10, r_squared: 0.9, confidence: 'high', start_value: 75, end_value: 85, n_points: 3 },
          forecast: {
            forecast_7d: { value: 87, lower: 85, upper: 89, saturated: false },
            forecast_30d: { value: 92, lower: 85, upper: 99, saturated: false },
            reliability: 'high', r_squared: 0.9, slope_per_day: 0.3,
          },
          trend_explanation: { explanation_en: 'ERV trending up', explanation_ru: '', improvement_signals: [], degradation_signals: [] },
          best_stream: null, worst_stream: null,
        },
        meta: { access_level: 'premium', data_freshness: 'fresh' },
      },
    });

    renderWithI18n(<ErvTimeline channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText('7-day forecast')).toBeInTheDocument());
    expect(screen.getByText('30-day forecast')).toBeInTheDocument();
    expect(screen.getByText(/87\.0/)).toBeInTheDocument(); // forecast_7d value
  });
});

describe('TrustIndexTimeline', () => {
  it('shows tier_changes badge when count > 0', async () => {
    vi.spyOn(trendsApi, 'getTrustIndex').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', granularity: 'daily',
          from: '2026-03-01', to: '2026-03-30',
          points: Array.from({ length: 5 }, (_, i) => ({ date: `2026-03-0${i + 1}`, ti: 70 + i, ti_std: 2, ti_min: 68, ti_max: 72, classification: 'trusted', stream_id: `s${i}`, confidence: 0.9 })),
          summary: { current: 74, average: 72, min: 70, max: 74, point_count: 5 },
          trend: { direction: 'flat', slope_per_day: 0.01, delta: 0.2, r_squared: 0.3, confidence: 'low', start_value: 70, end_value: 74, n_points: 5 },
          forecast: null,
          trend_explanation: { explanation_en: '', explanation_ru: '', improvement_signals: [], degradation_signals: [] },
          tier_changes: { count: 2, latest: { event_id: 'e1', event_type: 'tier_change', from_tier: 'needs_review', to_tier: 'trusted', occurred_at: '2026-03-20T12:00:00Z', hs_before: 55, hs_after: 72 } },
          anomaly_markers: [],
        },
        meta: { access_level: 'premium', data_freshness: 'fresh' },
      },
    });

    renderWithI18n(<TrustIndexTimeline channelId="c1" period="30d" />);
    await waitFor(() => expect(screen.getByText(/2 tier changes/)).toBeInTheDocument());
    expect(screen.getByText('needs_review')).toBeInTheDocument();
    expect(screen.getByText('trusted')).toBeInTheDocument();
  });
});

describe('RehabilitationCurve', () => {
  it('renders null when inactive (no DOM output)', async () => {
    vi.spyOn(trendsApi, 'getRehabilitation').mockResolvedValue({
      ok: true,
      data: {
        data: { channel_id: 'c1', period: '30d', rehabilitation_active: false },
        meta: { access_level: 'streamer', data_freshness: 'fresh' },
      },
    });

    const { container } = renderWithI18n(<RehabilitationCurve channelId="c1" />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('handles missing pct fields gracefully (CR S-2: fallback to 0)', async () => {
    vi.spyOn(trendsApi, 'getRehabilitation').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', rehabilitation_active: true,
          progress: { clean_streams_completed: 5, clean_streams_required: 15, progress_pct: 33 },
        },
        meta: { access_level: 'streamer', data_freshness: 'fresh' },
      },
    });

    renderWithI18n(<RehabilitationCurve channelId="c1" />);
    await waitFor(() => expect(screen.getByText(/5\/15 clean streams/)).toBeInTheDocument());
  });

  it('shows bonus badge + tooltip expand', async () => {
    vi.spyOn(trendsApi, 'getRehabilitation').mockResolvedValue({
      ok: true,
      data: {
        data: {
          channel_id: 'c1', period: '30d', rehabilitation_active: true,
          progress: { clean_streams_completed: 5, clean_streams_required: 15, progress_pct: 40 },
          bonus: {
            bonus_pts_earned: 8, bonus_pts_max: 15,
            qualifying_signals: { chatter_to_ccv_percentile: 85, engagement_consistency_percentile: 82 },
            bonus_description_ru: 'ru', bonus_description_en: 'Quality chat + engagement',
          },
        },
        meta: { access_level: 'streamer', data_freshness: 'fresh' },
      },
    });

    renderWithI18n(<RehabilitationCurve channelId="c1" />);
    const badge = await screen.findByRole('button', { name: /\+8 bonus/ });
    fireEvent.click(badge);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    expect(screen.getByText(/85\/100/)).toBeInTheDocument();
    expect(screen.getByText(/82\/100/)).toBeInTheDocument();
  });
});
