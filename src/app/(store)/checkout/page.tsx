"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { ProductImage } from "@/components/product-image";
import { formatUsd } from "@/lib/format";

type PaymentMethod = "stripe" | "cod";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [form, setForm] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const total = subtotal; // shipping is free

  const update = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setStatus("submitting");
    setErrorMsg("");

    const body = {
      customer: {
        name: form.name.trim(),
        email: form.email.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
      },
      items,
    };

    try {
      const res = await fetch(
        paymentMethod === "stripe" ? "/api/checkout" : "/api/checkout/cod",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place the order.");

      if (paymentMethod === "stripe") {
        if (typeof data.url === "string") {
          window.location.href = data.url;
          return;
        }
        throw new Error("Checkout returned no payment URL.");
      }

      // Cash on delivery — order is already placed.
      clear();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not place the order.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Cart buffer is empty
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          Nothing to check out
        </h1>
        <p className="mt-3 text-sm text-muted">
          Add some gear to the cart first, then come back to place your order.
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-neon px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_24px_rgba(34,225,255,0.45)]"
        >
          Browse gear
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full border border-line bg-surface px-3 py-2.5 font-mono text-sm text-ink placeholder:text-muted focus:border-neon/60 focus:outline-none";

  const methods: { value: PaymentMethod; label: string; hint: string }[] = [
    { value: "stripe", label: "Pay with card", hint: "Stripe Checkout · secure card payment" },
    { value: "cod", label: "Cash on delivery", hint: "Pay when your gear arrives" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-neon">
        <span aria-hidden="true">▸</span>
        Checkout
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Place your order
      </h1>

      <form onSubmit={submit} className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section>
            <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
              Contact & shipping
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  Full name
                </span>
                <input required value={form.name} onChange={update("name")} placeholder="Ada Lovelace" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  Email
                </span>
                <input required type="email" value={form.email} onChange={update("email")} placeholder="ada@example.com" className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  Street address
                </span>
                <input required value={form.street} onChange={update("street")} placeholder="1 Gear Street" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  City
                </span>
                <input required value={form.city} onChange={update("city")} placeholder="Pasadena" className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  State
                </span>
                <input required value={form.state} onChange={update("state")} placeholder="CA" className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-muted">
                  ZIP / postal
                </span>
                <input required value={form.zip} onChange={update("zip")} placeholder="91125" className={inputClass} />
              </label>
            </div>
          </section>

          <section>
            <h2 className="border-b border-line pb-2 font-mono text-xs uppercase tracking-[0.25em] text-neon">
              Payment method
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {methods.map((m) => {
                const selected = paymentMethod === m.value;
                const Icon = m.value === "stripe" ? CreditCard : Banknote;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    aria-pressed={selected}
                    className={`corners relative border p-4 text-left transition-colors ${
                      selected
                        ? "border-neon/70 bg-neon/5"
                        : "border-line bg-surface hover:border-muted"
                    }`}
                  >
                    <span className="corner-tr" aria-hidden="true" />
                    <span className="corner-bl" aria-hidden="true" />
                    <span className="corner-br" aria-hidden="true" />
                    <span className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${selected ? "text-neon" : "text-muted"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-mono text-sm font-bold uppercase tracking-widest ${
                          selected ? "text-neon" : "text-ink"
                        }`}
                      >
                        {m.label}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-xs text-muted">{m.hint}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {status === "error" && (
            <div className="border border-magenta/60 bg-magenta/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-magenta">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-neon py-4 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_28px_rgba(34,225,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
          >
            {status === "submitting" ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {paymentMethod === "stripe"
                  ? "Redirecting to Stripe…"
                  : "Placing order…"}
              </span>
            ) : paymentMethod === "stripe" ? (
              <>Pay with card · {formatUsd(total)}</>
            ) : (
              <>Place order · pay {formatUsd(total)} on delivery</>
            )}
          </button>
          <p className="text-xs text-muted">
            {paymentMethod === "stripe" ? (
              <>
                Stripe test mode — use card{" "}
                <span className="font-mono text-neon">4242 4242 4242 4242</span>,
                any future expiry, any CVC.
              </>
            ) : (
              <>
                Cash on delivery — have{" "}
                <span className="font-mono text-neon">{formatUsd(total)}</span>{" "}
                ready when your gear arrives.
              </>
            )}
          </p>
        </div>

        <aside className="h-fit border border-line bg-surface lg:sticky lg:top-24">
          <h2 className="border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-neon">
            Order summary
          </h2>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto px-5">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-line bg-elevated">
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{item.name}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {formatUsd(item.priceUsd)} × {item.qty}
                  </p>
                </div>
                <span className="font-mono text-sm text-neon">
                  {formatUsd(item.priceUsd * item.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-line px-5 py-4 font-mono text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatUsd(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-neon">FREE</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold text-ink">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
