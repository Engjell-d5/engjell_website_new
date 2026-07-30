// Estimate reading time for HTML blog content at ~200 words per minute.
export function readingTimeMinutes(content: string): number {
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}
