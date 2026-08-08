import "server-only";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

export const stripe = key ? new Stripe(key) : null;
export const isStripeConfigured = Boolean(key && process.env.STRIPE_WEBHOOK_SECRET);
