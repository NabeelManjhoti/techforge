import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "src", "app", "icon.svg");
const outDir = path.join(root, "src", "app");

async function main() {
  const svg = await fs.readFile(svgPath);

  // icon.png (256) — generic favicon fallback
  await sharp(svg, { density: 128 }).resize(256, 256).png().toFile(path.join(outDir, "icon.png"));

  // apple-icon.png (180) — iOS home screen
  await sharp(svg, { density: 128 }).resize(180, 180).png().toFile(path.join(outDir, "apple-icon.png"));

  // favicon.ico (16/32/48) — legacy browser fallback
  const sizes = [16, 32, 48];
  const buffers = [];
  for (const size of sizes) {
    const { data } = await sharp(svg, { density: 64 })
      .resize(size, size)
      .png()
      .toBuffer({ resolveWithObject: true });
    buffers.push(data);
  }
  const ico = await pngToIco(buffers);
  await fs.writeFile(path.join(outDir, "favicon.ico"), ico);

  console.log("Generated icon.png (256), apple-icon.png (180), favicon.ico (16/32/48)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
