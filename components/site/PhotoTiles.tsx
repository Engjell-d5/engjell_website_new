import Image from 'next/image';
import Link from 'next/link';
import SectionLabel from '@/components/site/SectionLabel';

export interface Tile {
  href: string;
  image: string;
  position?: string;
  label: string;
  keepCase?: boolean;
  title: string;
  body: string;
}

/**
 * Full-bleed photo tiles with the caption set over the lower third. They are
 * the main thing that breaks up the dark: real photographs at full width,
 * edge to edge, between the text sections.
 */
export default function PhotoTiles({ tiles, label = 'What I do' }: { tiles: Tile[]; label?: string }) {
  return (
    <section aria-label={label} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <Link key={t.title} href={t.href} className="tile group">
          <Image
            src={t.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            style={{ objectPosition: t.position ?? '50% 35%' }}
          />
          <span
            aria-hidden="true"
            className="absolute right-6 top-6 z-[2] flex h-11 w-11 items-center justify-center bg-[var(--primary-mint)] font-bold text-[var(--rich-black)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
          <div className="absolute inset-x-0 bottom-0 z-[2] px-7 pb-8 pt-6 md:px-8">
            <SectionLabel keepCase={t.keepCase} className="!text-[var(--primary-mint)]">
              {t.label}
            </SectionLabel>
            <h3 className="mt-2.5 text-[clamp(54px,5vw,76px)] leading-[0.9] tracking-[0.02em] !text-white">{t.title}</h3>
            <p className="mt-2.5 max-w-[22em] text-[15px] leading-relaxed text-[#D5DEE1]">{t.body}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
