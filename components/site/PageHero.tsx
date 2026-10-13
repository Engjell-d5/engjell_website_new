import Image from 'next/image';
import type { ReactNode } from 'react';
import SectionLabel from '@/components/site/SectionLabel';

/**
 * The dark opening of every inner page: label, Bebas headline, a short lede,
 * actions, and optionally a photo or any other aside on the right.
 *
 * Headlines pass a <span className="text-[var(--primary-mint)]"> for the
 * mint half, the same move the original homepage made with "FUTURE".
 */
export default function PageHero({
  label,
  title,
  lede,
  actions,
  image,
  aside,
  size = 'lg',
}: {
  label?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  image?: { src: string; alt: string; position?: string; caption?: string; priority?: boolean };
  aside?: ReactNode;
  size?: 'lg' | 'md';
}) {
  const titleSize =
    size === 'lg'
      ? 'text-[clamp(48px,5.6vw,86px)] leading-[0.94]'
      : 'text-[clamp(44px,4.8vw,72px)] leading-[0.95]';
  const side = image || aside;

  return (
    <section className="sec-dark">
      <div className="wrap pb-[clamp(56px,6vw,96px)] pt-[clamp(40px,6vw,96px)]">
        <div className="flex flex-wrap-reverse items-center gap-[clamp(36px,5.5vw,88px)]">
          <div className="min-w-0 flex-[1_1_560px] animate-slide-up">
            {label && <SectionLabel>{label}</SectionLabel>}
            <h1 className={`mt-5 text-balance tracking-[0.012em] ${titleSize}`}>{title}</h1>
            {lede && <div className="lede mt-7 max-w-[34em]">{lede}</div>}
            {actions && <div className="mt-9 flex flex-wrap gap-3">{actions}</div>}
          </div>
          {side && (
            <div className="w-full max-w-[430px] flex-[1_1_300px]">
              {image ? (
                <figure className="m-0">
                  <div>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--deep)]">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        priority={image.priority ?? true}
                        sizes="(min-width: 1024px) 430px, 100vw"
                        className="object-cover"
                        style={{ objectPosition: image.position ?? '50% 30%' }}
                      />
                    </div>
                  </div>
                  {image.caption && <figcaption className="meta mt-4">{image.caption}</figcaption>}
                </figure>
              ) : (
                aside
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
