// Verifies every Unsplash image referenced in the product catalog.
// Usage: node scripts/verify-images.mjs
// Downloads each image to <TMP>/techforge-imgs/ for visual inspection and
// prints a status table so dead or mismatched images can be fixed.

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "src", "lib", "data", "products.ts"), "utf8");
const outDir = process.env.TF_IMG_DIR ?? join(root, "scripts", "img-check");
mkdirSync(outDir, { recursive: true });

const ids = [...new Set([...src.matchAll(/photo-[\d]+-[a-f0-9]+/g)].map((m) => m[0]))];
console.log(`Found ${ids.length} unique image ids\n`);

const results = [];
for (const id of ids) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000) });
    const ct = res.headers.get("content-type") ?? "";
    const ok = res.ok && ct.startsWith("image/");
    if (ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(join(outDir, `${id}.jpg`), buf);
    }
    results.push({ id, status: res.status, ct, ok, size: res.headers.get("content-length") ?? "?" });
  } catch (err) {
    results.push({ id, status: "ERR", ct: err.message, ok: false, size: "?" });
  }
}

let bad = 0;
for (const r of results) {
  const mark = r.ok ? "OK " : "BAD";
  if (!r.ok) bad++;
  console.log(`${mark} ${r.id}  ${r.status}  ${r.ct}`);
}
console.log(`\n${results.length - bad}/${results.length} images verified. Images saved to ${outDir}`);
process.exit(bad > 0 ? 1 : 0);
