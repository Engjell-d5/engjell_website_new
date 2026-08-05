/**
 * The four personal values, defined once.
 *
 * They were previously hardcoded as JSX in app/about/page.tsx and restated as a
 * prose sentence in components/Footer.tsx, which is the same drift risk that
 * KNOWS_ABOUT had before it moved to lib/site.ts. Values are load-bearing for
 * the brand rather than decorative, so the two surfaces must not be able to
 * disagree about what they are or what order they come in.
 *
 * `icon` is the lucide export name; the About page maps it to a component so
 * this module stays free of React imports and can be used anywhere.
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
      'Business is ultimately about people. Treating every stakeholder with genuine respect and empathy is non-negotiable.',
  },
  {
    name: 'Persistence',
    icon: 'Mountain',
    description:
      'The path is never straight. Success belongs to those who show up every day, regardless of the obstacles.',
  },
  {
    name: 'Discipline',
    icon: 'ShieldCheck',
    description:
      'Motivation gets you started; discipline keeps you going. It is the bridge between goals and accomplishment.',
  },
  {
    name: 'Patience',
    icon: 'Hourglass',
    description:
      'Real value takes time to build. We play the long game, focusing on sustainable growth over quick wins.',
  },
] as const;

/**
 * Lowercased, comma-joined for running prose, e.g. the footer line
 * "Valuing discipline, persistence, kindness, and patience above all."
 * Takes the names in the order given so a reordering of VALUES cannot leave the
 * footer quietly listing them differently to the About page.
 */
export function valuesSentence(order?: readonly string[]): string {
  const names = order
    ? order.map((n) => n.toLowerCase())
    : VALUES.map((v) => v.name.toLowerCase());
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
