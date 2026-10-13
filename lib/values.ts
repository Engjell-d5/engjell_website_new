/**
 * The four personal values, defined once.
 *
 * They were previously hardcoded as JSX in app/about/page.tsx and restated as a
 * prose sentence in components/Footer.tsx, which is the same drift risk that
 * KNOWS_ABOUT had before it moved to lib/site.ts. Values are load-bearing for
 * the brand rather than decorative, so every surface reads them from here.
 *
 * The descriptions are his own lines from the pillar essay rather than
 * definitions. "Motivation gets you started; discipline keeps you going" could
 * be on anyone's site; "the thing blocking it existed only in my head" could
 * only be on this one.
 *
 * `icon` is the lucide export name, kept so this module stays free of React
 * imports; the current About page does not render icons.
 */
export type PersonalValue = {
  name: string;
  icon: 'Heart' | 'Mountain' | 'ShieldCheck' | 'Hourglass';
  description: string;
};

export const VALUES: readonly PersonalValue[] = [
  {
    name: 'Kindness',
    icon: 'Heart',
    description:
      'Kindness is leverage, not softness. A satisfied client pays the invoice. A client who trusts you brings you the next three.',
  },
  {
    name: 'Persistence',
    icon: 'Mountain',
    description:
      'Stay with one thing long enough and it compounds. Change direction and you start from zero, carrying nothing forward.',
  },
  {
    name: 'Discipline',
    icon: 'ShieldCheck',
    description:
      'Write it down. Every time the company was stuck, the thing blocking it existed only in my head.',
  },
  {
    name: 'Patience',
    icon: 'Hourglass',
    description:
      'Cash flow is the measure, not a funding announcement. A decade of compounding beats a decade of pivoting.',
  },
] as const;

/**
 * Lowercased, comma-joined for running prose, e.g.
 * "discipline, persistence, kindness, and patience".
 * Takes the names in the order given so a reordering of VALUES cannot leave a
 * sentence quietly listing them differently to the About page.
 */
export function valuesSentence(order?: readonly string[]): string {
  const names = order
    ? order.map((n) => n.toLowerCase())
    : VALUES.map((v) => v.name.toLowerCase());
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
