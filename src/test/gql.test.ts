import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// Import after mocking
import { getIntegrityToken, gqlWithIntegrity, getChattersCount, _resetForTests } from '../shared/gql';

describe('Extension GQL Module', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    _resetForTests();
  });

  describe('getIntegrityToken (FR-018)', () => {
    it('fetches token from /integrity endpoint (TC-030)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'v4.local.test_token_abc',
          expiration: Date.now() + 1800000,
        }),
      });

      const token = await getIntegrityToken();
      expect(token).toBe('v4.local.test_token_abc');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://gql.twitch.tv/integrity',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('caches token until expiration (TC-031)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'v4.local.cached_token',
          expiration: Date.now() + 1800000,
        }),
      });

      const token1 = await getIntegrityToken();
      const token2 = await getIntegrityToken();

      expect(token1).toBe('v4.local.cached_token');
      expect(token2).toBe('v4.local.cached_token');
      // Only 1 fetch call — second call uses cache
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns null on fetch failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network'));

      const token = await getIntegrityToken();
      expect(token).toBeNull();
    });
  });

  describe('gqlWithIntegrity (FR-019)', () => {
    it('sends Client-Integrity header (TC-032)', async () => {
      // First call: integrity token
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'v4.local.integrity_token', expiration: Date.now() + 1800000 }),
      });
      // Second call: GQL query
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { channel: { chatters: { count: 1500 } } } }),
      });

      const result = await gqlWithIntegrity('query { test }', {});
      expect(result?.data).toBeTruthy();

      const gqlCall = fetchMock.mock.calls[1];
      expect(gqlCall[1].headers['Client-Integrity']).toBe('v4.local.integrity_token');
    });

    it('retries on integrity challenge (TC-033)', async () => {
      // First: integrity token
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'v4.local.old_token', expiration: Date.now() + 1800000 }),
      });
      // Second: GQL returns challenge
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { channel: { chatters: null } },
          errors: [{ message: 'failed integrity check' }],
          extensions: { challenge: { type: 'integrity' } },
        }),
      });
      // Third: new integrity token
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'v4.local.new_token', expiration: Date.now() + 1800000 }),
      });
      // Fourth: GQL success
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { channel: { chatters: { count: 500 } } } }),
      });

      const result = await gqlWithIntegrity('query { test }', {});
      expect(result?.data).toBeTruthy();
      // 4 fetch calls: token + gql(fail) + new token + gql(success)
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });
  });

  describe('getChattersCount (FR-020)', () => {
    it('returns chatters count (TC-034)', async () => {
      // Integrity token
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'v4.local.token', expiration: Date.now() + 1800000 }),
      });
      // GQL response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { channel: { chatters: { count: 3200 } } } }),
      });

      const count = await getChattersCount('test_channel');
      expect(count).toBe(3200);
    });

    it('returns null for null channel', async () => {
      // Integrity token
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'v4.local.token', expiration: Date.now() + 1800000 }),
      });
      // GQL response — no channel
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { channel: null } }),
      });

      const count = await getChattersCount('nonexistent');
      expect(count).toBeNull();
    });
  });
});
