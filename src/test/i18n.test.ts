import { describe, it, expect } from 'vitest';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

describe('i18n locale files', () => {
  it('RU and EN have the same keys', () => {
    const ruKeys = Object.keys(ru).sort();
    const enKeys = Object.keys(en).sort();
    expect(ruKeys).toEqual(enKeys);
  });

  it('no empty values in RU', () => {
    const emptyKeys = Object.entries(ru).filter(([_, v]) => !v.trim());
    expect(emptyKeys).toEqual([]);
  });

  it('no empty values in EN', () => {
    const emptyKeys = Object.entries(en).filter(([_, v]) => !v.trim());
    expect(emptyKeys).toEqual([]);
  });

  it('has all required label keys', () => {
    const requiredKeys = [
      'label.real_viewers',
      'label.twitch_online',
      'label.erv_suffix',
      'label.streamer_rating',
      'label.streamer_rating_short',
      'label.live',
      'label.offline_indicator',
      'placeholder.null',
      'erv_label.green',
      'erv_label.yellow',
      'erv_label.red',
    ];
    for (const key of requiredKeys) {
      expect(ru).toHaveProperty(key);
      expect(en).toHaveProperty(key);
    }
  });

  it('ERV labels contain no forbidden words', () => {
    const forbidden = ['бот', 'bot', 'накрутк', 'фейк', 'fake', 'cheat'];
    const labels = [
      ru['erv_label.green'], ru['erv_label.yellow'], ru['erv_label.red'],
      en['erv_label.green'], en['erv_label.yellow'], en['erv_label.red'],
    ];
    for (const label of labels) {
      for (const word of forbidden) {
        expect(label.toLowerCase()).not.toContain(word);
      }
    }
  });

  it('has minimum 50 keys', () => {
    expect(Object.keys(ru).length).toBeGreaterThanOrEqual(50);
    expect(Object.keys(en).length).toBeGreaterThanOrEqual(50);
  });
});
