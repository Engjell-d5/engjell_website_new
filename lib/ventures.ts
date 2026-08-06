// Single source of truth for the ventures. The ventures page, the footer,
// the about-page structured data, the homepage metric strip and the ventures
// sidebar all read from here, so adding or retiring one is a single edit and
// the "N Active" counter can never disagree with the cards on screen.
export interface Venture {
  name: string;
  url: string;
  /** One line, used verbatim on the card AND in the Organization schema. */
  description: string;
  image: string;
  role: string;
}

export const VENTURES: Venture[] = [
  {
    name: 'division5',
    url: 'https://division5.co',
    description:
      'A staffing marketplace connecting vetted AI-native engineers across the Balkans with companies in Europe and beyond.',
    image: '/ventures-division5.jpg',
    role: 'Founder',
  },
  {
    name: 'divisionAI',
    url: 'https://divisionai.co',
    description: 'Artificial intelligence solutions and AI-powered products.',
    image: '/ventures-divisionai.jpg',
    role: 'Founder',
  },
];

export const VENTURE_COUNT = VENTURES.length;
