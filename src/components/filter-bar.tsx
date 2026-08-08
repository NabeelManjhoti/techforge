"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Search } from "lucide-react";

type FilterBarProps = {
  q: string;
  sort: string;
  max: string;
  category: string;
  total: number;
};

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price · low → high" },
  { value: "price-desc", label: "Price · high → low" },
];

const MAX_PRICES = [
  { value: "", label: "Any budget" },
  { value: "100", label: "Under $100" },
  { value: "250", label: "Under $250" },
  { value: "500", label: "Under $500" },
  { value: "1000", label: "Under $1000" },
];

export function FilterBar({ q, sort, max, category, total }: FilterBarProps) {
  const router = useRouter();
  const [input, setInput] = useState(q);
  const debounceRef = useRef<number | null>(null);

  const buildHref = (patch: Partial<{ q: string; sort: string; max: string; category: string }>) => {
    const sp = new URLSearchParams();
    const nextQ = patch.q !== undefined ? patch.q : input;
    const nextSort = patch.sort !== undefined ? patch.sort : sort;
    const nextMax = patch.max !== undefined ? patch.max : max;
    const nextCat = patch.category !== undefined ? patch.category : category;
    if (nextQ.trim()) sp.set("q", nextQ.trim());
    if (nextSort && nextSort !== "featured") sp.set("sort", nextSort);
    if (nextMax) sp.set("max", nextMax);
    if (nextCat) sp.set("category", nextCat);
    const s = sp.toString();
    return s ? `/shop?${s}` : "/shop";
  };

  const push = (href: string) => router.push(href);

  const onSearchChange = (value: string) => {
    setInput(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      push(buildHref({ q: value }));
    }, 350);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          push(buildHref({ q: input }));
        }}
        className="flex items-center gap-2 border border-line bg-surface px-3 focus-within:border-neon/60"
      >
        <Search className="h-4 w-4 text-muted" aria-hidden="true" />
        <input
          value={input}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search gear by name, tag or spec…"
          aria-label="Search products"
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
          {total} {total === 1 ? "unit" : "units"}
        </span>
        <select
          value={max}
          onChange={(e) => push(buildHref({ max: e.target.value }))}
          aria-label="Maximum price"
          className="cursor-pointer border border-line bg-surface px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-ink focus:border-neon/60 focus:outline-none"
        >
          {MAX_PRICES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => push(buildHref({ sort: e.target.value }))}
          aria-label="Sort products"
          className="cursor-pointer border border-line bg-surface px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-ink focus:border-neon/60 focus:outline-none"
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
