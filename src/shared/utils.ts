// TASK-019: Badge utilities — CCV formatter + badge color by Trust Index

export const BADGE_COLORS = {
  green: '#059669',   // TI 80-100
  yellow: '#D97706',  // TI 50-79
  orange: '#EA580C',  // TI 25-49
  red: '#DC2626',     // TI 0-24
  grey: '#9CA3AF',    // no data
} as const;

export function formatCCV(ccv: number): string {
  if (ccv < 1000) return ccv.toString();
  if (ccv < 9950) return (ccv / 1000).toFixed(1) + 'K';
  if (ccv < 999500) return Math.round(ccv / 1000) + 'K';
  return (ccv / 1000000).toFixed(1) + 'M';
}

export function getBadgeColor(ti: number | null): string {
  if (ti === null) return BADGE_COLORS.grey;
  if (ti >= 80) return BADGE_COLORS.green;
  if (ti >= 50) return BADGE_COLORS.yellow;
  if (ti >= 25) return BADGE_COLORS.orange;
  return BADGE_COLORS.red;
}

const SYSTEM_PAGES = [
  'directory', 'settings', 'subscriptions', 'inventory',
  'drops', 'wallet', 'friends', 'videos', 'moderator',
  'downloads', 'turbo', 'store', 'prime',
];

export function extractChannel(url: string): string | null {
  const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (!match) return null;
  const username = match[1].toLowerCase();
  return SYSTEM_PAGES.includes(username) ? null : username;
}
