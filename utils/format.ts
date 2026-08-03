export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationLong(seconds: number): string {
  if (!seconds || seconds < 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return '0';
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1
): string {
  if (value == null || isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return wins / total;
}

export function timeAgo(timestamp: number | string | null | undefined): string {
  if (timestamp == null) return 'Unknown';
  const now = Date.now();
  const ts = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp * 1000;
  const diff = now - ts;
  if (diff < 0) return 'Just now';
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function formatDate(timestamp: number | string | null | undefined): string {
  if (timestamp == null) return 'Unknown';
  const ts = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp * 1000;
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number | string | null | undefined): string {
  if (timestamp == null) return 'Unknown';
  const ts = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp * 1000;
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getWinRateColor(winRate: number): string {
  if (winRate >= 0.55) return 'text-success';
  if (winRate >= 0.5) return 'text-primary';
  if (winRate >= 0.45) return 'text-warning';
  return 'text-destructive';
}

export function getWinRateBg(winRate: number): string {
  if (winRate >= 0.55) return 'bg-success/10 text-success border-success/20';
  if (winRate >= 0.5) return 'bg-primary/10 text-primary border-primary/20';
  if (winRate >= 0.45) return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
}

export function kda(kills: number, deaths: number, assists: number): number {
  if (deaths === 0) return kills + assists;
  return (kills + assists) / deaths;
}

export function formatKDA(kills: number, deaths: number, assists: number): string {
  return `${kills}/${deaths}/${assists}`;
}

export function isRadiant(slot: number): boolean {
  return slot < 128;
}

export function getCountryFlag(code?: string | null): string | null {
  if (!code || code.length !== 2) return null;
  return code.toUpperCase();
}
