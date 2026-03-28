import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock chrome.storage
const sessionStore: Record<string, unknown> = {};
const localStore: Record<string, unknown> = {};

vi.stubGlobal('chrome', {
  storage: {
    session: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: sessionStore[key] })),
      set: vi.fn((data: Record<string, unknown>) => {
        Object.assign(sessionStore, data);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
        return Promise.resolve();
      }),
    },
    local: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: localStore[key] })),
      set: vi.fn((data: Record<string, unknown>) => {
        Object.assign(localStore, data);
        return Promise.resolve();
      }),
      remove: vi.fn(() => Promise.resolve()),
    },
  },
});

// Must re-import after mocking chrome
let apiFetch: typeof import('../shared/api').apiFetch;

describe('api.ts', () => {
  beforeEach(async () => {
    Object.keys(sessionStore).forEach(k => delete sessionStore[k]);
    Object.keys(localStore).forEach(k => delete localStore[k]);
    vi.resetModules();
    const mod = await import('../shared/api');
    apiFetch = mod.apiFetch;
  });

  it('sends Bearer token in Authorization header', async () => {
    sessionStore.access_token = 'test_token';

    const fetchMock = vi.fn().mockResolvedValue({ status: 200, ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/v1/channels');

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.get('Authorization')).toBe('Bearer test_token');
  });

  it('on 401: sends refresh_token in body, not Authorization header', async () => {
    sessionStore.access_token = 'expired';
    localStore.refresh_token = 'my_refresh';

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ status: 401, ok: false })
      .mockResolvedValueOnce({
        status: 200, ok: true,
        json: () => Promise.resolve({ access_token: 'new_token' }),
      })
      .mockResolvedValueOnce({ status: 200, ok: true });

    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/api/v1/channels');

    // Second call = refresh
    const refreshUrl = fetchMock.mock.calls[1][0] as string;
    const refreshOpts = fetchMock.mock.calls[1][1] as RequestInit;

    expect(refreshUrl).toContain('/auth/refresh');
    expect(refreshOpts.body).toBeDefined();

    const body = JSON.parse(refreshOpts.body as string);
    expect(body.refresh_token).toBe('my_refresh');
  });
});
