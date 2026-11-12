/**
 * The free guide "Will AI 10x your business?" (EN) / "A do ta bëjë AI
 * biznesin tuaj x10?" (SQ), added 2026-11-12.
 *
 * The lead magnet for his core offer, AI integration consultancy (/ai-sprint).
 * It is for any business, unlike the Productize and Scale playbook, which is
 * for service founders only. The content is his five steps from the BNA 2026
 * deck; the PDFs are rendered from content/lead-magnets/will-ai-10x-your-
 * business{,-sq}.html (Chrome --headless --print-to-pdf).
 *
 * The title stays a question on purpose: no 10x figure is confirmed, so it must
 * never become a "we 10x'd" claim. The one number, 85%+ automated, is his.
 *
 * Ungated: these pages link the PDF directly, because people arriving from a
 * talk or a link should not have to hand over an address first.
 */

export const AI_GUIDE_PATHS = { en: '/ai-guide', sq: '/sq/udhezuesi-ai' } as const;

export const AI_GUIDE_PDFS = {
  en: '/downloads/will-ai-10x-your-business.pdf',
  sq: '/downloads/a-do-ta-beje-ai-biznesin-tuaj-x10.pdf',
} as const;

export type GuideLocale = keyof typeof AI_GUIDE_PATHS;

export interface GuideCopy {
  label: string;
  titleBefore: string;
  titleMint: string;
  titleAfter: string;
  lede: string;
  download: string;
  otherLanguage: string;
  coverLine: string;
  insideLabel: string;
  insideTitle: string;
  steps: [string, string][];
  hard: string;
  helpLabel: string;
  helpTitle: string;
  aiSprint: string;
  aiSprintLink: string;
  serviceTitle: string;
  service: string;
  serviceLink: string;
  /** Only on the Albanian page: the linked pages are in English. */
  englishNote?: string;
  metaTitle: string;
  metaDescription: string;
}

export const AI_GUIDE_COPY: Record<GuideLocale, GuideCopy> = {
  en: {
    label: 'Free guide · 10 pages',
    titleBefore: 'Will AI ',
    titleMint: '10x',
    titleAfter: ' your business?',
    lede: 'Five steps to put AI into any business, in the order that works, and the three things that make it hard. It is how division5 went from people running every process to more than 85% of them automated in a year, written so you can do the same for your own company.',
    download: 'Download the PDF',
    otherLanguage: 'Shqip',
    coverLine: 'Five steps to put AI into any business, in the order that works.',
    insideLabel: 'What is inside',
    insideTitle: 'Five steps, each ending in something you write down',
    steps: [
      ['List your processes', 'Not the departments. The work, and what each part costs in hours.'],
      ['Put the data in one place', 'AI cannot act on what it cannot see, and it cannot see across four spreadsheets.'],
      ['Build software on the data', 'One system your team really works in, shaped around how the business runs.'],
      ['Add AI agents', 'They read, draft and propose. AI proposes, a person decides.'],
      ['Add automation workflows', 'Last, and only for the steps that follow a fixed rule every time.'],
    ],
    hard: 'And the three things that make it hard: doing it well at a low cost, trusting an agent to act as you, and finding the balance between too much AI and too little.',
    helpLabel: 'Do it with me',
    helpTitle: 'Rather not do it alone?',
    aiSprint:
      'This is the work I do with companies. In the AI Integration Sprint, four remote sessions over two weeks, we go through these five steps for your business and you leave with a written plan.',
    aiSprintLink: 'The AI Integration Sprint',
    serviceTitle: 'Run a service business?',
    service:
      'The Constraint Sprint does the same together with productizing what you sell, so the AI goes onto work that repeats. The free version is the Productize and Scale playbook.',
    serviceLink: 'The Constraint Sprint',
    metaTitle: 'Will AI 10x your business? A free guide',
    metaDescription:
      'A free 10 page guide to putting AI into any business: five steps in the order that works, and the three things that make it hard. From Engjell Rraklli, in English and Albanian.',
  },
  sq: {
    label: 'Udhëzues falas · 10 faqe',
    titleBefore: 'A do ta bëjë AI biznesin tuaj ',
    titleMint: 'x10',
    titleAfter: '?',
    lede: 'Pesë hapa për ta futur AI-në në çdo biznes, në rendin që funksionon, dhe tri gjërat që e bëjnë të vështirë. Kështu kaloi division5 nga proceset që i bënin të gjitha njerëzit në mbi 85% të automatizuara brenda një viti, e shkruar që ta bëni të njëjtën gjë në kompaninë tuaj.',
    download: 'Shkarkoni PDF-në',
    otherLanguage: 'English',
    coverLine: 'Pesë hapa për ta futur AI-në në çdo biznes, në rendin që funksionon.',
    insideLabel: 'Çfarë ka brenda',
    insideTitle: 'Pesë hapa, secili mbyllet me diçka që e shkruani',
    steps: [
      ['Listoni proceset tuaja', 'Jo departamentet. Punën, dhe sa orë kushton secila pjesë e saj.'],
      ['Qendërzoni të dhënat në një vend', 'AI nuk vepron dot mbi atë që nuk e sheh, dhe nuk sheh dot nëpër katër tabela Excel.'],
      ['Ndërtoni software mbi të dhënat', 'Një sistem ku ekipi punon vërtet, i përshtatur me mënyrën si funksionon biznesi.'],
      ['Shtoni agjentë AI', 'Lexojnë, hartojnë dhe propozojnë. AI propozon, njeriu vendos.'],
      ['Shtoni workflow-e automatizimi', 'Të fundit, dhe vetëm për hapat që ndjekin një rregull fiks çdo herë.'],
    ],
    hard: "Dhe tri gjërat që e bëjnë të vështirë: ta bësh mirë me kosto të ulët, t'i besosh një agjenti të veprojë si ti, dhe të gjesh balancën mes shumë AI-je dhe shumë pak.",
    helpLabel: 'Bëjeni me mua',
    helpTitle: 'Nuk doni ta bëni vetëm?',
    aiSprint:
      'Kjo është puna që bëj me kompanitë. Në AI Integration Sprint, katër seanca online në dy javë, i kalojmë këta pesë hapa për biznesin tuaj dhe dilni me një plan të shkruar.',
    aiSprintLink: 'AI Integration Sprint',
    serviceTitle: 'Keni një biznes shërbimesh?',
    service:
      'Constraint Sprint bën të njëjtën gjë së bashku me produktizimin e asaj që shitni, që AI të vendoset mbi punë që përsëritet. Versioni falas është playbook-u Productize and Scale.',
    serviceLink: 'Constraint Sprint',
    englishNote: 'Faqet e mësipërme janë në anglisht.',
    metaTitle: 'A do ta bëjë AI biznesin tuaj x10? Udhëzues falas',
    metaDescription:
      'Udhëzues falas me 10 faqe për ta futur AI-në në çdo biznes: pesë hapa në rendin që funksionon, dhe tri gjërat që e bëjnë të vështirë. Nga Engjëll Rraklli, në shqip dhe anglisht.',
  },
};
