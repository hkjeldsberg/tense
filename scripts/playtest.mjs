// Headless play-through against a running dev server: for each room, click every
// memory, answer wrong then right, and check that the room completes.
// Screenshots go to .playtest/. Needs a Chromium build (Playwright's cache is used
// if present, or set CHROMIUM_PATH).
//
//   npm run dev                      # in another terminal
//   npm run playtest                 # all rooms
//   ROOMS=aula,fiesta npm run playtest
//   URL=http://localhost:3002 USE_SUPABASE=1 npm run playtest
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";
import { OrthographicCamera, Vector3 } from "three";

const URL = process.env.URL ?? "http://localhost:3000";
const OUT = ".playtest/";
const W = 1280;
const H = 800;
mkdirSync(OUT, { recursive: true });

const { rooms } = JSON.parse(readFileSync("content/rooms.json", "utf8"));
const want = (process.env.ROOMS ?? rooms.map((r) => r.id).join(",")).split(",");

function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const cache = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(cache)) return undefined;
  const dir = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
  const app = dir && join(cache, dir, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
  return app && existsSync(app) ? app : undefined;
}

// Same camera as src/game/Scene.tsx CameraRig, to turn world positions into clicks.
const cam = new OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 40);
cam.position.set(10, 8.5, 10);
cam.lookAt(0, 1.1, 0);
cam.zoom = Math.min(W / 13.5, H / 11.5);
cam.updateProjectionMatrix();
cam.updateMatrixWorld();
const toScreen = ([x, y, z]) => {
  const v = new Vector3(x, y, z).project(cam);
  return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H];
};

const browser = await chromium.launch({
  executablePath: chromiumPath(),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const errors = [];

for (const id of want) {
  const idx = rooms.findIndex((r) => r.id === id);
  if (idx < 0) {
    errors.push(`unknown room ${id}`);
    continue;
  }
  const room = rooms[idx];
  const tag = `${String(room.order_index).padStart(2, "0")}-${id}`;
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on("pageerror", (e) => errors.push(`${id}: ${e}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/ERR_FAILED/.test(m.text())) errors.push(`${id}: ${m.text()}`);
  });
  // Test the bundled content unless asked to go through Supabase.
  if (!process.env.USE_SUPABASE) await page.route(/supabase\.co/, (r) => r.abort());
  // Unlock the room by marking all earlier rooms complete.
  await page.addInitScript(
    ([done, last]) =>
      localStorage.setItem("tense.progress.v1", JSON.stringify({ solved: [], completedRooms: done, mistakes: {}, lastRoom: last })),
    [rooms.slice(0, idx).map((r) => r.id), id],
  );
  await page.goto(URL);
  await page.getByRole("button", { name: /Enter the memory|Keep remembering/ }).click({ timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}${tag}-a-start.png` });

  for (const pz of room.puzzles) {
    // Dev-only hook from src/game/slot.tsx.
    const pos = await page.evaluate((o) => window.__tenseSlots?.[o]?.(), pz.scene_object);
    if (!pos) {
      errors.push(`${id}: no 3D object for scene_object "${pz.scene_object}"`);
      continue;
    }
    const [x, y] = toScreen(pos);
    await page.mouse.click(x, y);
    await page.waitForTimeout(300);
    const dialog = page.getByRole("dialog");
    if (!(await dialog.isVisible())) {
      errors.push(`${id}: clicking ${pz.scene_object} at ${x.toFixed(0)},${y.toFixed(0)} opened no prompt`);
      continue;
    }
    if (!(await dialog.textContent()).includes(pz.verb_base)) errors.push(`${id}: ${pz.scene_object} opened the wrong puzzle`);
    const option = (form) => dialog.locator("button").filter({ has: page.locator("span.text-xl", { hasText: new RegExp(`^${form}$`) }) });
    await option(pz.options.find((o) => !o.correct).form).click();
    if (!(await dialog.getByRole("alert").isVisible())) errors.push(`${id}: no rule feedback after a wrong answer on ${pz.scene_object}`);
    await option(pz.options.find((o) => o.correct).form).click();
    await dialog.getByRole("button", { name: /Watch it happen/ }).click();
    await page.waitForTimeout(1700);
  }

  await page.waitForTimeout(1500);
  if (await page.getByText("¡Memoria reconstruida!").isVisible()) {
    await page.getByRole("button", { name: /Stay here|Enjoy the room/ }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}${tag}-b-done.png` });
  } else {
    errors.push(`${id}: room-complete dialog not shown`);
    await page.screenshot({ path: `${OUT}${tag}-b-incomplete.png` });
  }
  await page.close();
  console.log(`${tag}: done`);
}

await browser.close();
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`\nAll ${want.length} room(s) played through. Screenshots in ${OUT}`);
