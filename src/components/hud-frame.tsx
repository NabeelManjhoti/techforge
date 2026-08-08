import { cn } from "@/lib/cn";

export function HudFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("corners relative", className)}>
      <span className="corner-tr" aria-hidden="true" />
      <span className="corner-bl" aria-hidden="true" />
      <span className="corner-br" aria-hidden="true" />
      {children}
    </div>
  );
}
