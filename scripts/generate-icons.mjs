// Generates PWA icons from the ninja sprite onto a branded sky-blue background.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const source = resolve(root, "src/assets/enemy/enemy-standing.png");
const outDir = resolve(root, "public");

const BG = { r: 0x87, g: 0xce, b: 0xeb, alpha: 1 }; // sky blue (0x87ceeb)

async function makeIcon(size, { padRatio, background, out }) {
  const inner = Math.round(size * (1 - padRatio * 2));
  const sprite = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: sprite, gravity: "center" }])
    .png()
    .toFile(resolve(outDir, out));

  console.log(`generated ${out} (${size}x${size})`);
}

async function main() {
  // Standard icons: minimal padding so the ninja fills the tile.
  await makeIcon(192, { padRatio: 0.08, background: BG, out: "pwa-192x192.png" });
  await makeIcon(512, { padRatio: 0.08, background: BG, out: "pwa-512x512.png" });
  // Maskable icon: extra padding for the platform safe zone.
  await makeIcon(512, { padRatio: 0.18, background: BG, out: "pwa-maskable-512x512.png" });
  // Apple touch icon (iOS home screen).
  await makeIcon(180, { padRatio: 0.1, background: BG, out: "apple-touch-icon.png" });
  // Favicon.
  await makeIcon(32, { padRatio: 0.05, background: BG, out: "favicon-32x32.png" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
