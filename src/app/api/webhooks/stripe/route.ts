import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return Response.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return Response.json({ error: "Missing signature." }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature:", err);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          return Response.json({ received: true });
        }
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.status === "paid") {
          // Unknown order or already processed — keep the webhook idempotent.
          return Response.json({ received: true });
        }
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "paid",
            stripePaymentIntent:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : undefined,
          },
        });
        const items = order.items as { productId: string; qty: number }[];
        for (const item of items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: Math.max(1, Math.floor(item.qty)) } },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("stripe webhook handling:", err);
    return Response.json({ error: "Webhook handling failed." }, { status: 500 });
  }

  return Response.json({ received: true });
}
