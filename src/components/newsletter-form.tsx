"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  return (
    <form
      className="mt-6 flex max-w-xs items-stretch gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setStatus("done");
      }}
    >
      <input
        type="email"
        required
        placeholder="you@domain.com"
        aria-label="Email address"
        className="w-full border border-line bg-bg px-3 py-2 font-mono text-xs text-ink placeholder:text-muted focus:border-neon/60 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 bg-neon px-4 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_20px_rgba(34,225,255,0.4)]"
      >
        {status === "done" ? "Joined ✓" : "Join"}
      </button>
    </form>
  );
}
