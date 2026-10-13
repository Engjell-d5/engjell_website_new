// Route-level loading state: pages render per request (force-dynamic), so
// this skeleton gives immediate feedback between navigation and response.
// Shaped like a page hero so the layout does not jump when content lands.
//
// NOTE: this boundary was suspected of causing the soft 404s (notFound()
// returning 200 on journal routes). It is not the cause. Removing it entirely
// and redeploying changed nothing, and app/journal/[slug]/page.tsx does not
// even set force-dynamic yet behaves identically. Do not remove it again
// chasing that bug.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading page">
      <section className="sec-dark">
        <div className="wrap animate-pulse pb-24 pt-20">
          <div className="h-3 w-28 bg-[var(--line)]" />
          <div className="mt-6 h-16 w-2/3 bg-[var(--line)]" />
          <div className="mt-3 h-16 w-1/2 bg-[var(--line)]" />
          <div className="mt-8 h-4 w-full max-w-xl bg-[var(--line-soft)]" />
          <div className="mt-3 h-4 w-5/6 max-w-lg bg-[var(--line-soft)]" />
        </div>
      </section>
      <section className="sec-light">
        <div className="wrap h-64" />
      </section>
    </main>
  );
}
