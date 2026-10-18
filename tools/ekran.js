/* Ekran görüntüsü ve konsol hatası denetimi (geliştirme aracı).
   Kullanım: NODE_PATH=<playwright-core'un bulunduğu node_modules> node tools/ekran.js <port> <çıktı klasörü> [genişlikxyükseklik,...] [slayt-id,...]
   Slayt listesi verilmezse bütün slaytlar çekilir. */
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), os = require("os");
const [port = "8803", out = "shots", sizesArg = "1440x860", only = ""] = process.argv.slice(2);
const exe = (() => {
  const base = path.join(os.homedir(), "Library/Caches/ms-playwright");
  const d = fs.readdirSync(base).filter((x) => x.startsWith("chromium-")).sort().pop();
  return path.join(base, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
})();
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe });
  let toplamHata = 0;
  for (const s of sizesArg.split(",")) {
    const [w, hh] = s.split("x").map(Number);
    const page = await browser.newPage({ viewport: { width: w, height: hh }, deviceScaleFactor: 1 });
    await page.addInitScript(() => { try { localStorage.setItem("klarnet.rehber.kapali", "1"); } catch (e) {} });
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(`[${m.type()}] ${m.text()}`); });
    page.on("pageerror", (e) => errs.push("[pageerror] " + e.message));
    await page.goto(port.startsWith("http") ? port : `http://localhost:${port}/index.html`, { waitUntil: "networkidle" });
    await page.evaluate(() => { try { localStorage.setItem("klarnet.rehber.kapali", "1"); } catch (e) {} });
    if (errs.length) console.log(`${w} yükleme:`, errs.join(" | "));
    const ids = only ? only.split(",") : await page.evaluate(() => [...document.querySelectorAll(".slide")].map((x) => x.id));
    for (const id of ids) {
      const before = errs.length;
      await page.evaluate((id) => Deck.goId(id), id);
      await page.waitForTimeout(900);
      const full = w <= 860;
      await page.screenshot({ path: path.join(out, `${w}-${id}.png`), fullPage: full });
      if (errs.length > before) console.log(`${w} ${id}:`, errs.slice(before).join(" | "));
    }
    toplamHata += errs.length;
    await page.close();
  }
  await browser.close();
  console.log(toplamHata ? `Toplam ${toplamHata} konsol hatası/uyarısı` : "Konsol temiz");
})();
