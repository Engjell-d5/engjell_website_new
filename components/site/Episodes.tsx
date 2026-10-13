import Image from 'next/image';
import { formatDateShort, formatDuration, splitEpisodeTitle } from '@/lib/format';

export interface Episode {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
}

const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** The big one: thumbnail, a mint "Watch" tab, then series, title and guest. */
export function FeaturedEpisode({ ep, priority = false }: { ep: Episode; priority?: boolean }) {
  const t = splitEpisodeTitle(ep.title);
  return (
    <a href={watchUrl(ep.videoId)} target="_blank" rel="noopener noreferrer" className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden border border-[var(--line)] bg-[var(--deep)]">
        <Image
          src={ep.thumbnailUrl}
          alt={`${t.title}, episode thumbnail`}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-0 left-0 inline-flex items-center gap-2 bg-[var(--primary-mint)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--rich-black)]">
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5v9l7.5-4.5z" fill="currentColor" />
          </svg>
          Watch
        </span>
      </div>
      <p className="meta mt-5">
        {[t.series, formatDuration(ep.duration)].filter(Boolean).join(' · ')}
      </p>
      <h3 className="mt-1.5 text-[clamp(30px,2.6vw,40px)] leading-[1.02] tracking-[0.03em] !text-white transition-colors group-hover:!text-[var(--primary-mint)]">
        {t.title}
      </h3>
      {t.guest && <p className="mt-1.5 text-[15px] text-[var(--text)]">{t.guest}</p>}
    </a>
  );
}

/** A row in the list beside the featured episode. */
export function EpisodeRow({ ep }: { ep: Episode }) {
  const t = splitEpisodeTitle(ep.title);
  return (
    <a
      href={watchUrl(ep.videoId)}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0"
    >
      <div className="relative aspect-video w-[144px] shrink-0 overflow-hidden border border-[var(--line)] bg-[var(--deep)]">
        <Image src={ep.thumbnailUrl} alt="" fill sizes="144px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <h4 className="font-montserrat text-[15px] font-semibold leading-snug tracking-normal !text-white transition-colors group-hover:!text-[var(--primary-mint)]">
          {t.title}
        </h4>
        <p className="meta mt-1.5">
          {[t.series ?? formatDateShort(ep.publishedAt), formatDuration(ep.duration)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </a>
  );
}

/** A card in the full grid on /podcast. */
export function EpisodeCard({ ep }: { ep: Episode }) {
  const t = splitEpisodeTitle(ep.title);
  return (
    <a href={watchUrl(ep.videoId)} target="_blank" rel="noopener noreferrer" className="group block min-w-0">
      <div className="relative aspect-video overflow-hidden border border-[var(--line)] bg-[var(--deep)]">
        <Image
          src={ep.thumbnailUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <p className="meta mt-4">
        {[t.series, formatDuration(ep.duration)].filter(Boolean).join(' · ')}
      </p>
      <h3 className="mt-1 text-[26px] leading-[1.05] tracking-[0.03em] !text-white transition-colors group-hover:!text-[var(--primary-mint)]">
        {t.title}
      </h3>
      {t.guest && <p className="mt-1 text-sm text-[var(--text)]">{t.guest}</p>}
    </a>
  );
}
