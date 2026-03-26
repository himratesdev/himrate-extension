import { describe, it, expect } from 'vitest';
import { api } from '../shared/api';

describe('API client stub', () => {
  it('getChannel returns null (stub)', async () => {
    const result = await api.getChannel('test123');
    expect(result).toBeNull();
  });

  it('getTrust returns null (stub)', async () => {
    const result = await api.getTrust('test123');
    expect(result).toBeNull();
  });
});
