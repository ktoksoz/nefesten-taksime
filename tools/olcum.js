/* Fiziksel modelin ürettiği frekansı ölçer (Node). Kullanım: node tools/olcum.js [nefes] [dudak]
   Her hedef frekans için modeli 1 saniye çalıştırır, son 0,4 saniyede YIN ile frekansı bulur. */
const KlarnetDSP = require("../js/ses/klarnet-dsp.js");
const { yin, rms } = require("../js/yin.js");
const K = require("../js/klarnet.js");
const SR = 48000;
function olc(f, { breath = 0.75, lip = 0.5, stiff = 0.5, sure = 1.0 } = {}) {
  const d = new KlarnetDSP(SR);
  const n = Math.round(SR * sure), out = new Float32Array(n);
  const p = { f, breath, lip, stiff, bend: 0, vibDepth: 0, vibRate: 5, glide: 1 };
  d.delay = d.delayFor(f);
  for (let i = 0; i < n; i++) out[i] = d.tick(p);
  const tail = out.subarray(n - Math.round(SR * 0.4));
  const fs = [];
  for (let s = 0; s + 4096 <= tail.length; s += 2048) { const r = yin(tail.subarray(s, s + 4096), SR, { fmin: 60, fmax: 2000 }); if (r) fs.push(r.f); }
  fs.sort((a, b) => a - b);
  const med = fs.length ? fs[fs.length >> 1] : NaN;
  return { f: med, rms: rms(tail), out };
}
module.exports = { olc, SR };
if (require.main === module) {
  const breath = +(process.argv[2] || 0.75), lip = +(process.argv[3] || 0.5);
  const P = require("../js/data/parmaklar.js");
  let maxErr = 0;
  for (const p of P.PARMAKLAR) {
    const f = K.yaziliFrekans(p.midi, "sol");
    const r = olc(f, { breath, lip });
    const c = 1200 * Math.log2(r.f / f);
    maxErr = Math.max(maxErr, Math.abs(c));
    console.log(p.yazili.padEnd(4), f.toFixed(1).padStart(7), r.f.toFixed(2).padStart(8), (c >= 0 ? "+" : "") + c.toFixed(1), "rms", r.rms.toFixed(3));
  }
  console.log("en büyük sapma (cent):", maxErr.toFixed(1));
}
