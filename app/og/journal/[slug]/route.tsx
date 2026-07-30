import { ImageResponse } from 'next/og';

// Branded share card for journal posts (og:image / twitter:image).
// Lives outside /api/ so robots.txt does not block social crawlers.
//
// Edge runtime on purpose: the nodejs OG path mangles its bundled fallback
// font URL on Windows dev, and edge lets the bundler inline the Bebas font
// via import.meta.url. Post data comes from the site's own public API since
// Prisma cannot run on the edge runtime.
export const runtime = 'edge';

const MINT = '#23C18C';
const RICH_BLACK = '#001823';
const BORDER = '#1a3a4a';

const bebasPromise = fetch(
  new URL('../../../fonts/BebasNeue-Bold.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  let title = 'Field Notes on Building Tech';
  let category = 'Journal';

  try {
    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}/api/blogs/slug/${params.slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.blog?.published) {
        title = data.blog.title || title;
        category = data.blog.category || category;
      }
    }
  } catch {
    // Keep the generic card on any lookup failure.
  }

  if (title.length > 120) title = `${title.slice(0, 117)}…`;
  const titleSize = title.length <= 40 ? 96 : title.length <= 80 ? 76 : 60;

  let bebas: ArrayBuffer | null = null;
  try {
    bebas = await bebasPromise;
  } catch {
    // Never fail the card over a font; render with the default face instead.
  }
  const bebasFamily = bebas ? 'Bebas Neue' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: RICH_BLACK,
          padding: '56px 64px 0',
        }}
      >
        {/* Top bar: brand + label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: 28,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
            <span style={{ color: MINT, fontSize: 44, fontFamily: bebasFamily }}>/</span>
            <span
              style={{
                color: '#ffffff',
                fontSize: 40,
                letterSpacing: 6,
                fontFamily: bebasFamily,
              }}
            >
              ENGJELL RRAKLLI
            </span>
          </div>
          <span style={{ color: '#8fa5ae', fontSize: 22, letterSpacing: 8 }}>FIELD NOTES</span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: titleSize,
              lineHeight: 1.04,
              letterSpacing: 2,
              fontFamily: bebasFamily,
              textTransform: 'uppercase',
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom row: category + domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 26,
            paddingBottom: 34,
          }}
        >
          <span style={{ color: MINT, fontSize: 26, letterSpacing: 6, textTransform: 'uppercase' }}>
            {category}
          </span>
          <span style={{ color: '#8fa5ae', fontSize: 24, letterSpacing: 2 }}>engjellrraklli.com</span>
        </div>

        {/* Mint base bar */}
        <div style={{ display: 'flex', height: 12, margin: '0 -64px', backgroundColor: MINT }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: bebas
        ? [{ name: 'Bebas Neue', data: bebas, weight: 700 as const, style: 'normal' as const }]
        : undefined,
    }
  );
}
