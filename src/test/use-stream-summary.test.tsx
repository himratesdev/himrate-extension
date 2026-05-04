// TASK-085 PR-2 (CR N-NEW-1): unit tests для useStreamSummary hook.
// Coverage: disabled state, channelId switch, locale switch, AbortController cancel, null response.

import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useStreamSummary } from '../sidepanel/hooks/useStreamSummary';
import { api } from '../shared/api';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import type { StreamSummaryResponse } from '../shared/api';

const mockResponse: StreamSummaryResponse = {
  data: {
    session_id: 's1',
    started_at: '2026-05-04T10:00:00Z',
    ended_at: '2026-05-04T13:00:00Z',
    duration_seconds: 10800,
    duration_text: '3h 0m',
    peak_viewers: 5000,
    avg_ccv: 3500,
    erv_percent_final: 85,
    erv_count_final: 4250,
    category: 'Just Chatting',
    partial: false,
  },
  meta: { preliminary: false },
};

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources: { ru: { translation: ru }, en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
});

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useStreamSummary hook', () => {
  it('skips fetch когда channelId is null', () => {
    const spy = vi.spyOn(api, 'getStreamLatestSummary');
    const { result } = renderHook(() => useStreamSummary(null, true));
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('skips fetch когда enabled = false', () => {
    const spy = vi.spyOn(api, 'getStreamLatestSummary');
    const { result } = renderHook(() => useStreamSummary('ch-1', false));
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('fetches и returns data когда enabled + channelId present', async () => {
    vi.spyOn(api, 'getStreamLatestSummary').mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useStreamSummary('ch-1', true));
    await waitFor(() => expect(result.current.data).toEqual(mockResponse));
    expect(result.current.loading).toBe(false);
  });

  it('passes locale через i18n.language → Accept-Language', async () => {
    const spy = vi.spyOn(api, 'getStreamLatestSummary').mockResolvedValue(mockResponse);
    renderHook(() => useStreamSummary('ch-1', true));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith('ch-1', 'en', expect.any(AbortSignal));
  });

  it('refetches когда channelId меняется', async () => {
    const spy = vi.spyOn(api, 'getStreamLatestSummary').mockResolvedValue(mockResponse);
    const { rerender } = renderHook(
      ({ id }: { id: string }) => useStreamSummary(id, true),
      { initialProps: { id: 'ch-1' } },
    );
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    rerender({ id: 'ch-2' });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    expect(spy.mock.calls[0][0]).toBe('ch-1');
    expect(spy.mock.calls[1][0]).toBe('ch-2');
  });

  it('aborts in-flight request когда channelId меняется (AbortController)', async () => {
    let firstSignal: AbortSignal | undefined;
    vi.spyOn(api, 'getStreamLatestSummary').mockImplementation((_id, _locale, signal) => {
      if (!firstSignal) firstSignal = signal;
      return new Promise(() => {}); // never resolves
    });
    const { rerender } = renderHook(
      ({ id }: { id: string }) => useStreamSummary(id, true),
      { initialProps: { id: 'ch-1' } },
    );
    await waitFor(() => expect(firstSignal).toBeDefined());
    expect(firstSignal!.aborted).toBe(false);
    rerender({ id: 'ch-2' });
    await waitFor(() => expect(firstSignal!.aborted).toBe(true));
  });

  it('returns data: null когда api returns null (4xx/5xx fallback)', async () => {
    vi.spyOn(api, 'getStreamLatestSummary').mockResolvedValue(null);
    const { result } = renderHook(() => useStreamSummary('ch-1', true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('clears data когда disabled flips к false', async () => {
    vi.spyOn(api, 'getStreamLatestSummary').mockResolvedValue(mockResponse);
    const { result, rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useStreamSummary('ch-1', enabled),
      { initialProps: { enabled: true } },
    );
    await waitFor(() => expect(result.current.data).toEqual(mockResponse));
    act(() => rerender({ enabled: false }));
    expect(result.current.data).toBeNull();
  });
});
