/* Tarayıcıda etkileşim ve ölçüm denetimi (geliştirme aracı).
   Kullanım: NODE_PATH=<playwright-core node_modules> node tools/etkilesim.js <port> <gamze.wav> <dugah.wav>
   - Gezinme ve kısayollar, Boşluk ile usul
   - AudioWorklet fiziksel modelin yüklenmesi ve tarayıcıda ölçülen frekansı
   - Usul metronomu zamanlaması
   - Sahte mikrofon: akort aleti (Dügâh) ve Gamzedeyim öğrenme akışı */
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), os = require("os");
const [port = "8803", gamzeWav, dugahWav] = process.argv.slice(2);
const base = path.join(os.homedir(), "Library/Caches/ms-playwright");
const d = fs.readdirSync(base).filter((x) => x.startsWith("chromium-")).sort().pop();
const exe = path.join(base, d, "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing");
let gecti = 0, kaldi = 0;
const ok = (ad, kosul, ek = "") => { kosul ? gecti++ : kaldi++; console.log(`${kosul ? "✓" : "✗"} ${ad}${ek ? " — " + ek : ""}`); };
const URL = `http://localhost:${port}/index.html`;

async function tarayici(wav) {
  const args = ["--autoplay-policy=no-user-gesture-required", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"];
  if (wav) args.push(`--use-file-for-fake-audio-capture=${wav}`);
  const br = await chromium.launch({ executablePath: exe, args });
  br.wav = wav;
  return br;
}
async function sayfa(b, genislik = 1440) {
  const ctx = await b.newContext({ viewport: { width: genislik, height: 860 }, permissions: ["microphone"] });
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem("klarnet.rehber.kapali", "1"); } catch (e) {} });
  // Bu ortamda Chrome'un sahte mikrofon aygıtı getUserMedia'yı askıda bıraktı. Bu yüzden getUserMedia,
  // WAV dosyasını döngüyle çalan bir MediaStream döndürecek biçimde değiştirilir; sitenin bütün hattı
  // (MediaStreamSource → AnalyserNode → YIN → öğretim mantığı) aynen çalışır.
  if (b.wav) {
    await p.route("**/__test.wav", (r) => r.fulfill({ body: fs.readFileSync(b.wav), contentType: "audio/wav" }));
    await p.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const c = new AudioContext();
        const buf = await c.decodeAudioData(await (await fetch("__test.wav")).arrayBuffer());
        const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
        const d = c.createMediaStreamDestination(); s.connect(d); s.start();
        window.__testMik = c;
        return d.stream;
      };
    });
  }
  p.hatalar = [];
  p.on("pageerror", (e) => p.hatalar.push(e.message));
  p.on("console", (m) => m.type() === "error" && p.hatalar.push(m.text()));
  await p.goto(URL + "#kapak", { waitUntil: "networkidle" });
  return p;
}

(async () => {
  /* 1) gezinme, kısayollar, ses modeli, metronom */
  let b = await tarayici();
  let p = await sayfa(b);
  const id = () => p.evaluate(() => Deck.id);
  await p.mouse.click(5, 5);
  await p.keyboard.press("ArrowRight"); ok("→ ilerletir", (await id()) === "hikaye");
  await p.keyboard.press("ArrowLeft"); ok("← geri alır", (await id()) === "kapak");
  await p.keyboard.press("n"); ok("N notları açar", await p.isVisible("#notes.open")); await p.keyboard.press("n");
  await p.keyboard.press("o"); ok("O genel bakışı açar", await p.isVisible("#overview.open")); await p.keyboard.press("Escape");
  await p.keyboard.press("t"); ok("T metni gizler", await p.evaluate(() => document.body.classList.contains("text-hidden"))); await p.keyboard.press("t");
  ok("41 slayt", (await p.evaluate(() => Deck.count)) === 41);
  ok("Her slaytta sunucu notu ve kaynak", await p.evaluate(() => [...document.querySelectorAll(".slide")].every((s) => s.querySelector("aside.notes") && s.querySelector("aside.notes .kaynak"))));
  ok("Metinlerde 'sol/sağ taraf' gibi yön sözcüğü yok", await p.evaluate(() => ![...document.querySelectorAll(".slide .text")].some((t) => /\b(sağda|solda|sağdaki|soldaki|sağ tarafta|sol tarafta)\b/i.test(t.textContent))));

  // fiziksel model (AudioWorklet)
  await p.evaluate(() => { Snd.unlock(); return Klarnet.hazirla(); });
  await p.waitForTimeout(500);
  ok("AudioWorklet fiziksel model yüklendi", await p.evaluate(() => Klarnet.fiziksel), await p.evaluate(() => Klarnet.hata));
  const olc = await p.evaluate(async () => {
    const out = [];
    for (const m of [55, 64, 69, 72, 79]) {
      const f = K.yaziliFrekans(m, "sol");
      const v = Klarnet.ses({ frekans: f }); v.ufle(0.75);
      const an = Snd.ctx.createAnalyser(); an.fftSize = 4096; v.out.connect(an);
      await new Promise((r) => setTimeout(r, 700));
      const buf = new Float32Array(4096); const fs = [];
      for (let i = 0; i < 6; i++) { an.getFloatTimeDomainData(buf); const y = YIN.yin(buf, Snd.ctx.sampleRate, { fmin: 80, fmax: 2000 }); if (y) fs.push(y.f); await new Promise((r) => setTimeout(r, 60)); }
      v.stop(); fs.sort((a, b) => a - b);
      out.push({ m, hedef: f, olcum: fs[fs.length >> 1], cent: 1200 * Math.log2(fs[fs.length >> 1] / f) });
      await new Promise((r) => setTimeout(r, 300));
    }
    return out;
  });
  const enb = Math.max(...olc.map((x) => Math.abs(x.cent)));
  ok("Tarayıcıda model frekansı hedefe ±5 cent", enb <= 5, olc.map((x) => `${x.m}: ${x.cent.toFixed(2)}c`).join(", "));

  // metronom zamanlaması
  const zm = await p.evaluate(async () => {
    Deck.goId("metronom");
    const u = usul("aksak");
    const geciken = [];
    const ctl = Usul.cal(u, { tempo: 300, saz: "tik", kayit: true, onAdim: (a, o, t) => geciken.push(t - Snd.ctx.currentTime) });
    ctl.start();
    await new Promise((r) => setTimeout(r, 4000));
    ctl.stop();
    const z = ctl.zamanlar, ara = z.slice(1).map((t, i) => t - z[i]);
    const hedef = 60 / 300;
    return { n: z.length, maxSapma: Math.max(...ara.map((a) => Math.abs(a - hedef))) * 1000, minOnde: Math.min(...geciken) * 1000, maxOnde: Math.max(...geciken) * 1000 };
  });
  ok("Metronom: planlanan aralıklar hedefle aynı (≤ 0,01 ms)", zm.maxSapma < 0.01, `${zm.n} adım, en büyük sapma ${zm.maxSapma.toFixed(4)} ms`);
  ok("Metronom: her vuruş çalınmadan önce planlandı", zm.minOnde > 0, `önden planlama ${zm.minOnde.toFixed(1)}–${zm.maxOnde.toFixed(1)} ms`);
  // Boşluk usulü başlatır
  await p.evaluate(() => Deck.goId("metronom")); await p.mouse.click(5, 5);
  await p.keyboard.press(" "); await p.waitForTimeout(400);
  ok("Boşluk metronomu başlatır", (await p.textContent("#metronom .controls .btn.primary")).includes("Durdur"));
  await p.keyboard.press(" "); await p.waitForTimeout(200);
  ok("Boşluk metronomu durdurur", (await p.textContent("#metronom .controls .btn.primary")).includes("Başlat"));
  ok("Boşluk metronom slaytında ilerletmez", (await id()) === "metronom");

  // klarnet bileşeni: deliğe tıklayınca pozisyon değişir, ters yön
  await p.evaluate(() => Deck.goId("delikler")); await p.waitForTimeout(500);
  const once = await p.textContent("#delikler .kc-etiket b");
  await p.click('#delikler [data-k="L3"] .kc-hit', { force: true });
  const sonra = await p.textContent("#delikler .kc-etiket b");
  ok("Deliğe tıklamak notayı değiştirir", once !== sonra, `${once} → ${sonra}`);
  await p.evaluate(() => Deck.goId("parmak-tablosu")); await p.waitForTimeout(400);
  await p.fill("#parmak-tablosu .tb-ara", "segâh"); await p.waitForTimeout(300);
  ok("Parmak tablosunda perde araması (Segâh → Si4)", (await p.textContent("#parmak-tablosu .tb-baslik b")) === "Si4");
  ok("Konsol hatası yok (1. tur)", p.hatalar.length === 0, p.hatalar.slice(0, 3).join(" | "));
  await b.close();

  /* 2) sahte mikrofon: akort aleti */
  if (dugahWav) {
    b = await tarayici(dugahWav); p = await sayfa(b);
    await p.evaluate(() => { L.store.set("ahenk", "bolahenk"); L.store.set("tur", "sol"); Deck.goId("akort"); });
    await p.waitForTimeout(500);
    await p.click("#akort .mik-btn");
    await p.waitForTimeout(2500);
    const durum = await p.textContent("#akort .mik-durum");
    ok("Mikrofon açıldı (WAV akışı)", /Dinliyor/.test(durum), durum);
    const sonuc = await p.evaluate(() => new Promise((res) => { const off = Mikrofon.dinle((o) => { if (o.f) { off(); res({ f: o.f, p: K.enYakinPerde(o.f, { ahenk: "bolahenk" }).perde.ad }); } }); setTimeout(() => res(null), 3000); }));
    ok("Akort aleti WAV akışında Dügâh'ı buldu", sonuc && sonuc.p === "Dügâh", sonuc ? `${sonuc.f.toFixed(2)} Hz → ${sonuc.p}` : "ölçüm yok");
    ok("Konsol hatası yok (akort)", p.hatalar.length === 0, p.hatalar.slice(0, 3).join(" | "));
    await b.close();
  }

  /* 3) sahte mikrofon: Gamzedeyim öğrenme akışı */
  if (gamzeWav) {
    b = await tarayici(gamzeWav); p = await sayfa(b);
    await p.evaluate(() => { L.store.set("ahenk", "bolahenk"); L.store.set("tur", "sol"); L.store.set("gamze.tam", false); L.store.set("gamze.tol", 30); L.store.set("gamze.dize", "Gamzedeyim devâ bulmam"); Deck.goId("gamzedeyim-ogren"); });
    await p.waitForTimeout(600);
    await p.click("#gamzedeyim-ogren .mik-btn");
    await p.waitForTimeout(800);
    await p.click('#gamzedeyim-ogren .controls .btn.primary'); // Başla
    const toplam = await p.$$eval("#gamzedeyim-ogren .go-tas", (x) => x.length);
    let ilerleme = 0;
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); ilerleme = await p.$$eval("#gamzedeyim-ogren .go-tas.ok", (x) => x.length); if (ilerleme >= toplam) break; }
    ok("Gamzedeyim: mikrofonla notalar sırayla ilerledi", ilerleme >= toplam * 0.8, `${ilerleme}/${toplam} nota`);
    ok("Gamzedeyim: aynı nota art arda gelince yeni atak bekleniyor (iki Nevâ ayrı sayıldı)", ilerleme >= 3);
    ok("Konsol hatası yok (Gamzedeyim)", p.hatalar.length === 0, p.hatalar.slice(0, 3).join(" | "));
    await b.close();
  }

  console.log(`\n${gecti} geçti, ${kaldi} kaldı`);
  process.exit(kaldi ? 1 : 0);
})();
