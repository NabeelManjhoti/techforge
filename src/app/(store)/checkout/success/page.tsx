import Link from "next/link";
import { Banknote, CheckCircle2, Loader2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/format";
import { ClearCartOnMount } from "./clear-cart";

type OrderRow = {
  id: string;
  status: string;
  paymentMethod: string;
  totalUsd: { toNumber: () => number };
};

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : "";
  const orderId = typeof params.order === "string" ? params.order : "";

  let order: OrderRow | null = null;
  if (sessionId) {
    const row = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });
    order = row ? (row as unknown as OrderRow) : null;
  } else if (orderId) {
    const row = await prisma.order.findUnique({ where: { id: orderId } });
    order = row ? (row as unknown as OrderRow) : null;
  }

  const isCod = order?.paymentMethod === "cod";
  const confirmed = order && (isCod || order.status === "paid");

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <ClearCartOnMount />

      {confirmed ? (
        <span className="grid h-16 w-16 place-items-center rounded-full border border-neon/50 bg-neon/10 text-neon">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
      ) : (
        <span className="grid h-16 w-16 place-items-center rounded-full border border-line bg-surface text-neon">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        </span>
      )}

      <p
        className={`mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] ${
          confirmed ? "text-neon" : "text-muted"
        }`}
      >
        <span
          className={`h-2 w-2 ${confirmed ? "animate-blink bg-neon" : "bg-muted"}`}
          aria-hidden="true"
        />
        {confirmed
          ? isCod
            ? "Order placed · pay on delivery"
            : "Payment confirmed"
          : "Confirming your order"}
      </p>

      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {confirmed ? "Gear is on the way" : "Processing your order"}
      </h1>

      {order ? (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Order{" "}
          <span className="font-mono text-neon">{order.id.slice(0, 13)}</span> ·{" "}
          <span className="font-mono text-ink">{formatUsd(order.totalUsd.toNumber())}</span>
          {isCod ? (
            <>
              {" "}
              is confirmed for <span className="font-mono text-neon">cash on delivery</span>.
            </>
          ) : order.status === "paid" ? (
            " has been paid."
          ) : (
            " is being finalized by Stripe — this usually takes a few seconds."
          )}
        </p>
      ) : (
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Your payment was processed. If you don&apos;t see a confirmation soon,
          check the Stripe dashboard or the admin orders feed.
        </p>
      )}

      {isCod && (
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted">
          <Banknote className="h-4 w-4" aria-hidden="true" />
          Keep cash ready for the delivery agent.
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="bg-neon px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-shadow hover:shadow-[0_0_24px_rgba(34,225,255,0.45)]"
        >
          Keep browsing
        </Link>
        <Link
          href="/"
          className="border border-line px-6 py-3 font-mono text-sm uppercase tracking-widest text-ink transition-colors hover:border-neon/60 hover:text-neon"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
