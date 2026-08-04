/**
 * Generates raster image assets from the SVG brand sources.
 *
 * Produces:
 *   - public/social-preview.png  (1200×630 — Open Graph / social sharing)
 *   - public/apple-touch-icon.png (180×180 — iOS / touch icons)
 *
 * Requires the `sharp` package (v0.35+). It is NOT part of the committed
 * dependency tree because it is only needed to regenerate committed assets:
 *
 *   npm install --no-save sharp
 *   node scripts/generate-images.mjs
 *
 * The output PNGs are checked in, so this script is optional for normal
 * development and CI. SVG source files: public/social-preview.svg and
 * public/favicon.svg.
 */
import { fileURLToPath } from "node:url";
import path from "node:path";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "sharp is not installed. Install it temporarily with:\n" +
      "  npm install --no-save sharp\n" +
      "then run: node scripts/generate-images.mjs",
  );
  process.exit(1);
}

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const tasks = [
  {
    src: path.join(root, "public", "social-preview.svg"),
    dest: path.join(root, "public", "social-preview.png"),
    width: 1200,
    height: 630,
  },
  {
    src: path.join(root, "public", "favicon.svg"),
    dest: path.join(root, "public", "apple-touch-icon.png"),
    width: 180,
    height: 180,
    // iOS requires a full-bleed opaque icon — flatten onto the Warm Paper
    // brand background so the navy logo strokes remain visible.
    flattenBackground: "#F7F1E8",
  },
];

for (const { src, dest, width, height, flattenBackground } of tasks) {
  let pipeline = sharp(src).resize(width, height);
  if (flattenBackground) {
    pipeline = pipeline.flatten({ background: flattenBackground });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(
    `generated ${path.basename(dest)} (${meta.width}×${meta.height}, ${meta.format})`,
  );
}

console.log("done");
