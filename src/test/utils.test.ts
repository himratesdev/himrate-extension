import { describe, it, expect } from 'vitest';
import { extractChannel, formatCCV, getBadgeColor, BADGE_COLORS } from '../shared/utils';

describe('extractChannel', () => {
  it('extracts username from twitch.tv/username', () => {
    expect(extractChannel('https://www.twitch.tv/shroud')).toBe('shroud');
    expect(extractChannel('https://twitch.tv/xQc')).toBe('xqc');
    expect(extractChannel('https://www.twitch.tv/pokimane/videos')).toBe('pokimane');
  });

  it('returns null for system pages', () => {
    expect(extractChannel('https://www.twitch.tv/directory')).toBeNull();
    expect(extractChannel('https://www.twitch.tv/settings')).toBeNull();
    expect(extractChannel('https://www.twitch.tv/subscriptions')).toBeNull();
    expect(extractChannel('https://www.twitch.tv/videos')).toBeNull();
  });

  it('returns null for root twitch.tv', () => {
    expect(extractChannel('https://www.twitch.tv')).toBeNull();
    expect(extractChannel('https://www.twitch.tv/')).toBeNull();
  });

  it('returns null for non-twitch URLs', () => {
    expect(extractChannel('https://google.com')).toBeNull();
    expect(extractChannel('https://youtube.com/@user')).toBeNull();
  });
});

describe('formatCCV', () => {
  it('formats numbers correctly', () => {
    expect(formatCCV(0)).toBe('0');
    expect(formatCCV(847)).toBe('847');
    expect(formatCCV(999)).toBe('999');
    expect(formatCCV(1000)).toBe('1.0K');
    expect(formatCCV(3200)).toBe('3.2K');
    expect(formatCCV(9949)).toBe('9.9K');
    expect(formatCCV(9950)).toBe('10K');
    expect(formatCCV(9999)).toBe('10K');
    expect(formatCCV(10000)).toBe('10K');
    expect(formatCCV(42000)).toBe('42K');
    expect(formatCCV(999499)).toBe('999K');
    expect(formatCCV(999500)).toBe('1.0M');
    expect(formatCCV(1000000)).toBe('1.0M');
    expect(formatCCV(1200000)).toBe('1.2M');
  });
});

describe('getBadgeColor', () => {
  it('returns correct colors by TI range', () => {
    expect(getBadgeColor(100)).toBe(BADGE_COLORS.green);
    expect(getBadgeColor(85)).toBe(BADGE_COLORS.green);
    expect(getBadgeColor(80)).toBe(BADGE_COLORS.green);
    expect(getBadgeColor(79)).toBe(BADGE_COLORS.yellow);
    expect(getBadgeColor(50)).toBe(BADGE_COLORS.yellow);
    expect(getBadgeColor(49)).toBe(BADGE_COLORS.orange);
    expect(getBadgeColor(25)).toBe(BADGE_COLORS.orange);
    expect(getBadgeColor(24)).toBe(BADGE_COLORS.red);
    expect(getBadgeColor(0)).toBe(BADGE_COLORS.red);
  });

  it('returns grey for null', () => {
    expect(getBadgeColor(null)).toBe(BADGE_COLORS.grey);
  });
});
