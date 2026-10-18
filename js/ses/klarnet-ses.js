/* Klarnet sesi: fiziksel model (AudioWorklet) ya da yedek toplamsal sentez.
   - Fiziksel model: js/ses/klarnet-dsp.js + klarnet-worklet.js. AudioWorklet güvenli bağlam ister
     (https ya da localhost); file:// ile açılırsa ya da tarayıcı desteklemezse yedek yola geçilir.
   - Yedek yol: tek harmonikleri ağır basan bir dalga (1, 3, 5, 7…; çift harmonikler çok zayıf), normal Web Audio
     düğümleriyle. Nefes eşiği ve parlaklık WaveShaper eğrileriyle yaklaşık taklit edilir.
   İki yolda da ses nesnesi aynı AudioParam adlarını taşır: frekans, nefes, dudak, sertlik, sent, vibrato. */
(function () {
  let yukleme = null, worklet = false, hata = "";

  function hazirla() {
    if (yukleme) return yukleme;
    const c = Snd.ctx;
    if (!c) return (yukleme = Promise.resolve(false));
    if (!c.audioWorklet || location.protocol === "file:" || !window.isSecureContext) {
      hata = location.protocol === "file:" ? "file:// ile açıldı" : "AudioWorklet desteklenmiyor";
      return (yukleme = Promise.resolve(false));
    }
    const v = (document.querySelector('script[src*="klarnet-ses.js"]') || {}).src || "";
    const q = (v.split("?")[1] || "");
    const base = new URL("js/ses/", location.href).href;
    yukleme = c.audioWorklet.addModule(base + "klarnet-dsp.js" + (q ? "?" + q : ""))
      .then(() => c.audioWorklet.addModule(base + "klarnet-worklet.js" + (q ? "?" + q : "")))
      .then(() => (worklet = true), (e) => { hata = String(e && e.message || e); console.warn("Fiziksel model yüklenemedi, yedek sentez kullanılacak:", hata); return false; });
    return yukleme;
  }

  /* ---- yedek: toplamsal sentez ---- */
  function egri(n, fn) { const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = fn(i / (n - 1)); return a; }
  function yedekSes(c, dest) {
    const out = c.createGain(); out.gain.value = 0.9;
    // tek harmonikli dalga: 1/h^1,1 tekler, çiftler -40 dB civarı
    const amps = [];
    for (let h = 1; h <= 24; h++) amps.push(h % 2 ? Math.pow(1 / h, 1.1) : 0.012 / h);
    const osc = c.createOscillator();
    osc.setPeriodicWave(Snd.wave(amps));
    osc.frequency.value = 392;
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 0.4; lp.frequency.value = 800;
    const amp = c.createGain(); amp.gain.value = 0;
    osc.connect(lp); lp.connect(amp); amp.connect(out); out.connect(dest);
    // parametre kaynakları
    const sabit = (v) => { const s = c.createConstantSource(); s.offset.value = v; s.start(); return s; };
    const nefes = sabit(0), dudak = sabit(0.5), sent = sabit(0), sertlik = sabit(0.5), vibrato = sabit(0);
    // nefes → genlik: eşiğin altında ses yok, sonra yumuşak doyum (0..1,3 → 0..1)
    const sh = c.createWaveShaper();
    sh.curve = egri(256, (x) => { const b = x * 1.3 * 2 - 1.3; if (b < 0.45) return 0; return Math.min(1, Math.pow((b - 0.45) / 0.35, 0.7)) * 0.32; });
    // WaveShaper girişi -1..1: nefesi 0..1,3 aralığından ölçekle
    const olc = c.createGain(); olc.gain.value = 1 / 1.3;
    nefes.connect(olc); olc.connect(sh); sh.connect(amp.gain);
    // nefes → parlaklık (filtre frekansı): f × (2 + 10·nefes)
    const parlak = c.createGain(); parlak.gain.value = 392 * 8;
    const sh2 = c.createWaveShaper(); sh2.curve = egri(256, (x) => Math.max(0, x * 2 - 1) * 1.3);
    olc.connect(sh2); sh2.connect(parlak); parlak.connect(lp.frequency);
    // dudak → sent: gevşek dudak pesleştirir (−70), sıkı dudak hafifçe tizleştirir (+30)
    const sh3 = c.createWaveShaper(); sh3.curve = egri(256, (x) => { const d = x; return d < 0.5 ? (d - 0.5) * 140 : (d - 0.5) * 60; });
    const dIn = c.createGain(); dIn.gain.value = 2; const dOff = sabit(-1);
    dudak.connect(dIn); dIn.connect(sh3); dOff.connect(sh3);
    sh3.connect(osc.detune); sent.connect(osc.detune);
    // vibrato: 5,5 Hz LFO, derinlik 0..1 → ±25 sent
    const lfo = c.createOscillator(); lfo.frequency.value = 5.5; const lg = c.createGain(); lg.gain.value = 0;
    const vib = c.createGain(); vib.gain.value = 25; lfo.connect(lg); vibrato.connect(lg.gain); lg.connect(vib); vib.connect(osc.detune); lfo.start();
    // nefes gürültüsü
    const nz = c.createBufferSource(); const nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    nz.buffer = nb; nz.loop = true;
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2500; bp.Q.value = 0.7;
    const ng = c.createGain(); ng.gain.value = 0;
    const ngc = c.createGain(); ngc.gain.value = 0.035; nefes.connect(ngc); ngc.connect(ng.gain);
    nz.connect(bp); bp.connect(ng); ng.connect(out); nz.start();
    osc.start();
    const frekans = osc.frequency;
    // frekans değişince parlaklık ölçeğini de güncelle
    const origSet = frekans.setValueAtTime.bind(frekans), origTarget = frekans.setTargetAtTime.bind(frekans);
    frekans.setValueAtTime = (v, t) => { parlak.gain.setValueAtTime(v * 8, t); return origSet(v, t); };
    frekans.setTargetAtTime = (v, t, tau) => { parlak.gain.setTargetAtTime(v * 8, t, tau); return origTarget(v, t, tau); };
    const nodes = [osc, lfo, nz, nefes, dudak, sent, sertlik, vibrato, dOff];
    return {
      out,
      p: { frekans, nefes: nefes.offset, dudak: dudak.offset, sent: sent.offset, sertlik: sertlik.offset, vibrato: vibrato.offset, vibratoHiz: lfo.frequency, kayma: c.createGain().gain },
      kapat(t) { nodes.forEach((n) => { try { n.stop(t); } catch (e) {} }); setTimeout(() => out.disconnect(), Math.max(0, (t - c.currentTime) * 1000) + 200); },
    };
  }

  function fizikselSes(c, dest) {
    const node = new AudioWorkletNode(c, "klarnet", { numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1] });
    const out = c.createGain(); out.gain.value = 0.42;
    node.connect(out); out.connect(dest);
    const P = node.parameters;
    return {
      out,
      p: { frekans: P.get("frekans"), nefes: P.get("nefes"), dudak: P.get("dudak"), sent: P.get("sent"), sertlik: P.get("sertlik"), vibrato: P.get("vibrato"), vibratoHiz: P.get("vibratoHiz"), kayma: P.get("kayma") },
      kapat(t) { setTimeout(() => { node.port.postMessage("bitir"); node.disconnect(); out.disconnect(); }, Math.max(0, (t - c.currentTime) * 1000) + 300); },
    };
  }

  /* Yeni bir klarnet sesi. Sürekli çalar; nefes 0 iken sessizdir.
     opts: { dest, frekans, dudak, sertlik } */
  function ses(opts = {}) {
    const c = Snd.ready();
    if (!c) return null;
    const dest = opts.dest || Snd.bus;
    const v = worklet ? fizikselSes(c, dest) : yedekSes(c, dest);
    const P = v.p;
    const t0 = c.currentTime;
    P.frekans.setValueAtTime(opts.frekans || 392, t0);
    P.dudak.setValueAtTime(opts.dudak ?? 0.5, t0);
    P.sertlik.setValueAtTime(opts.sertlik ?? 0.5, t0);
    let durdu = false;
    const obj = {
      p: P, out: v.out, fiziksel: worklet,
      // anlık değiştirme (etkileşimli kontroller için): yumuşak geçiş
      set(ad, deger, tau = 0.02, at) { const t = at ?? c.currentTime; P[ad].cancelScheduledValues(t); P[ad].setTargetAtTime(deger, t, tau); return obj; },
      // nefesle başlat: dil vuruşu (kısa düşüş) + atak
      ufle(nefes = 0.75, at) { const t = at ?? c.currentTime; P.nefes.cancelScheduledValues(t); P.nefes.setTargetAtTime(nefes, t, 0.012); return obj; },
      sus(at, tau = 0.04) { const t = at ?? c.currentTime; P.nefes.cancelScheduledValues(t); P.nefes.setTargetAtTime(0, t, tau); return obj; },
      stop(at) {
        if (durdu) return; durdu = true;
        const t = at ?? c.currentTime;
        P.nefes.cancelScheduledValues(t); P.nefes.setTargetAtTime(0, t, 0.03);
        v.kapat(t + 0.25);
      },
      get durdu() { return durdu; },
    };
    return obj;
  }

  /* Ezgi çal: notalar [{f, t, d, nefes?, legato?, glis?}] (t ve d saniye).
     onNota(i, nota) görsel eşzamanlama için nota başında çağrılır. Dönüş: { stop, bitis } */
  function ezgi(notalar, { nefes = 0.74, dudak = 0.5, vibrato = 0, onNota, onBitti, gecikme = 0.08, dest } = {}) {
    const c = Snd.ready();
    if (!c) return null;
    const v = ses({ dest, frekans: notalar[0] ? notalar[0].f : 392, dudak });
    if (!v) return null;
    const P = v.p;
    const t0 = c.currentTime + gecikme;
    P.vibrato.setValueAtTime(vibrato, t0);
    const timers = [];
    let son = t0;
    notalar.forEach((n, i) => {
      const t = t0 + n.t, b = n.nefes ?? nefes;
      const prev = notalar[i - 1];
      const bitisik = prev && Math.abs(prev.t + prev.d - n.t) < 0.005;
      if (n.f) {
        if (n.glis && prev && prev.f) { P.frekans.setValueAtTime(prev.f, t); P.frekans.linearRampToValueAtTime(n.f, t + n.glis); }
        else P.frekans.setValueAtTime(n.f, t);
        if (!(n.legato && bitisik)) {
          // dil vuruşu: nefes bir an düşer ve yeniden yükselir
          P.nefes.setTargetAtTime(bitisik ? 0.2 : 0, t - 0.03, 0.006);
          P.nefes.setTargetAtTime(b, t, 0.01);
        }
        // sonraki nota bitişik değilse sus
        const next = notalar[i + 1];
        if (!next || Math.abs(t + n.d - (t0 + next.t)) > 0.005) P.nefes.setTargetAtTime(0, t + n.d - 0.02, 0.025);
      } else {
        P.nefes.setTargetAtTime(0, t, 0.02); // es
      }
      son = Math.max(son, t + n.d);
      if (onNota) timers.push(setTimeout(() => onNota(i, n), Math.max(0, (t - c.currentTime) * 1000)));
    });
    let bitti = false;
    const bitirT = setTimeout(() => { bitti = true; v.stop(); onBitti && onBitti(); }, (son - c.currentTime) * 1000 + 250);
    const ctl = {
      stop() { timers.forEach(clearTimeout); clearTimeout(bitirT); if (!bitti) { bitti = true; v.stop(); } },
      bitis: son, ses: v,
    };
    Snd.own(ctl);
    return ctl;
  }

  // vuruş dizisinden ezgi: [[f|null, vuruş], ...], tempo (vuruş/dk)
  function vuruslardan(dizi, tempo = 90, { legato = false } = {}) {
    const b = 60 / tempo;
    let t = 0;
    return dizi.map(([f, v]) => { const n = { f, t, d: v * b * (legato ? 1 : 0.92), legato }; t += v * b; return n; });
  }

  window.Klarnet = {
    hazirla, ses, ezgi, vuruslardan,
    get fiziksel() { return worklet; }, get hata() { return hata; },
  };
  // ses bağlamı açılır açılmaz modeli yükle (ilk notada gecikme olmasın)
  ["pointerdown", "keydown", "touchend"].forEach((t) => window.addEventListener(t, () => { if (Snd.ctx) hazirla(); }, { once: true, capture: true, passive: true }));
})();
