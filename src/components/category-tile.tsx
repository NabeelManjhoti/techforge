import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { HudFrame } from "@/components/hud-frame";
import type { Category } from "@/lib/types";

export function CategoryTile({ category }: { category: Category }) {
  return (
    <HudFrame className="group h-full border border-line bg-surface transition-colors duration-300 hover:border-neon/60">
      <Link
        href={`/shop?category=${category.slug}`}
        className="flex h-full flex-col gap-3 p-5"
      >
        <span className="grid h-10 w-10 place-items-center border border-line text-muted transition-colors group-hover:border-neon/60 group-hover:text-neon">
          <CategoryIcon name={category.icon} className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold text-ink transition-colors group-hover:text-neon">
            {category.name}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{category.tagline}</p>
        </div>
        <span className="mt-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-neon opacity-0 transition-opacity group-hover:opacity-100">
          Browse <span aria-hidden="true">→</span>
        </span>
      </Link>
    </HudFrame>
  );
}
