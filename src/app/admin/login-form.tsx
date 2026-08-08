"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { login, type ActionState } from "@/app/admin/actions";
import { HudFrame } from "@/components/hud-frame";
import { btnPrimary, inputClass, labelClass } from "@/components/admin/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    login,
    undefined
  );

  return (
    <HudFrame className="w-full max-w-md border border-line bg-surface">
      <div className="flex items-center gap-3 border-b border-line px-6 py-4">
        <span className="grid h-10 w-10 place-items-center border border-neon/50 bg-neon/10 text-neon">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-lg font-extrabold tracking-tight">
            Admin access
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Restricted channel · NeonDB session
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-5 p-6">
        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@techforge.dev"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </label>

        {state?.error && (
          <p
            role="alert"
            className="border border-magenta/60 bg-magenta/10 px-3 py-2 font-mono text-xs uppercase tracking-wider text-magenta"
          >
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Authenticating…
            </span>
          ) : (
            "Authenticate"
          )}
        </button>
      </form>
    </HudFrame>
  );
}
