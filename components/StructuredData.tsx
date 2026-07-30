interface StructuredDataProps {
  type:
    | 'Person'
    | 'Organization'
    | 'Article'
    | 'BlogPosting'
    | 'WebSite'
    | 'BreadcrumbList'
    | 'VideoObject'
    | 'ProfilePage'
    | 'ContactPage'
    | 'CollectionPage'
    | 'ItemList';
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
