import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-neon">
        ▸ Error 404
      </p>
      <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
        Signal lost
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        The page you requested isn&apos;t on this channel. It may have been moved,
        renamed, or was never broadcast.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="bg-neon px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_24px_rgba(34,225,255,0.45)]"
        >
          Back to base
        </Link>
        <Link
          href="/shop"
          className="border border-line px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon"
        >
          Browse the catalog
        </Link>
      </div>
    </div>
  );
}
