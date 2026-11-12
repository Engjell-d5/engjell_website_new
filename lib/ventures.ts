// Single source of truth for the ventures. The ventures page, the footer,
// the about-page structured data, the homepage metric strip and the ventures
// sidebar all read from here, so adding or retiring one is a single edit and
// the "N Active" counter can never disagree with the cards on screen.
export interface Venture {
  name: string;
  url: string;
  /**
   * The venture's own Organization @id on its site. Lets search engines and
   * assistants join the Person here to the company described there, instead
   * of treating "division5" on two sites as two unrelated names.
   */
  entityId: string;
  /** One line, used verbatim on the card AND in the Organization schema. */
  description: string;
  image: string;
  role: string;
  /** Year founded, shown beside the role. */
  since: number;
}

export const VENTURES: Venture[] = [
  {
    name: 'division5',
    url: 'https://division5.co',
    entityId: 'https://division5.co/#organization',
    description:
      'A staffing marketplace connecting vetted AI-native engineers across the Balkans with companies in Europe and beyond.',
    image: '/ventures-division5.jpg',
    role: 'Founder',
    since: 2015,
  },
  {
    name: 'divisionAI',
    url: 'https://divisionai.co',
    entityId: 'https://divisionai.co/#organization',
    // Was 'Artificial intelligence solutions and AI-powered products', which
    // describes every AI company. This is what it actually builds.
    description:
      'Business systems with AI agents inside them, for operations that used to need a whole department.',
    image: '/ventures-divisionai.jpg',
    role: 'Founder',
    // 2025, confirmed by him 2026-11-12 (was 2022, which contradicted the AI
    // timeline: one system Nov 2025, first agents Apr 2026).
    since: 2025,
  },
];

export const VENTURE_COUNT = VENTURES.length;
