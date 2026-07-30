// Canonical blog categories. Free-text category input has produced duplicates
// that differ only by case or synonym ("AI" vs "Artificial Intelligence",
// "Business" vs "business"), each spawning its own thin category page.
// Normalize at save time so the taxonomy can't drift again.
const CANONICAL: Record<string, string> = {
  'ai': 'AI',
  'artificial intelligence': 'AI',
  'business': 'Business',
  'branding': 'Business',
  'startup': 'Entrepreneurship',
  'startups': 'Entrepreneurship',
  'entrepreneurship': 'Entrepreneurship',
  'culture': 'Culture',
};

export function normalizeCategory(raw: string): string {
  const key = raw.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!key) return raw;
  if (CANONICAL[key]) return CANONICAL[key];
  // Unknown categories get Title Case so casing alone can't create duplicates.
  return key.replace(/\b\w/g, (c) => c.toUpperCase());
}
