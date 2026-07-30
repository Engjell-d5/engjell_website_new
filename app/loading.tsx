// Route-level loading state: pages render per request (force-dynamic), so
// this skeleton gives immediate feedback between navigation and response.
export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch" aria-busy="true" aria-label="Loading page">
      <main className="classic-panel md:col-span-9 flex flex-col bg-[var(--content-bg)] min-h-[80vh]">
        <div className="h-14 border-b border-[var(--border-color)] flex items-center px-8 shrink-0 bg-[var(--rich-black)]">
          <div className="flex items-center gap-3">
            <span className="text-[var(--primary-mint)] font-bold">/</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-montserrat animate-pulse">Loading</span>
          </div>
        </div>
        <div className="p-6 md:p-10 animate-pulse">
          <div className="h-4 w-24 bg-gray-800 mb-4"></div>
          <div className="h-12 w-2/3 bg-gray-800 mb-8"></div>
          <div className="h-64 w-full bg-gray-800 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-800"></div>
            <div className="h-4 w-11/12 bg-gray-800"></div>
            <div className="h-4 w-4/5 bg-gray-800"></div>
          </div>
        </div>
      </main>
      <aside className="classic-panel md:col-span-3 hidden md:flex flex-col p-6 gap-6 bg-[var(--bg-dark)]">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full bg-gray-800"></div>
          <div className="aspect-video w-full bg-gray-800"></div>
          <div className="h-4 w-3/4 bg-gray-800"></div>
        </div>
      </aside>
    </div>
  );
}
