// TASK-085 PR-2: helper mapping AnomalyAlert → translated {title, detail} pair.
// Frontend i18n catalog mirrors backend `config/locales/alerts.{ru,en}.yml` (FR-026).
// Per alert.type, extracts metadata fields → t() interpolation values.
//
// Rules:
// - Returns null detail если alert.metadata доесн't supply required interpolation vars
//   (renders title only — graceful degradation, no broken `{{N}}` placeholders).
// - confirmed_raid uses detail_no_raider variant when raider_name absent.

import type { TFunction } from 'i18next';
import type { AnomalyAlert } from '../../shared/api';

export interface FormattedAlert {
  title: string;
  detail: string | null;
}

export function formatAnomalyAlert(alert: AnomalyAlert, t: TFunction): FormattedAlert {
  const { type, value, metadata } = alert;
  const meta = metadata ?? {};
  const titleKey = `alert.${type}.title`;
  const title = t(titleKey);

  switch (type) {
    case 'ccv_spike': {
      const N = Math.abs(value ?? 0).toFixed(0);
      const From = meta.from_ccv ?? meta.From ?? '?';
      const To = meta.to_ccv ?? meta.To ?? '?';
      return { title, detail: t('alert.ccv_spike.detail', { N, M: alert.window_minutes, From, To }) };
    }

    case 'confirmed_raid': {
      const raider = meta.raider_name as string | undefined;
      const viewers = meta.viewers ?? value ?? 0;
      const detail = raider
        ? t('alert.confirmed_raid.detail', { raider, viewers })
        : t('alert.confirmed_raid.detail_no_raider', { viewers });
      return { title, detail };
    }

    case 'anomaly_wave': {
      const N = meta.new_accounts ?? value ?? 0;
      return { title, detail: t('alert.anomaly_wave.detail', { N, M: alert.window_minutes }) };
    }

    case 'ti_drop': {
      const From = meta.from_score ?? '?';
      const To = meta.to_score ?? '?';
      const N = Math.abs(value ?? 0).toFixed(0);
      return { title, detail: t('alert.ti_drop.detail', { From, To, N, M: alert.window_minutes }) };
    }

    case 'chatter_to_ccv_anomaly': {
      const N = (value ?? 0).toFixed(0);
      const Category = meta.category ?? '—';
      const Min = meta.baseline_min ?? '?';
      const Max = meta.baseline_max ?? '?';
      return { title, detail: t('alert.chatter_to_ccv_anomaly.detail', { N, Category, Min, Max }) };
    }

    case 'chat_entropy_drop': {
      const N = (value ?? 0).toFixed(2);
      return { title, detail: t('alert.chat_entropy_drop.detail', { N }) };
    }

    case 'erv_divergence': {
      const N = Math.abs(value ?? 0).toFixed(0);
      return { title, detail: t('alert.erv_divergence.detail', { N, M: alert.window_minutes }) };
    }

    default:
      return { title, detail: null };
  }
}
