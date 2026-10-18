/* YIN perde (temel frekans) bulma algoritması: de Cheveigné ve Kawahara (2002),
   "YIN, a fundamental frequency estimator for speech and music", JASA 111(4).
   Adımlar: fark fonksiyonu → birikimli ortalamayla normalleştirme → mutlak eşik → parabolik ara değerleme.
   Saf fonksiyon: tarayıcıda window.YIN, Node'da require("./yin.js"). */
(function (root) {
  // buf: Float32Array (tek kanal), sr: örnekleme hızı. Dönüş: { f, olasilik } ya da null
  function yin(buf, sr, { fmin = 80, fmax = 1600, esik = 0.12 } = {}) {
    const W = Math.floor(buf.length / 2);
    const tauMin = Math.max(2, Math.floor(sr / fmax));
    const tauMax = Math.min(W - 1, Math.ceil(sr / fmin));
    if (tauMax <= tauMin + 2) return null;
    const d = new Float32Array(tauMax + 2);
    // 1-2) fark fonksiyonu
    for (let tau = 1; tau <= tauMax + 1; tau++) {
      let s = 0;
      for (let j = 0; j < W; j++) { const x = buf[j] - buf[j + tau]; s += x * x; }
      d[tau] = s;
    }
    // 3) birikimli ortalamayla normalleştirilmiş fark
    const dn = new Float32Array(tauMax + 2);
    dn[0] = 1;
    let run = 0;
    for (let tau = 1; tau <= tauMax + 1; tau++) { run += d[tau]; dn[tau] = run > 0 ? (d[tau] * tau) / run : 1; }
    // 4) mutlak eşik: eşiğin altına düşen ilk çukurun dibi
    let tau = -1;
    for (let t = tauMin; t <= tauMax; t++) {
      if (dn[t] < esik) {
        while (t + 1 <= tauMax && dn[t + 1] < dn[t]) t++;
        tau = t; break;
      }
    }
    if (tau < 0) {
      // eşik aşılmadıysa en derin çukur (güvenilirliği düşük)
      let best = tauMin;
      for (let t = tauMin + 1; t <= tauMax; t++) if (dn[t] < dn[best]) best = t;
      if (dn[best] > 0.35) return null;
      tau = best;
    }
    // 5) parabolik ara değerleme (normalleştirilmemiş fark üzerinde, makaledeki gibi)
    let tf = tau;
    if (tau > 1 && tau < tauMax + 1) {
      const a = d[tau - 1], b = d[tau], c = d[tau + 1];
      const den = a - 2 * b + c;
      if (den > 0) tf = tau + (0.5 * (a - c)) / den;
    }
    return { f: sr / tf, olasilik: 1 - Math.min(1, dn[tau]) };
  }
  // sinyalin RMS düzeyi
  function rms(buf) { let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); }

  const out = { yin, rms };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else root.YIN = out;
})(typeof window !== "undefined" ? window : globalThis);
