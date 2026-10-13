import type { ReactNode } from 'react';

/**
 * "/ JOURNAL". The mint slash is the brand's old breadcrumb mark, kept as the
 * one consistent way a section announces itself.
 *
 * `keepCase` is for labels that carry brand names: an uppercase transform
 * turns "division5 · divisionAI" into "DIVISION5 · DIVISIONAI", and the
 * brands keep their own casing everywhere else on the site.
 */
export default function SectionLabel({
  children,
  as: Tag = 'p',
  id,
  keepCase = false,
  className = '',
}: {
  children: ReactNode;
  as?: 'p' | 'h2' | 'span';
  id?: string;
  keepCase?: boolean;
  className?: string;
}) {
  return (
    <Tag
      id={id}
      className={`label ${keepCase ? '!normal-case !tracking-[0.04em] !text-[13px]' : ''} ${className}`}
    >
      <span className="slash" aria-hidden="true">
        /
      </span>
      {children}
    </Tag>
  );
}
