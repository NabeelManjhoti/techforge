import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

type CheckoutItem = {
  productId: string;
  name: string;
  priceUsd: number;
  image: string;
  qty: number;
};

type CheckoutBody = {
  customer: {
    name: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CheckoutItem[];
};

function randomLetters(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return Response.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CheckoutBody;

    if (!body.items || body.items.length === 0) {
      return Response.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!body.customer?.name?.trim() || !body.customer?.email?.trim()) {
      return Response.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }
    if (!body.customer.email.includes("@")) {
      return Response.json({ error: "Email looks invalid." }, { status: 400 });
    }

    // Re-validate the cart against the database — never trust client prices.
    const ids = [...new Set(body.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalUsd = 0;

    for (const item of body.items) {
      const product = byId.get(item.productId);
      if (!product) {
        return Response.json(
          { error: `"${item.name}" is no longer available.` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(item.qty));
      if (qty > product.stock) {
        return Response.json(
          { error: `Only ${product.stock} units of "${product.name}" are in stock.` },
          { status: 400 }
        );
      }
      const price = product.priceUsd.toNumber();
      totalUsd += price * qty;
      lineItems.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(price * 100),
          product_data: {
            name: product.name,
            ...(product.images[0] ? { images: [product.images[0]] } : {}),
          },
        },
      });
    }

    const customerJson = {
      name: body.customer.name.trim(),
      email: body.customer.email.trim(),
      street: body.customer.street.trim(),
      city: body.customer.city.trim(),
      state: body.customer.state.trim(),
      zip: body.customer.zip.trim(),
    };

    // Create the order row up-front so the webhook can mark it paid and the
    // success page can look it up by session id immediately.
    const order = await prisma.order.create({
      data: {
        customer: customerJson,
        items: body.items,
        totalUsd,
        status: "pending",
        paymentMethod: "stripe",
      },
    });

    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      integration_identifier: `techforge-checkout-${randomLetters(8)}`,
      customer_email: customerJson.email,
      line_items: lineItems,
      metadata: { orderId: order.id },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
    });

    // Persist the session id so the webhook + success page can find the order.
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("checkout:", err);
    return Response.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
