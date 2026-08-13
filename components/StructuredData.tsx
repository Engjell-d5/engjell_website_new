interface StructuredDataProps {
  type:
    | 'Person'
    | 'Organization'
    | 'Article'
    | 'BlogPosting'
    | 'WebSite'
    | 'BreadcrumbList'
    | 'VideoObject'
    // A profile OF someone. Google treats mainEntity as required on this type,
    // so only use it for /about and /speaking, never for a page that sells
    // something.
    | 'ProfilePage'
    // Something offered for money or for free, with a provider. The Constraint
    // Sprint, not a page about a person.
    | 'Service'
    // Questions and answers that appear verbatim on the page. Google requires
    // the visible copy to match, and assistants lift these wholesale, so the
    // page copy and the schema must be generated from one source.
    | 'FAQPage'
    | 'ContactPage'
    | 'CollectionPage'
    | 'ItemList'
    // Downloadable assets such as the playbook PDF. schema.org's precise type
    // for "a document you can have", as distinct from a page about one.
    | 'DigitalDocument';
  data: Record<string, any>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseData) }}
    />
  );
}

interface BreadcrumbCrumb {
  name: string;
  url: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbCrumb[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';
  const itemListElement = items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: c.url.startsWith('http') ? c.url : `${siteUrl}${c.url}`,
  }));

  return (
    <StructuredData
      type="BreadcrumbList"
      data={{ itemListElement }}
    />
  );
}
