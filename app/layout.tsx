import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import dynamic from "next/dynamic";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createMetadata } from "@/lib/metadata";
import StructuredData from "@/components/StructuredData";

// Dynamically import Sidebar to reduce initial bundle size
const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  ssr: false, // Sidebar is client-only anyway
});

// Optimize Montserrat font loading - non-blocking
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Prevents render blocking
  variable: "--font-montserrat",
  preload: false, // Changed to false - let Next.js optimize
  adjustFontFallback: true,
});

// Optimize Bebas Neue font loading - non-blocking
// Font file is in app/fonts directory
const bebasNeue = localFont({
  src: "./fonts/BebasNeue-Bold.ttf",
  weight: "700",
  style: "normal",
  display: "swap", // Prevents render blocking
  variable: "--font-bebas",
  preload: false, // Changed to false - let Next.js optimize
  fallback: ['sans-serif', 'Arial', 'Helvetica'],
  adjustFontFallback: false,
});

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
    <html lang="en" className={`${montserrat.variable} ${bebasNeue.variable}`}>
      <body className={`${montserrat.className} flex flex-col p-2 md:p-6 gap-0 max-w-[1600px] mx-auto`}>
        <StructuredData type="Person" data={personData} />
        <StructuredData type="WebSite" data={websiteData} />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

