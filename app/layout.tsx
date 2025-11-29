import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createMetadata } from "@/lib/metadata";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = createMetadata({});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://engjellrraklli.com';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personData = {
    name: 'Engjell Rraklli',
    jobTitle: 'Tech Entrepreneur',
    description: 'Building scalable tech and human potential in Tirana. Creative at heart, resilient by practice.',
    url: siteUrl,
    sameAs: [
      'https://www.linkedin.com/in/engjell-rraklli-a8b20a68/',
      'https://x.com/RraklliEngjell',
      'https://www.youtube.com/@engjellrraklli',
    ],
    knowsAbout: ['Technology', 'Entrepreneurship', 'Software Development', 'Startups'],
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
    description: 'Building scalable tech and human potential in Tirana',
    publisher: {
      '@type': 'Person',
      name: 'Engjell Rraklli',
    },
  };

  return (
    <html lang="en">
      <body className="flex flex-col p-2 md:p-6 gap-0 max-w-[1600px] mx-auto">
        <StructuredData type="Person" data={personData} />
        <StructuredData type="WebSite" data={websiteData} />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

