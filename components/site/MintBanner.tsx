import type { ReactNode } from 'react';

/**
 * One loud moment per page: a tilted mint strip with the line set in Bebas
 * at banner size. Used sparingly, it is what stops a dark page reading as one
 * long sheet. Whatever follows (intro copy, links) sits underneath.
 */
export default function MintBanner({
  text,
  as: Tag = 'h2',
  id,
  children,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'p';
  id?: string;
  children?: ReactNode;
}) {
  return (
    <section className="sec-deep relative overflow-hidden pb-[clamp(36px,4vw,56px)] pt-[clamp(48px,6vw,88px)]" aria-labelledby={id}>
      <div className="banner-strip">
        <Tag id={id}>{text}</Tag>
      </div>
      {children && <div className="wrap mt-[clamp(36px,4vw,56px)]">{children}</div>}
    </section>
  );
}
