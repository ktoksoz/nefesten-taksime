/* Usul çalıcı: Web Audio saatiyle ileriye doğru planlanan (iki saat yöntemi) düm–tek vuruşları.
   Sesler sentezdir: darbuka (düm pes ve dolgun, tek tiz ve kuru, ke/kâ hafif tek), def (daha pes ve uzun) ve tık.
   Zamanlama Snd.scheduler ile yapılır: her adım bir usul birimi (sekizlik ya da dörtlük). */
(function () {
  const TINI = { darbuka: "Darbuka", def: "Def", tik: "Tık" };

  function vurus(c, ad, t, saz = "darbuka", vel = 1, dest) {
    dest = dest || Snd.bus;
    const g = c.createGain(); g.connect(dest);
    const dum = ad === "düm";
    const hafif = ad === "ke" || ad === "kâ" || ad === "te";
    if (saz === "tik" || ad === "vurgu" || ad === "tık") {
      const o = c.createOscillator(); o.type = "sine";
      o.frequency.value = ad === "vurgu" || dum ? 1760 : 1180;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45 * vel, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.connect(g); o.start(t); o.stop(t + 0.08);
      return;
    }
    const isDef = saz === "def";
    if (dum) {
      // gövde: sinüs, başta hızlı perde düşüşü
      const o = c.createOscillator(); o.type = "sine";
      const f0 = isDef ? 78 : 104;
      o.frequency.setValueAtTime(f0 * 1.9, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.035);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.85 * vel, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t + (isDef ? 0.55 : 0.38));
      o.connect(g); o.start(t); o.stop(t + 0.6);
      // deri sesi
      const n = c.createBufferSource(); n.buffer = gurultu(c);
      const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = isDef ? 500 : 900;
      const g2 = c.createGain(); g2.gain.setValueAtTime(0.25 * vel, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      n.connect(f); f.connect(g2); g2.connect(dest); n.start(t, Math.random() * 0.5); n.stop(t + 0.07);
    } else {
      // tek: kenara vuruş; tiz rezonans + kısa gürültü
      const amp = (hafif ? 0.42 : 0.7) * vel;
      const o = c.createOscillator(); o.type = "triangle";
      const f0 = isDef ? 380 : hafif ? 560 : 620;
      o.frequency.setValueAtTime(f0 * 1.25, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.012);
      const go = c.createGain(); go.gain.setValueAtTime(0.0001, t); go.gain.exponentialRampToValueAtTime(amp * 0.5, t + 0.002);
      go.gain.exponentialRampToValueAtTime(0.001, t + (isDef ? 0.12 : 0.07));
      o.connect(go); go.connect(dest); o.start(t); o.stop(t + 0.15);
      const n = c.createBufferSource(); n.buffer = gurultu(c);
      const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = isDef ? 2400 : 3400; f.Q.value = 1.1;
      g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.001, t + (isDef ? 0.09 : 0.05));
      n.connect(f); f.connect(g); n.start(t, Math.random() * 0.5); n.stop(t + 0.1);
      if (isDef) {
        // def zilleri: kısa metalik şıngırtı
        const z = c.createBufferSource(); z.buffer = gurultu(c);
        const hf = c.createBiquadFilter(); hf.type = "highpass"; hf.frequency.value = 6500;
        const gz = c.createGain(); gz.gain.setValueAtTime(0.12 * vel, t + 0.005); gz.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        z.connect(hf); hf.connect(gz); gz.connect(dest); z.start(t, Math.random() * 0.5); z.stop(t + 0.25);
      }
    }
  }
  let nb = null;
  function gurultu(c) {
    if (nb && nb.sampleRate === c.sampleRate) return nb;
    nb = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return nb;
  }

  /* Usulü döngüyle çal. opts: { tempo (birim/dk), saz, onAdim(adim, olay|null, zaman), vurgu (ilk vuruş) } */
  function cal(u, opts = {}) {
    let tempo = opts.tempo || u.tempo;
    let saz = opts.saz || "darbuka";
    let ses = opts.ses ?? 1;
    const olayAt = new Map(u.olaylar.map((o) => [o[0], o]));
    const zamanlar = []; // ölçüm için: planlanan zamanlar
    const sch = Snd.scheduler({
      interval: () => 60 / tempo,
      step: (i, t) => {
        const adim = i % u.uzunluk;
        const o = olayAt.get(adim);
        if (o && ses > 0) vurus(Snd.ctx, o[1], t, saz, (adim === 0 ? 1 : 0.85) * ses, opts.dest);
        if (opts.kayit) zamanlar.push(t);
        opts.onAdim && opts.onAdim(adim, o || null, t, i);
      },
    });
    const ctl = {
      start() { return sch.start(0); },
      stop() { sch.stop(); },
      get on() { return sch.on; },
      set tempo(v) { tempo = v; }, get tempo() { return tempo; },
      set saz(v) { saz = v; },
      set ses(v) { ses = v; },
      // görsel için o an çalınan adım (usul birimi) ya da -1
      adim() { const c = sch.current(); return c < 0 ? -1 : c % u.uzunluk; },
      sayac() { return sch.current(); },
      zamanlar,
    };
    Snd.own(ctl);
    return ctl;
  }

  window.Usul = { cal, vurus, TINI };
})();
