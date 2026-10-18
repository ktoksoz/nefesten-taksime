/* Sahte mikrofon testi için WAV üretir: fiziksel modelle çalınmış bir nota dizisi.
   Kullanım: node tools/wav_uret.js <çıktı.wav> <mod>
   mod "gamze": Gamzedeyim 1. dizesinin notaları (Sol klarnet, bolahenk), her biri 0,55 s + 0,1 s sessizlik
   mod "dugah": 4 saniye Dügâh (bolahenk, ≈330 Hz) */
const fs = require("fs");
const KlarnetDSP = require("../js/ses/klarnet-dsp.js");
const K = require("../js/klarnet.js");
const G = require("../js/data/sarki-gamzedeyim.js");
const [out = "test.wav", mod = "gamze"] = process.argv.slice(2);
const SR = 48000;
let seq;
if (mod === "dugah") seq = [[9, 4, 0]];
else {
  const ns = G.bolumler.find((b) => b.ad === "Gamzedeyim devâ bulmam").notalar;
  const son = ns.map((n) => (n[2] || "").trim()).lastIndexOf("mam");
  seq = ns.slice(0, son + 1).filter((n) => n[0] != null && !n[3]).map((n) => [n[0], 0.55, 0.1]);
  seq.unshift([null, 1.5, 0]); // başta sessizlik (sayfa hazırlanırken)
  seq = seq.concat(seq.slice(1)); // dosya döngüye girer; ikinci tur
}
const parts = [];
const d = new KlarnetDSP(SR);
for (const [k, sure, bos] of seq) {
  const f = k == null ? 300 : K.perdeFrekans(k, "bolahenk");
  const p = { f, breath: k == null ? 0 : 0.75, lip: 0.5, stiff: 0.5, bend: 0, vibDepth: 0, vibRate: 5, glide: 1 };
  for (let i = 0; i < SR * sure; i++) parts.push(d.tick(p) * 0.6);
  p.breath = 0;
  for (let i = 0; i < SR * bos; i++) parts.push(d.tick(p) * 0.6);
}
const N = parts.length, buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(parts[i] * 32767))), 44 + i * 2);
fs.writeFileSync(out, buf);
console.log(out, (N / SR).toFixed(1) + " s", seq.length + " olay");
