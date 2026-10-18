/* Klarnet hesaplarının doğruluk testleri. Kullanım: node test/klarnet.test.js */
const fs = require("fs"), path = require("path");
const K = require("../js/klarnet.js");
const { MAKAMLAR, makam } = require("../js/data/makamlar.js");
const { USULLER } = require("../js/data/usuller.js");
const P = require("../js/data/parmaklar.js");
const { yin } = require("../js/yin.js");
const KlarnetDSP = require("../js/ses/klarnet-dsp.js");
const GAMZE = require("../js/data/sarki-gamzedeyim.js");

let fail = 0, n = 0;
function eq(ad, got, want, tol = 1e-6) {
  n++;
  const ok = typeof want === "number" ? Math.abs(got - want) <= tol : JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`✗ ${ad}: ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); } else console.log(`✓ ${ad}`);
}
const cent = (a, b) => 1200 * Math.log2(a / b);

// --- müzik eğitimiyle uyum ---
eq("1 koma ≈ 22,642 cent", K.KOMA_CENT, 22.6415, 1e-4);
// müzik eğitiminin deposu yanda duruyorsa onunla karşılaştır (yz/music_theory)
const MUZIK = path.join(__dirname, "../../music_theory");
if (fs.existsSync(MUZIK)) {
const T = require(MUZIK + "/js/theory.js");
eq("1 koma = müzik eğitimindeki Holdrian koması", K.KOMA_CENT, T.HOLDRIAN_COMMA, 1e-12);
eq("La4 = 440 Hz (iki sitede aynı)", K.mtof(69), T.mtof(69));
const ratios = fs.readFileSync(path.join(MUZIK, "js/demos/ratios.js"), "utf8");
for (const [id, mk] of [["rast", "rast"], ["ussak", "ussak"], ["hicaz", "hicaz"]]) {
  const m = new RegExp(id + ": \\{[^}]*?k: \\[([^\\]]+)\\]").exec(ratios);
  const theirs = m[1].split(",").map(Number);
  const mine = makam(mk).dizi.map((k) => k - makam(mk).durakKoma);
  eq(`${makam(mk).ad} koma dizisi müzik eğitimiyle aynı`, mine, theirs);
}
} else console.log("(müzik eğitimi deposu bulunamadı: karşılaştırma atlandı)");

// --- perde komaları (Rast = 0) ---
const PERDE = { "Yegâh": -22, "Hüseynî aşîrân": -13, "Acem aşîrân": -9, "Irak": -5, "Rast": 0, "Zirgüle": 5, "Dügâh": 9, "Kürdî": 13, "Dik kürdî": 14, "Segâh": 17, "Bûselik": 18, "Çârgâh": 22, "Nîm hicaz": 26, "Hicaz": 27, "Nevâ": 31, "Hisar": 36, "Hüseynî": 40, "Acem": 44, "Eviç": 48, "Mâhur": 49, "Gerdâniye": 53, "Şehnaz": 58, "Muhayyer": 62, "Tiz segâh": 70, "Tiz bûselik": 71, "Tiz çârgâh": 75, "Tiz nevâ": 84 };
for (const [ad, k] of Object.entries(PERDE)) eq(`${ad} = ${k} koma`, (K.perde(ad) || {}).koma, k);
eq("Kaba hüseynî aşîrân = yazılı Mi3 (MEB)", K.notaAdi(K.perdeYazili(K.perde("Kaba hüseynî aşîrân").koma).midi), "Mi3");
eq("Rast = yazılı Sol4", K.notaAdi(K.perdeYazili(0).midi), "Sol4");
eq("Segâh: Si'den 15,1 cent pes", K.perdeYazili(17).sapma, -15.09, 0.01);
eq("Eviç: Fa♯'den 13,2 cent pes", K.perdeYazili(48).sapma, -13.21, 0.01);
// AEU yazımı (Wikipedia "Turkish makam" tablosu)
const yz = (ad) => { const p = K.perde(ad); return [K.notaAdi(p.harfMidi).replace(/\d/, ""), p.isaret]; };
eq("Segâh = Si koma bemol", yz("Segâh"), ["Si", -1]);
eq("Kürdî = Si ♭ (5 koma)", yz("Kürdî"), ["Si", -5]);
eq("Dik kürdî = Si bakiye bemol", yz("Dik kürdî"), ["Si", -4]);
eq("Eviç = Fa bakiye diyez", yz("Eviç"), ["Fa", 4]);
eq("Nîm hicaz = Do bakiye diyez", yz("Nîm hicaz"), ["Do", 4]);
eq("Zirgüle = La bakiye bemol", yz("Zirgüle"), ["La", -4]);
eq("Irak = Fa bakiye diyez", yz("Irak"), ["Fa", 4]);

// --- makam aralık yapıları ---
const KAPALI = MAKAMLAR.filter((m) => m.id !== "saba");
KAPALI.forEach((m) => eq(`${m.ad} aralıkları toplamı 53`, m.araliklar.reduce((a, b) => a + b, 0), 53));
eq("Uşşak: 8 5 9 9 4 9 9", makam("ussak").araliklar, [8, 5, 9, 9, 4, 9, 9]);
eq("Hicaz: 5 12 5 9 8 5 9", makam("hicaz").araliklar, [5, 12, 5, 9, 8, 5, 9]);
eq("Sabâ dizisi (TDV): Dügâh Segâh Çârgâh Hicaz Dik hisar Acem Gerdâniye Şehnaz", makam("saba").dizi.map((k) => (K.perdeKoma(k) || {}).ad), ["Dügâh", "Segâh", "Çârgâh", "Hicaz", "Dik hisar", "Acem", "Gerdâniye", "Şehnaz"]);
MAKAMLAR.forEach((m) => {
  eq(`${m.ad}: durak dizinin ilk perdesi`, (K.perdeKoma(m.dizi[0]) || {}).ad, m.durak);
  eq(`${m.ad}: güçlü dizide`, m.dizi.includes(K.perde(m.guclu).koma), true);
  eq(`${m.ad}: seyir cümlesi durakta biter`, m.cumle[m.cumle.length - 1][0], m.durakKoma);
  eq(`${m.ad}: cümle dizi ve yeden dışına çıkmaz`, m.cumle.every(([k]) => m.dizi.includes(k) || k === K.perde(m.yeden).koma), true);
});

// --- aktarım yönü ---
eq("Sol klarnet: yazılı Do5 → duyulan Sol4", K.notaAdi(K.duyulan(72, "sol")), "Sol4");
eq("Sol klarnet: yazılı Do5 = 392,00 Hz", K.yaziliFrekans(72, "sol"), 392.0, 0.01);
eq("Si♭ klarnet: yazılı Do5 = 466,16 Hz", K.yaziliFrekans(72, "sib"), 466.16, 0.01);
eq("Sol klarnet yazılandan pes (aktarım < 0)", K.KLARNETLER.sol.aktarim < 0, true);
eq("Sol klarnetle yazılı La4 = 329,6 Hz (bolahenk)", K.yaziliFrekans(69, "sol"), 329.63, 0.01);
eq("Bolahenkte Dügâh ≈ 330 Hz (musiki.org)", K.perdeFrekans(9, "bolahenk"), 330.0, 0.5);
eq("Sol klarnet yazıldığı gibi = bolahenk", K.klarnetAhengi("sol"), { ahenk: "bolahenk", oktav: 0 });
const ey = K.enYakinPerde(330, { ahenk: "bolahenk" });
eq("Akort: 330 Hz bolahenkte Dügâh", ey.perde.ad, "Dügâh");
eq("Akort: 330 Hz sapması < 0,1 koma", Math.abs(ey.komaSapma) < 0.1, true);

// --- usuller ---
USULLER.forEach((u) => {
  eq(`${u.ad}: vuruş süreleri toplamı = ${u.olcu}`, u.olaylar.reduce((a, o) => a + o[2], 0), +u.olcu.split("/")[0]);
  eq(`${u.ad}: gruplar toplamı = ölçü`, u.gruplar.reduce((a, b) => a + b, 0), +u.olcu.split("/")[0]);
});
eq("Aksak 9/8 olay konumları 0,2,3,4,6,8", USULLER.find((u) => u.id === "aksak").olaylar.map((o) => o[0]), [0, 2, 3, 4, 6, 8]);

// --- parmak pozisyonları ---
eq("40 temel pozisyon (Mi3–Sol6)", P.PARMAKLAR.length, 40);
eq("Pozisyonlar kromatik ve eksiksiz", P.PARMAKLAR.map((p) => p.midi).join(), [...Array(40)].map((_, i) => 52 + i).join());
P.PARMAKLAR.forEach((p) => eq(`${p.yazili} pozisyonu geri tanınır`, P.tani(p.kapali).parmak.midi, p.midi));
eq("Clarion = alt register + R (Si4 = Mi3 + R)", JSON.stringify({ ...P.parmak(52).kapali, R: 1 }) === JSON.stringify({ R: 1, ...P.parmak(71).kapali }) || Object.keys(P.parmak(71).kapali).sort().join() === Object.keys({ ...P.parmak(52).kapali, R: 1 }).sort().join(), true);

// --- YIN: sentezlenmiş klarnet sinyalinde ±1 cent ---
const SR = 48000;
let yMax = 0;
for (const f of [123.47, 146.83, 196, 246.94, 293.66, 392, 523.25, 698.46, 987.77, 1174.66]) {
  const N = 4096, buf = new Float32Array(N);
  for (let i = 0; i < N; i++) { let s = 0; for (let hh = 1; hh <= 15; hh += 2) s += Math.sin(2 * Math.PI * f * hh * i / SR + hh) / hh; buf[i] = s * 0.3; }
  const r = yin(buf, SR, { fmin: 80, fmax: 2000 });
  yMax = Math.max(yMax, Math.abs(cent(r.f, f)));
}
eq("YIN: tek harmonikli sinyalde en büyük hata ≤ 1 cent", yMax <= 1, true);
console.log(`  (en büyük YIN hatası ${yMax.toFixed(3)} cent)`);

// --- fiziksel model: hedef frekansa ±5 cent ---
let mMax = 0;
for (const p of P.PARMAKLAR) {
  const f = K.yaziliFrekans(p.midi, "sol");
  const d = new KlarnetDSP(SR); d.delay = d.delayFor(f);
  const len = SR * 0.7, out = new Float32Array(len);
  const pr = { f, breath: 0.75, lip: 0.5, stiff: 0.5, bend: 0, vibDepth: 0, vibRate: 5, glide: 1 };
  for (let i = 0; i < len; i++) out[i] = d.tick(pr);
  const fs2 = [];
  for (let s = len - SR * 0.3; s + 4096 <= len; s += 2048) { const r = yin(out.subarray(s, s + 4096), SR, { fmin: 60, fmax: 2000 }); if (r) fs2.push(r.f); }
  fs2.sort((a, b) => a - b);
  mMax = Math.max(mMax, Math.abs(cent(fs2[fs2.length >> 1], f)));
}
eq("Fiziksel model: 40 pozisyonda hedefe ±5 cent", mMax <= 5, true);
console.log(`  (en büyük model sapması ${mMax.toFixed(2)} cent)`);

// --- Gamzedeyim verisi ---
const izinli = new Set([-6, 0, 9, 16, 17, 22, 31, 40, 44, 47, 53, 62]);
const tumu = GAMZE.bolumler.flatMap((b) => b.notalar.filter((x) => x[0] != null).map((x) => x[0]));
eq("Gamzedeyim: bütün perdeler uşşak çevresinde beklenen kümede", tumu.every((k) => izinli.has(k)), true);
eq("Gamzedeyim: 1. dize Dügâh'ta karar verir ('mam')", GAMZE.bolumler[3].notalar.find((x) => (x[2] || "").trim() === "mam")[0], 9);
eq("Gamzedeyim: sofyan, 80 vuruş/dk", [GAMZE.usul, GAMZE.tempo], ["sofyan", 80]);

console.log(`\n${n - fail}/${n} test geçti`);
process.exit(fail ? 1 : 0);
