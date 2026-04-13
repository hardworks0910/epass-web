/**
 * Shown immediately from the server while the heavy client bundle downloads.
 * Avoids a blank screen on slow mobile networks (Safari was waiting on JS before any paint).
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a] text-white overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/10 blur-[100px] motion-safe:animate-pulse" />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary/10 blur-[100px] motion-safe:animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        <div
          className="mb-10 h-24 w-24 rounded-full border-4 border-slate-700/30 border-t-primary motion-safe:animate-spin"
          style={{ animationDuration: '1s' }}
          aria-hidden
        />
        <h1 className="mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-center text-3xl font-bold tracking-tight text-transparent">
          e-Pass Portal
        </h1>
        <p className="text-center text-sm text-slate-400">Memuatkan… / Loading…</p>
      </div>

      <p className="absolute bottom-12 text-center text-[10px] font-mono tracking-widest text-slate-600 uppercase">
        Establishing Secure Connection...
      </p>
    </div>
  );
}
