// Renders the icon SVGs to the raster files browsers need.
//   src/app/icon.svg        → src/app/favicon.ico (16/32/48 px PNGs in an ICO container)
//   assets/apple-icon.svg   → src/app/apple-icon.png (180×180, opaque, for iOS home screens)
// Usage: npm run icons   (needs a Chromium build; see scripts/playtest.mjs)
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const cache = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return undefined;
  const dir = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
  const app = dir && join(cache, dir, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
  return app && existsSync(app) ? app : undefined;
}

const browser = await chromium.launch({ executablePath: chromiumPath() });
const page = await browser.newPage();

async function render(svgPath, size, transparent) {
  const svg = readFileSync(svgPath, "utf8");
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}img{display:block;width:${size}px;height:${size}px}</style>` +
      `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}">`,
  );
  await page.locator("img").evaluate((img) => img.decode());
  return page.screenshot({ omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
}

/** ICO container holding PNG images (supported by every current browser). */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const sizes = [16, 32, 48];
const pngs = [];
for (const size of sizes) pngs.push({ size, data: await render("src/app/icon.svg", size, true) });
writeFileSync("src/app/favicon.ico", ico(pngs));
writeFileSync("src/app/apple-icon.png", await render("assets/apple-icon.svg", 180, false));

// Preview sheet for eyeballing small sizes: .playtest/icons.png
await page.setViewportSize({ width: 460, height: 200 });
await page.setContent(
  `<body style="margin:0;display:flex;gap:24px;align-items:center;padding:10px;background:#f3ead8">` +
    [16, 32, 48, 64].map((s) => `<img width="${s}" height="${s}" src="data:image/svg+xml;base64,${readFileSync("src/app/icon.svg").toString("base64")}">`).join("") +
    `<img width="180" height="180" style="border-radius:40px" src="data:image/png;base64,${readFileSync("src/app/apple-icon.png").toString("base64")}"></body>`,
);
await page.waitForTimeout(200);
await page.screenshot({ path: ".playtest/icons.png" });

await browser.close();
console.log("Wrote src/app/favicon.ico (16/32/48) and src/app/apple-icon.png (180×180)");
