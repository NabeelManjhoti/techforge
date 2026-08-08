import type { Metadata } from "next";
import { Syne, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// Catalog, auth and orders live in NeonDB, so every route renders on demand.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "TECHFORGE — Premium Tech Gadgets",
    template: "%s · TECHFORGE",
  },
  description:
    "Premium tech gadgets with an obsessive spec-first catalog. Headphones, keyboards, drones, wearables and more — engineered, not merchandised.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${sora.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
