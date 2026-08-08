import { HudFrame } from "@/components/hud-frame";

export const inputClass =
  "w-full border border-line bg-surface px-3 py-2.5 font-mono text-sm text-ink placeholder:text-muted focus:border-neon/60 focus:outline-none";

export const labelClass =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted";

export const btnPrimary =
  "bg-neon px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_24px_rgba(34,225,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

export const btnGhost =
  "border border-line px-5 py-2.5 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon";

export const btnDanger =
  "border border-magenta/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-magenta transition-colors hover:bg-magenta/10";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block font-mono text-[10px] text-muted">{hint}</span>
      )}
    </label>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HudFrame className={`border border-line bg-surface ${className ?? ""}`}>
      {title && (
        <h2 className="border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-neon">
          {title}
        </h2>
      )}
      <div className="p-5">{children}</div>
    </HudFrame>
  );
}
