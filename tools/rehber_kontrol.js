/* Hayalet el senaryolarındaki her hedefin sayfada gerçekten bulunduğunu denetler.
   Kullanım: NODE_PATH=<playwright-core node_modules> node tools/rehber_kontrol.js <port> [genişlik] */
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), os = require("os");
const [port = "8803", width = "1440"] = process.argv.slice(2);
const base = path.join(os.homedir(), "Library/Caches/ms-playwright");
const d = fs.readdirSync(base).filter((x) => x.startsWith("chromium-")).sort().pop();
const exe = path.join(base, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  const page = await browser.newPage({ viewport: { width: +width, height: 860 } });
  await page.addInitScript(() => { window.__REHBER_TEST = 1; });
  await page.addInitScript(() => { try { localStorage.setItem("klarnet.rehber.kapali", "1"); } catch (e) {} });
  await page.goto(`http://localhost:${port}/index.html`, { waitUntil: "networkidle" });
  const ids = await page.evaluate(() => Object.keys(window.__rehber.S));
  let eksik = 0;
  for (const id of ids) {
    const r = await page.evaluate(async (id) => {
      if (!document.getElementById(id)) return ["slayt yok"];
      Deck.goId(id);
      await new Promise((res) => setTimeout(res, 500));
      const s = document.getElementById(id), out = [];
      // adımlar sırayla uygulanır: düğme metni değişen (Başlat → Durdur) hedefler de denetlenir
      for (const st of window.__rehber.S[id]) {
        const q = st.click || st.slide || st.tap || st.draw || st.move || st.drag;
        if (!q) continue;
        const el = window.__rehber.find(s, q);
        if (!el) { out.push(q); continue; }
        if (st.click) { if (el instanceof SVGElement) { el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); el.dispatchEvent(new PointerEvent("pointerup", { bubbles: true })); } else el.click(); }
        if (st.slide) { el.value = st.to; el.dispatchEvent(new Event("input", { bubbles: true })); }
        await new Promise((res) => setTimeout(res, 120));
      }
      return out;
    }, id);
    if (r.length) { eksik += r.length; console.log(`${id}: bulunamadı → ${r.join(", ")}`); }
  }
  const yok = await page.evaluate(() => [...document.querySelectorAll(".slide")].filter((s) => s.querySelector(".try") && !window.__rehber.S[s.id]).map((s) => s.id));
  if (yok.length) console.log("Senaryosu olmayan 'Dene' kutuları:", yok.join(", "));
  console.log(`${ids.length} senaryo denetlendi, ${eksik} eksik hedef`);
  await browser.close();
  process.exit(eksik ? 1 : 0);
})();
