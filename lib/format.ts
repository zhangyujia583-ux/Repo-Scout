const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function formatStars(stars: number): string {
  const value = Number.isFinite(stars) ? Math.max(0, Math.round(stars)) : 0;
  if (value < 1000) return String(value);
  if (value < 10_000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  if (value < 1_000_000) return `${Math.round(value / 1000)}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function formatCount(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return new Intl.NumberFormat("en-US").format(safe);
}

export function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatReset(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "UTC",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date) + " UTC"
  );
}

export function formatRelative(then: Date, now: Date): string {
  const delta = now.getTime() - then.getTime();
  if (!Number.isFinite(delta) || delta < HOUR_MS) return "just now";
  const hours = Math.round(delta / HOUR_MS);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(delta / DAY_MS);
  if (days <= 1) return "yesterday";
  if (days < 45) return `${days} days ago`;
  const months = Math.round(days / 30.44);
  if (months < 12) return months <= 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.round(days / 365.25);
  return years <= 1 ? "1 year ago" : `${years} years ago`;
}
