// TASK-085 PR-2: helper mapping AnomalyAlert → translated {title, detail} pair.
// Frontend i18n catalog mirrors backend `config/locales/alerts.{ru,en}.yml` (FR-026).
// Per alert.type, extracts typed metadata fields → t() interpolation values.
//
// Rules (per CR S-1/S-5/S-2):
// - Discriminated union AnomalyAlert narrows metadata по type — no unsafe casts.
// - Snake_case lookup only (backend SRS guarantees Rails convention) — no
//   camelCase fallback (`?? meta.From` removed).
// - value === null OR required metadata missing → returns detail: null
//   (renders title only — graceful, no misleading "+0%" or broken `{{N}}` placeholders).

import type { TFunction } from 'i18next';
import type { AnomalyAlert } from '../../shared/api';

export interface FormattedAlert {
  title: string;
  detail: string | null;
}

export function formatAnomalyAlert(alert: AnomalyAlert, t: TFunction): FormattedAlert {
  const titleKey = `alert.${alert.type}.title`;
  const title = t(titleKey);

  switch (alert.type) {
    case 'ccv_spike': {
      if (alert.value == null) return { title, detail: null };
      const From = alert.metadata.from_ccv;
      const To = alert.metadata.to_ccv;
      if (From == null || To == null) return { title, detail: null };
      return {
        title,
        detail: t('alert.ccv_spike.detail', {
          N: Math.abs(alert.value).toFixed(0),
          M: alert.window_minutes,
          From,
          To,
        }),
      };
    }

    case 'confirmed_raid': {
      const raider = alert.metadata.raider_name;
      const viewers = alert.metadata.viewers ?? alert.value;
      if (viewers == null) return { title, detail: null };
      const detail = raider
        ? t('alert.confirmed_raid.detail', { raider, viewers })
        : t('alert.confirmed_raid.detail_no_raider', { viewers });
      return { title, detail };
    }

    case 'anomaly_wave': {
      const N = alert.metadata.new_accounts ?? alert.value;
      if (N == null) return { title, detail: null };
      return { title, detail: t('alert.anomaly_wave.detail', { N, M: alert.window_minutes }) };
    }

    case 'ti_drop': {
      if (alert.value == null) return { title, detail: null };
      const From = alert.metadata.from_score;
      const To = alert.metadata.to_score;
      if (From == null || To == null) return { title, detail: null };
      return {
        title,
        detail: t('alert.ti_drop.detail', {
          From,
          To,
          N: Math.abs(alert.value).toFixed(0),
          M: alert.window_minutes,
        }),
      };
    }

    case 'chatter_to_ccv_anomaly': {
      if (alert.value == null) return { title, detail: null };
      const Category = alert.metadata.category;
      const Min = alert.metadata.baseline_min;
      const Max = alert.metadata.baseline_max;
      if (!Category || Min == null || Max == null) return { title, detail: null };
      return {
        title,
        detail: t('alert.chatter_to_ccv_anomaly.detail', {
          N: alert.value.toFixed(0),
          Category,
          Min,
          Max,
        }),
      };
    }

    case 'chat_entropy_drop': {
      const entropy = alert.metadata.entropy_bits ?? alert.value;
      if (entropy == null) return { title, detail: null };
      return { title, detail: t('alert.chat_entropy_drop.detail', { N: entropy.toFixed(2) }) };
    }

    case 'erv_divergence': {
      if (alert.value == null) return { title, detail: null };
      return {
        title,
        detail: t('alert.erv_divergence.detail', {
          N: Math.abs(alert.value).toFixed(0),
          M: alert.window_minutes,
        }),
      };
    }

    default: {
      // Exhaustive check — discriminated union ensures unreachable.
      const _exhaustive: never = alert;
      void _exhaustive;
      return { title, detail: null };
    }
  }
}
