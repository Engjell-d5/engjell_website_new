'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scroll reveal, with no animation library (added 2026-11-10).
 *
 * Mark an element `.reveal` to fade it up once as it enters the viewport, or
 * a container `.reveal-stagger` to do the same to each direct child, a beat
 * apart. CSS lives in globals.css under "Scroll reveal".
 *
 * Nothing is hidden until this has run. The hiding rule is scoped to
 * `html.reveal-ready`, which is only added after everything already on
 * screen has been marked visible, so there's no flash on load, and visitors
 * without JavaScript (and crawlers, which mostly don't run it) always see
 * the whole page. People who ask for reduced motion never get the class.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    document.querySelectorAll<HTMLElement>('.reveal-stagger:not([data-staggered])').forEach((parent) => {
      parent.dataset.staggered = '';
      Array.from(parent.children).forEach((child, i) => {
        const el = child as HTMLElement;
        el.classList.add('reveal');
        el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 90}ms`);
      });
    });

    const pending = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)'));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      pending.forEach((el) => el.classList.add('is-in'));
      return;
    }

    // Once an element has appeared, drop the reveal styling so its own
    // transitions (a card's hover lift, say) aren't slowed by the reveal's
    // timing and stagger delay.
    const settle = (el: HTMLElement) => {
      el.classList.remove('reveal');
      el.style.removeProperty('--reveal-delay');
    };
    const show = (el: HTMLElement) => {
      el.classList.add('is-in');
      const done = () => settle(el);
      // The one-idea line runs a longer sequence on its pseudo-elements and
      // children, so it only settles on the timer.
      if (!el.classList.contains('parts-line')) {
        el.addEventListener(
          'transitionend',
          (e) => e.target === el && !(e as TransitionEvent).pseudoElement && done(),
          { once: true },
        );
      }
      window.setTimeout(done, 2600);
    };

    // On first load, whatever is already in view stays as it is. After a
    // client-side navigation the page is already reveal-ready, so the new
    // page's visible blocks simply fade in, which reads as a transition.
    if (!root.classList.contains('reveal-ready')) {
      const fold = window.innerHeight * 0.92;
      pending.forEach((el) => {
        if (el.getBoundingClientRect().top < fold) {
          el.classList.add('is-in');
          settle(el);
        }
      });
      root.classList.add('reveal-ready');
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target as HTMLElement);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    pending.forEach((el) => {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
