// Fetches top Unsplash search results for each product subject and writes a
// JSON manifest of { query -> [{ id, alt }] } using ONLY non-premium images
// (images.unsplash.com/photo-*, excluding plus.unsplash.com and profile-*).
// Usage: node scripts/fetch-subjects.mjs

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const QUERIES = [
  "black headphones",
  "headphones dark",
  "wireless earbuds",
  "bluetooth speaker",
  "gaming headset",
  "mechanical keyboard",
  "gaming keyboard rgb",
  "gaming mouse",
  "computer mouse",
  "ultrawide monitor",
  "computer monitor desk",
  "laptop desk workspace dark",
  "smartwatch",
  "smart ring",
  "sports watch gps",
  "drone flying",
  "mirrorless camera",
  "camera black",
  "camera lens",
  "power bank",
  "microphone studio",
  "usb c hub",
  "webcam",
  "smartphone black",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Alt text containing these suggests a darker image that suits the neon theme.
const DARK = /black|dark|night|gray|grey|graphite|space|studio/i;

async function fetchQuery(query) {
  const url = `https://r.jina.ai/https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { accept: "text/plain", "user-agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(60000),
  });
  return res.text();
}

function extract(text) {
  const out = [];
  const re = /!\[Image \d+: ([^\]]+)\]\(https:\/\/images\.unsplash\.com\/photo-([a-z0-9-]+)\?/g;
  let m;
  while ((m = re.exec(text))) {
    const alt = m[1].trim();
    out.push({ id: m[2], alt });
  }
  return out;
}

const manifest = {};
for (const q of QUERIES) {
  try {
    const text = await fetchQuery(q);
    const seen = new Map();
    for (const it of extract(text)) {
      if (!seen.has(it.id)) seen.set(it.id, it);
    }
    const items = [...seen.values()];
    manifest[q] = items;
    const dark = items.filter((i) => DARK.test(i.alt)).length;
    console.log(`${q.padEnd(28)} -> ${items.length} images (${dark} dark-ish)`);
    for (const it of items.slice(0, 10)) {
      console.log(`    ${it.id}  ${it.alt.slice(0, 72)}`);
    }
  } catch (err) {
    console.log(`${q.padEnd(28)} -> ERROR ${err.message}`);
  }
  await sleep(1200);
}

const file = join(root, "scripts", "img-check", "subject-manifest.json");
writeFileSync(file, JSON.stringify(manifest, null, 2));
console.log(`\nManifest written to ${file}`);
