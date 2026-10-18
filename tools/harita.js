/* Nefes × dudak haritası: fiziksel modeli bir ızgarada çalıştırıp her noktada ses düzeyini ve perde sapmasını ölçer.
   Çıktı: js/data/nefes-harita.js. Kullanım: node tools/harita.js */
const fs = require("fs");
const { olc } = require("./olcum.js");
const F = 293.66; // yazılı Sol4, Sol klarnet
const NEFES = [], DUDAK = [];
for (let b = 0.2; b <= 1.301; b += 0.05) NEFES.push(+b.toFixed(2));
for (let l = 0; l <= 1.001; l += 0.05) DUDAK.push(+l.toFixed(2));
const rms = [], cent = [];
for (const l of DUDAK) {
  const r1 = [], c1 = [];
  for (const b of NEFES) {
    const r = olc(F, { breath: b, lip: l, sure: 0.6 });
    r1.push(+r.rms.toFixed(3));
    c1.push(isFinite(r.f) && r.rms > 0.03 ? Math.round(1200 * Math.log2(r.f / F)) : null);
  }
  rms.push(r1); cent.push(c1);
  process.stderr.write(".");
}
const out = `/* Nefes × dudak haritası: tools/harita.js ile fiziksel modelden ölçüldü (yazılı Sol4, Sol klarnet).
   rms[dudak][nefes]: ses düzeyi; cent[dudak][nefes]: hedeften perde sapması (null = ses yok). */
window.NEFES_HARITA = ${JSON.stringify({ nefes: NEFES, dudak: DUDAK, rms, cent })};
`;
fs.writeFileSync(__dirname + "/../js/data/nefes-harita.js", out);
console.log("\nyazıldı", NEFES.length, "×", DUDAK.length);
