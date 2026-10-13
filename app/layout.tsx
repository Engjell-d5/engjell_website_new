import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createMetadata } from "@/lib/metadata";
import { KNOWS_ABOUT } from "@/lib/site";
import StructuredData from "@/components/StructuredData";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
  preload: true,
  adjustFontFallback: true,
});

// Font file is in app/fonts directory
const bebasNeue = localFont({
  src: "./fonts/BebasNeue-Bold.ttf",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-bebas",
  preload: true,
  fallback: ['sans-serif', 'Arial', 'Helvetica'],
  adjustFontFallback: false,
});

export const metadata: Metadata = createMetadata({});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#001823',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personData = {
    '@id': `${siteUrl}/#person`,
    name: 'Engjell Rraklli',
    jobTitle: 'Homegrown Albanian Tech Entrepreneur',
    description: 'Building scalable tech and human potential in Albania. Creative at heart, resilient by practice.',
    url: siteUrl,
    sameAs: [
      'https://www.linkedin.com/in/engjell-rraklli-a8b20a68/',
      'https://x.com/RraklliEngjell',
      'https://www.youtube.com/@engjellrraklli',
    ],
    knowsAbout: [...KNOWS_ABOUT],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tirana',
      addressCountry: 'AL',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'division5',
      url: 'https://division5.co',
    },
  };

  const websiteData = {
    name: 'Engjell Rraklli',
    url: siteUrl,
    description: 'Building scalable tech and human potential in Albania',
    publisher: {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Engjell Rraklli',
    },
  };

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className={`${montserrat.variable} ${bebasNeue.variable}`}>
      <head>
        {/* Preconnect / DNS prefetch hints for third-party origins used across the site */}
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
        <link rel="preconnect" href="https://i9.ytimg.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        {gaId && (
          <>
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="" />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          </>
        )}
      </head>
      {/* No frame around the page any more: every section runs edge to edge
          and sets its own surface (see globals.css), so the body is just the
          rich-black ground. */}
      <body className={`${montserrat.className} flex flex-col`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <StructuredData type="Person" data={personData} />
        <StructuredData type="WebSite" data={websiteData} />
        <Header />
        {children}
        <Footer />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}

