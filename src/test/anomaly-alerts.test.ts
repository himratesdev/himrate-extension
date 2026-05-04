// TASK-085 PR-2: tests для anomaly_alerts wiring (i18n catalog parity + formatter helper).

import { describe, it, expect, beforeAll } from 'vitest';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from '../locales/ru.json';
import en from '../locales/en.json';
import { formatAnomalyAlert } from '../sidepanel/utils/formatAnomalyAlert';
import type { AnomalyAlert } from '../shared/api';

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    resources: { ru: { translation: ru }, en: { translation: en } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
});

describe('anomaly_alerts i18n catalog', () => {
  it('all 7 alert.{type}.title keys present in RU/EN', () => {
    const types = ['ccv_spike', 'confirmed_raid', 'anomaly_wave', 'ti_drop',
                   'chatter_to_ccv_anomaly', 'chat_entropy_drop', 'erv_divergence'];
    for (const type of types) {
      expect(ru).toHaveProperty(`alert.${type}.title`);
      expect(en).toHaveProperty(`alert.${type}.title`);
      expect(ru).toHaveProperty(`alert.${type}.detail`);
      expect(en).toHaveProperty(`alert.${type}.detail`);
    }
  });

  it('confirmed_raid has detail_no_raider variant', () => {
    expect(ru).toHaveProperty('alert.confirmed_raid.detail_no_raider');
    expect(en).toHaveProperty('alert.confirmed_raid.detail_no_raider');
  });

  it('severity aria + dismiss keys present', () => {
    for (const sev of ['info', 'yellow', 'red']) {
      expect(ru).toHaveProperty(`alert.severity.${sev}.aria`);
      expect(en).toHaveProperty(`alert.severity.${sev}.aria`);
    }
    expect(ru).toHaveProperty('alert.dismiss');
    expect(en).toHaveProperty('alert.dismiss');
  });

  it('legal-safe wording — no "бот"/"bot"/"накрутк"/"fake" word in alert texts (word-boundary match)', () => {
    // CR N-3: word-boundary regex avoids false positives типа "bottom"/"robot"/"botanical".
    // Cyrillic + Latin letter classes via Unicode property escapes.
    const forbiddenPatterns = [
      /\bбот\w*/iu,        // бот, боты, ботов, ботный
      /\bbot\b/iu,         // bot only — NOT bottom/robot/botanical
      /\bнакрутк\w*/iu,    // накрутка, накрутки, накруткой
      /\bфейк\w*/iu,
      /\bfake\b/iu,
      /\bcheat\w*/iu,
    ];
    const alertEntries = Object.entries({ ...ru, ...en }).filter(([k]) => k.startsWith('alert.'));
    for (const [key, val] of alertEntries) {
      for (const pattern of forbiddenPatterns) {
        expect(val, `${key} matches forbidden pattern ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});

describe('formatAnomalyAlert helper', () => {
  const t = i18n.t.bind(i18n);
  const baseAlert: AnomalyAlert = {
    id: 'test-id',
    type: 'ccv_spike',
    severity: 'yellow',
    value: 1.5,
    threshold: 1.0,
    window_minutes: 5,
    created_at: '2026-05-04T10:00:00Z',
    metadata: {},
  };

  it('ccv_spike formats with N/M/From/To metadata', () => {
    const r = formatAnomalyAlert({ ...baseAlert, value: 1.5, metadata: { from_ccv: 1000, to_ccv: 2000 } }, t);
    expect(r.title).toBe('Viewer surge');
    expect(r.detail).toContain('+2%');
    expect(r.detail).toContain('5 min');
    expect(r.detail).toContain('1000');
    expect(r.detail).toContain('2000');
  });

  it('confirmed_raid uses detail_no_raider when raider_name absent', () => {
    const alert: AnomalyAlert = { ...baseAlert, type: 'confirmed_raid', value: 100, metadata: { viewers: 100 } };
    const r = formatAnomalyAlert(alert, t);
    expect(r.title).toBe('Confirmed raid');
    expect(r.detail).toBe('Raid: 100 viewers');
  });

  it('confirmed_raid uses detail variant with raider_name', () => {
    const alert: AnomalyAlert = { ...baseAlert, type: 'confirmed_raid', metadata: { raider_name: 'foo', viewers: 50 } };
    const r = formatAnomalyAlert(alert, t);
    expect(r.detail).toContain('@foo');
    expect(r.detail).toContain('50');
  });

  it('chatter_to_ccv_anomaly uses category baseline metadata', () => {
    const alert: AnomalyAlert = {
      ...baseAlert,
      type: 'chatter_to_ccv_anomaly',
      value: 25,
      metadata: { category: 'Just Chatting', baseline_min: 75, baseline_max: 90 },
    };
    const r = formatAnomalyAlert(alert, t);
    expect(r.detail).toContain('25%');
    expect(r.detail).toContain('Just Chatting');
    expect(r.detail).toContain('75-90');
  });

  it('ti_drop formats from/to/delta', () => {
    const alert: AnomalyAlert = {
      ...baseAlert,
      type: 'ti_drop',
      value: 22,
      window_minutes: 30,
      metadata: { from_score: 90, to_score: 68 },
    };
    const r = formatAnomalyAlert(alert, t);
    expect(r.detail).toContain('90');
    expect(r.detail).toContain('68');
    expect(r.detail).toContain('22');
    expect(r.detail).toContain('30');
  });

  it('chat_entropy_drop formats entropy_bits as 2-decimal', () => {
    const alert: AnomalyAlert = { ...baseAlert, type: 'chat_entropy_drop', value: 1.4, metadata: {} };
    const r = formatAnomalyAlert(alert, t);
    expect(r.detail).toContain('1.40');
  });
});
