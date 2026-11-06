/**
 * The Albanian pages: /sq (about) and /sq/shkrime/<slug> (translated essays).
 *
 * The AI visibility sweep asks Albanian questions ("Kush janë sipërmarrësit më
 * të njohur të teknologjisë në Shqipëri?", the AI and recruitment experts) and
 * the site never answered any of them, because it had no Albanian text.
 * Engines answer those from Albanian-language pages, so these are the same
 * facts as the English site, in Albanian, with hreflang tying each page to its
 * English original.
 *
 * Every claim mirrors English copy that is already live: lib/bio.ts,
 * the /about chapters, lib/expertise.ts, lib/values.ts, lib/ventures.ts.
 * Change the English first, then this.
 */

export const SQ_ONE_LINE =
  'Engjëll Rraklli ndërton biznese shërbimesh që nuk varen nga themeluesi i tyre: me inxhinierë të verifikuar, agjentë AI dhe sisteme të shkruara, nga Tirana.';

export const SQ_BIOS = {
  short: `${SQ_ONE_LINE} Është themelues i division5 dhe divisionAI, dhe drejton podcastin Scaling the Unscalable.`,
  medium: `${SQ_ONE_LINE} Themeloi division5 në 2015, një platformë që lidh inxhinierë të verifikuar nga Ballkani që punojnë me AI me kompani në Evropë, dhe divisionAI, që ndërton sisteme biznesi me agjentë AI brenda tyre. Flet për përdorimin e agjentëve AI në një kompani reale dhe drejton podcastin Scaling the Unscalable.`,
};

export const SQ_CHAPTERS = [
  {
    when: 'Maj 2015',
    title: 'Pa para, pa rrjet, pa plan B',
    body: 'Themelova division5 në moshën 23 vjeç, pa lidhje, pa para, pa referenca dhe pa përvojë. Plani im zgjati derisa mbaruan paratë, gjë që nuk vonoi shumë. E vetmja mënyrë për ta mbajtur kompaninë gjallë ishte të shisnim shërbime zhvillimi software-i, ndaj këtë shitëm.',
  },
  {
    when: 'Pesë vitet në vijim',
    title: 'Duke u përpjekur të ikja',
    body: 'Sapo u bëmë të qëndrueshëm financiarisht, vazhdova të provoja të kthehesha drejt një produkti. Çdo përpjekje ia hiqte vëmendjen biznesit që paguante rrogat, dhe asnjë produkt nuk shkoi aq larg sa të kishte rëndësi. Unë e quaj tradhti ndaj biznesit tënd, sepse duke parë pas, kjo ishte.',
  },
  {
    when: 'Gjashtë vjet më vonë',
    title: 'Pengesa kishte emrin tim',
    body: 'Klientët ishin të lidhur me mua, jo me kompaninë. Çdo ofertë dhe çdo telefonatë e vështirë priste radhën te unë, dhe unë e lexoja këtë si shenjë se isha i domosdoshëm. Ishte e kundërta. Varësia nga themeluesi nuk është tipar i bizneseve të shërbimeve. Është një fazë, dhe del prej saj duke ndërtuar sisteme.',
  },
  {
    when: '2022',
    title: 'Gjithçka në letër',
    body: 'E shkruam si bëhet realisht puna dhe e futëm në mënyrën si mësojnë njerëzit e rinj, që largimi i dikujt të ishte një pengesë dhe jo një boshllëk. Nisa divisionAI për të vënë software poshtë këtij operacioni, me AI brenda tij dhe jo të ngjitur anash.',
  },
  {
    when: 'Sot',
    title: 'Çfarë u bë',
    body: 'division5 është një platformë që lidh inxhinierë të verifikuar nga i gjithë Ballkani që punojnë me AI me kompani në Evropë e më gjerë. Rekrutimi ynë dikur kërkonte pesë njerëz dhe tani bëhet me dy, sepse agjentët bëjnë punën e montimit dhe një njeri vendos ende për çdo gjë që del nga kompania.',
  },
];

export interface SqEssay {
  slug: string;
  /** The English original on /journal, for hreflang and the "originally in English" link. */
  enSlug: string;
  title: string;
  description: string;
  /** Translated body, same HTML shape as the journal's blog-content. */
  html: string;
}

const img = (file: string) =>
  `<img loading="lazy" decoding="async" src="/api/uploads/${file}" alt="" style="width: 100%; height: auto; display: block; margin: 2em 0px;">`;

export const SQ_ESSAYS: SqEssay[] = [
  {
    slug: 'permbyse-vete-biznesin-tend-me-ai',
    enSlug: 'put-yourself-out-of-business-with-ai',
    title: 'Përmbyse vetë biznesin tënd me AI',
    description:
      'Isha skeptik ndaj AI-së derisa i provova mjetet. Pse gjëja e parë që bëra pas kësaj ishte të mendoja si ta përmbysja vetë biznesin tim.',
    html: [
      '<p>Do ta pranoj: në fillim isha skeptik ndaj AI-së në zhvillimin e software-it.</p>',
      '<p>Nëse e di sa i ndërlikuar është realisht procesi i zhvillimit të software-it, ndoshta e kupton pse dyshoja që AI mund të bënte një punë vërtet të mirë. Mendoja se ishte thjesht zhurmë.</p>',
      '<p>Sigurisht, e kisha gabim.</p>',
      '<p>Mendimi im ndryshoi në momentin që përvesha mëngët dhe i vura mjetet në provë. Fillova të provoja v0 të Vercel, pastaj Lovable, dhe më pas kalova te mjetet e programimit të ndërtuara rreth AI-së, si Claude Code dhe Cursor.</p>',
      '<p>Atëherë e kuptova. Pashë potencialin e vërtetë.</p>',
      '<h2>Lëvizja “e marrë” që ka gjithë kuptimin</h2>',
      `<p>${img('1774527073406-odbb25bedjk.png')}Gjëja e parë që bëra pas kësaj? U ula dhe fillova të mendoja si ta përmbysja vetë biznesin tim.</p>`,
      '<p>Duket e marrë, apo jo? Pse ta sulmosh modelin tënd?</p>',
      '<p>Në fakt, jo.</p>',
      '<p>Besoj fort te një parim themelor: <strong>produktet, shërbimet dhe njerëzit duhet të jenë të dobishëm.</strong> Të jesh i dobishëm do të thotë t’i japësh tregut sa më shumë vlerë.</p>',
      '<p>Nëse në një moment ndalon së dhëni vlerë, ose nëse vlera që jep befas zbehet përballë asaj që mund të bëjë një teknologji e re, atëherë duhet të ndryshosh. Këtu nuk ka negociata.</p>',
      '<h2>Zona e rehatisë është rrezik</h2>',
      `<p>${img('1774527161799-uwkqwulruy.png')}Ndryshimi duket i frikshëm, por është i pashmangshëm. Kjo vlen sidomos në teknologjinë e informacionit, ku i gjithë terreni ndryshon brenda pak muajsh.</p>`,
      '<p>Nuk ke luksin të rrish në zonën tënde të rehatisë. As si profesionist, e aq më pak si biznes. Përshtatja është ajo që njerëzimi ka bërë gjatë gjithë historisë, në çdo revolucion të madh industrial.</p>',
      '<p>Dhe mos u gabo: <strong>AI është një revolucion i madh.</strong></p>',
      '<p>Sot, i njëjti njeri që ishte skeptik vetëm dy vjet më parë mund të thotë me bindje se ky është një nga ndryshimet më të mëdha të jetës sonë.</p>',
      '<p>Është i madh. Nëse nuk e sheh, po zgjedh të mos e shohësh. Nëse beson se fusha ose roli yt nuk do të preket, mendoje sërish. Tashmë po preket, dhe ndikimi do të shumëfishohet ndërsa tregu e përqafon.</p>',
      '<h2>Mjaft me mbrojtjen</h2>',
      `<p>${img('1774527401819-75sn2wehxah.png')}Nëse po e harxhon energjinë duke menduar si të “mbrosh” atë që ke bërë në punë, në karrierë ose në biznes, po e mendon gabim.</p>`,
      '<p>Duhet të mendosh si ta përmirësosh. Ta forcosh. Ta shumëfishosh.</p>',
      '<p>Përdori këto mjete për ta rritur aq shumë rezultatin dhe vlerën tënde, saqë të jetë absurde për klientët ose punëdhënësit të <em>mos</em> punojnë me ty.</p>',
      '<p>Mos luaj në mbrojtje. Shko plotësisht në sulm.</p>',
      '<p><strong>A je gati për epokën e AI-së?</strong></p>',
    ].join(''),
  },
  {
    slug: 'beje-rrugetimin-tend-me-qellim',
    enSlug: 'make-your-journey-purposeful',
    title: 'Bëje rrugëtimin tënd me qëllim',
    description:
      'Një biznes shërbimesh B2B nuk do të thotë kurrë se po ndryshon botën. Por të krijosh karriera që u lejojnë të rinjve shqiptarë ta ndërtojnë të ardhmen këtu është një qëllim që ia vlen.',
    html: [
      '<p>Një biznes i mirë duhet të fitojë para. Një biznes i shkëlqyer duhet të ketë një qëllim.</p>',
      '<p>Duke drejtuar një biznes shërbimesh për 10 vitet e fundit, gjithmonë kisha ndjesinë se qëllimi ynë i vetëm ishte të fitonim para, dhe kjo nuk më rrinte mirë.</p>',
      '<p>Mendoje pak.</p>',
      '<p>Të gjitha këto kompani produktesh të njohura thonë se po ndryshojnë botën ose po e bëjnë atë një vend më të mirë. Ky është një qëllim që komunikohet, shitet dhe i bën njerëzit të besojnë lehtë.</p>',
      '<p>E pyesja veten: <em>Cili është qëllimi i biznesit tim?</em></p>',
      '<p>Përgjigjja nuk është e lehtë.</p>',
      '<p>Kur ofron një shërbim B2B, ku kryesisht u shërben bizneseve të tjera, nuk mund të pretendosh se po ndryshon botën. Ndikimi i një biznesi shërbimesh është shumë ndryshe nga ai i një produkti. Ti je mekaniku, jo shoferi. Ti je mbështetja, jo ylli.</p>',
      '<p>Megjithatë, ja çfarë kuptova këto vitet e fundit:</p>',
      '<h2>Nuk ke nevojë të ndryshosh botën që të kesh një qëllim.</h2>',
      `<p>${img('1765220573879-pqssbkmkpvg.png')}Për sa kohë ke ndikim dhe je një forcë për të mirë, mund ta përcaktosh një qëllim.</p>`,
      '<p>Ndonjëherë nuk e kuptojmë për një kohë të gjatë cili është qëllimi ynë.</p>',
      '<p>Unë personalisht nuk e kuptova deri pas shumë vitesh në krye të sipërmarrjes sime. Megjithatë, e dija që fitimi i parave nuk ishte kurrë qëllimi. Kjo vinte nga fakti që paratë nuk më kanë interesuar kurrë vërtet. Paratë kanë qenë gjithmonë thjesht mjeti që të vazhdojmë të bëjmë atë që bëjmë.</p>',
      '<p>Në fillim ndërtonim software. Por ndërsa kaluam te shërbimet e specializuara të shtimit të stafit (staff augmentation), qëllimi ynë u bë i qartë.</p>',
      '<p>Ajo që më pëlqen te drejtimi i një biznesi si <strong>division5</strong> është fakti që mund të krijojmë vende pune dhe mundësi karriere për kaq shumë njerëz të talentuar në Shqipëri.</p>',
      '<p>Nuk duket shumë.</p>',
      '<p>Nuk po shërojmë kancerin as po zgjidhim urinë në botë. Megjithatë, po kemi ndikim dhe po ndihmojmë kaq shumë të rinj shqiptarë ta ndërtojnë të ardhmen e tyre këtu.</p>',
      '<p>Kjo nuk duhet marrë si e mirëqenë.</p>',
      '<p>Këto vitet e fundit, kaq shumë të rinj janë larguar nga vendi. Po përjetojmë një ikje të madhe të trurit dhe kemi nevojë për çdo gjë që mund ta frenojë. Kemi nevojë që njerëzit të qëndrojnë në Shqipëri, të ndërtojnë në Shqipëri dhe ta zgjedhin Shqipërinë për veten dhe për fëmijët e tyre.</p>',
      '<p>Jam i lumtur që po e bëjmë të mundur për disa prej tyre.</p>',
      '<p>Por qëllimi funksionon vetëm kur është i vërtetë.</p>',
      '<h2>Qëllimi nuk mund të shtiret.</h2>',
      `<p>${img('1765220713899-u99mvjtys19.png')}Qëllimi nuk janë fjalët e bukura që shkruan në një blog ose në rrjetet sociale. Nuk është një slajd në prezantimin tënd të shitjeve.</p>`,
      '<p>Nuk mund ta shtiresh.</p>',
      '<p>Edhe nëse ia del për një kohë, nuk do të mund ta mbash gjatë.</p>',
      '<p>Duhet ta duash thellë brenda vetes, me gjithë zemër, dhe veprimet e tua duhet të përputhen me fjalët. Kjo do të thotë të marrësh vendime të vështira. Do të thotë të tregosh mirësi edhe kur, si transaksion, nuk ka kuptim.</p>',
      '<p>Disa njerëz e shtiren qëllimin për të fituar avantazh. Mos u bëj si ata. Gjej atë që i bën ditët e vështira të vlejnë. Mund të mos jetë ndryshimi i gjithë botës, por të ndryshosh botën e dikujt është gjë e madhe.</p>',
    ].join(''),
  },
];

export const SQ_EXPERTISE = [
  {
    name: 'Agjentë AI në operacionet e biznesit',
    body: 'I përdor agjentët brenda kompanive të mia, jo në një demo. Te division5, rekrutimi dikur kërkonte pesë njerëz dhe tani bëhet me dy: agjentët bëjnë punën e montimit në më shumë se 350 mjete, dhe një njeri miraton ende çdo gjë që del nga kompania. divisionAI ndërton të njëjtat sisteme për kompani të tjera.',
    link: { href: `/sq/shkrime/${SQ_ESSAYS[0].slug}`, label: SQ_ESSAYS[0].title },
  },
  {
    name: 'Ekipe inxhinierësh në Shqipëri dhe Kosovë',
    body: 'Ndërtoj ekipe inxhinierësh në Shqipëri që nga 2015, fillimisht për projektet e klientëve të division5 dhe sot si platformë që verifikon inxhinierë nga i gjithë Ballkani që punojnë me AI, për kompani në Evropë e më gjerë.',
    link: { href: 'https://division5.co', label: 'division5' },
  },
  {
    name: 'Rritja e bizneseve të shërbimeve',
    body: 'Kalova një dekadë si pengesa në biznesin tim të shërbimeve, derisa mësova si ta nxjerr veten prej saj. Playbook-u dhe Constraint Sprint janë diagnostikat që dolën nga kjo përvojë.',
    link: { href: '/playbook', label: 'Playbook-u falas (në anglisht)' },
  },
  {
    name: 'Ekosistemi shqiptar i teknologjisë',
    body: 'Shqipëria eksporton njerëzit e saj më të mirë, dhe gjithçka që ndërtoj është një bast se nuk ka pse ta bëjë: kompani në Tiranë që plotësojnë standardin botëror, që inxhinierët e rinj të rriten në punë të nivelit të lartë pa hipur në avion.',
    link: { href: `/sq/shkrime/${SQ_ESSAYS[1].slug}`, label: SQ_ESSAYS[1].title },
  },
];

/** Same order and names as lib/values.ts. */
export const SQ_VALUES = [
  {
    name: 'Mirësia',
    description: 'Mirësia është levë, jo butësi. Një klient i kënaqur paguan faturën. Një klient që të beson të sjell tre të tjerët.',
  },
  {
    name: 'Këmbëngulja',
    description: 'Qëndro me një gjë mjaftueshëm gjatë dhe ajo shumëfishohet. Ndrysho drejtim dhe nis nga zero, pa marrë asgjë me vete.',
  },
  {
    name: 'Disiplina',
    description: 'Shkruaje. Sa herë që kompania ngecte, ajo që e bllokonte ekzistonte vetëm në kokën time.',
  },
  {
    name: 'Durimi',
    description: 'Matësi është fluksi i parasë, jo njoftimi për një investim. Një dekadë rritjeje e qëndrueshme mund një dekadë ndryshimesh drejtimi.',
  },
];

/** Venture lines for /sq, keyed by lib/ventures.ts names. */
export const SQ_VENTURE_LINES: Record<string, string> = {
  division5: 'Platformë që lidh inxhinierë të verifikuar nga Ballkani që punojnë me AI me kompani në Evropë e më gjerë.',
  divisionAI: 'Sisteme biznesi me agjentë AI brenda tyre, për operacione që dikur kërkonin një departament të tërë.',
};
