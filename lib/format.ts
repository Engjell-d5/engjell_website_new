// Shared display formatters. These were previously copy-pasted across
// app/journal, app/journal/category, app/journal/[slug], components/Sidebar
// and components/VideoList, with the month format quietly drifting between them.

export function formatDateShort(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateLong(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * YouTube titles carry the guest and the series in the title itself:
 * "How Burnout Redefined My Entrepreneurial Journey - with Gerrit McGowan |
 * Scaling the Unscalable #5". Split them so the page can show the title,
 * the guest and the series as three separate things. Anything that does not
 * match the pattern comes back unchanged as the title.
 */
export function splitEpisodeTitle(raw: string): { title: string; guest: string | null; series: string | null } {
  const clean = raw.replace(/​/g, '').replace(/\s+/g, ' ').trim();
  const [main, ...rest] = clean.split(' | ');
  const series = rest.length ? rest.join(' | ').trim() : null;
  const m = main.match(/^(.*?)\s+[-–]\s+(with .+)$/i);
  return m
    ? { title: m[1].trim(), guest: m[2].trim(), series }
    : { title: main.trim(), guest: null, series };
}

// ISO 8601 duration (YouTube's format, e.g. "PT1H2M3S") -> "1:02:03"
export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
