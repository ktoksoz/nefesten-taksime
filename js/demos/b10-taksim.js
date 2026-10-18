/* 10. bölüm: Süslemeler ve taksim */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;

  /* Perde yolu: [{t, k}] kırılma noktaları (doğrusal kayma) + vibrato aralıkları. Klarnet sesine aktarılır ve çizilir.
     olay: { t, d, k, glis (önceki perdeden kayma süresi), vib (0..1), dil (true: yeni atak) } */
  function oynat(olaylar, { nefes = 0.74, onBitti } = {}) {
    Snd.unlock(); Klarnet.hazirla();
    const v = Klarnet.ses({ frekans: D.perdeHz(olaylar[0].k) });
    if (!v) return null;
    Snd.own(v);
    const c = Snd.ctx, P = v.p, t0 = c.currentTime + 0.08;
    P.nefes.setValueAtTime(0, c.currentTime);
    olaylar.forEach((o, i) => {
      const t = t0 + o.t, f = D.perdeHz(o.k);
      if (o.glis && i > 0) { P.frekans.setValueAtTime(D.perdeHz(olaylar[i - 1].k), t); P.frekans.exponentialRampToValueAtTime(f, t + o.glis); }
      else P.frekans.setValueAtTime(f, t);
      if (i === 0 || o.dil) { P.nefes.setTargetAtTime(i === 0 ? 0 : 0.25, t - 0.025, 0.006); P.nefes.setTargetAtTime(nefes, t, 0.01); }
      P.vibrato.setTargetAtTime(o.vib || 0, t + (o.vib ? Math.min(0.3, o.d * 0.3) : 0), 0.08);
      if (o.es) P.nefes.setTargetAtTime(0, t, 0.02);
    });
    const son = olaylar[olaylar.length - 1], T = son.t + son.d;
    P.nefes.setTargetAtTime(0, t0 + T, 0.04);
    const id = setTimeout(() => { v.stop(); ctl.bitti = true; onBitti && onBitti(); }, (T + 0.4) * 1000 + 80);
    const ctl = { t0, T, bitti: false, simdi: () => c.currentTime - t0, stop() { clearTimeout(id); v.stop(); ctl.bitti = true; } };
    return ctl;
  }
  // çizim için perde yolu (koma) zamana göre
  function yolKoma(olaylar, t) {
    for (let i = olaylar.length - 1; i >= 0; i--) {
      const o = olaylar[i];
      if (t >= o.t) {
        if (o.es) return null;
        let k = o.k;
        if (o.glis && i > 0 && t < o.t + o.glis) { const u = (t - o.t) / o.glis; k = olaylar[i - 1].k + (o.k - olaylar[i - 1].k) * u; }
        if (o.vib) k += Math.sin(t * 2 * Math.PI * 5.5) * (25 / K.KOMA_CENT) * o.vib * Math.min(1, (t - o.t) / 0.35);
        return k;
      }
    }
    return olaylar.length ? olaylar[0].k : null;
  }
  // dizi [k, süre, {glis, vib, dil}] → olaylar
  function olayla(dizi) {
    let t = 0;
    return dizi.map(([k, d, x = {}]) => { const o = { t, d, k, glis: x.glis || 0, vib: x.vib || 0, dil: x.dil ?? !x.glis, es: k == null }; t += d; return o; });
  }

  // yol çizimi: perde ızgarası + zaman ekseninde iz
  function yolCiz(ctx, w, hh, olaylar, simdi, { kAlt, kUst, makam: m } = {}) {
    const x = Math.min(140, w * 0.26), x1 = w - 16;
    const pk = (ad) => (K.perde(ad) || {}).koma;
    const per = (m ? m.dizi.concat([pk(m.yeden)]) : [0, 9, 17, 22, 31, 40, 44, 53]).filter((k) => k >= kAlt && k <= kUst).map((k) => {
      const p = K.perdeKoma(k); return { koma: k, ad: p ? p.ad : "", rol: m ? D.rol(m, k) : null };
    });
    const g = Cizim.izgara(ctx, { x, y0: 18, y1: hh - 22, kAlt, kUst, perdeler: per, sag: x1 - x, dar: w < 520 });
    const son = olaylar[olaylar.length - 1], T = son.t + son.d;
    const X = (t) => x + 16 + (t / T) * (x1 - x - 26);
    ctx.strokeStyle = rgba(C.ink, 0.25); ctx.lineWidth = 1.6; ctx.beginPath();
    let ilk = true;
    for (let i = 0; i <= 900; i++) { const t = (i / 900) * T, k = yolKoma(olaylar, t); if (k == null) { ilk = true; continue; } ilk ? ctx.moveTo(X(t), g.yOf(k)) : ctx.lineTo(X(t), g.yOf(k)); ilk = false; }
    ctx.stroke();
    if (simdi > 0) {
      ctx.strokeStyle = C.durak; ctx.lineWidth = 2.4; ctx.beginPath(); ilk = true;
      for (let i = 0; i <= 900; i++) { const t = (i / 900) * T; if (t > simdi) break; const k = yolKoma(olaylar, t); if (k == null) { ilk = true; continue; } ilk ? ctx.moveTo(X(t), g.yOf(k)) : ctx.lineTo(X(t), g.yOf(k)); ilk = false; }
      ctx.stroke();
      const k = yolKoma(olaylar, Math.min(simdi, T));
      if (k != null && simdi < T) { ctx.save(); ctx.fillStyle = C.durak; ctx.shadowColor = C.durak; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(X(simdi), g.yOf(k), 5, 0, 7); ctx.fill(); ctx.restore(); }
    }
    return g;
  }

  /* ================= Süslemeler ================= */
  const SUSLEME = {
    carpma: { ad: "Çarpma", duz: [[9, 0.7], [17, 0.7], [9, 1.2]], suslu: [[9, 0.7], [22, 0.08], [17, 0.62, { dil: false }], [0, 0.08], [9, 1.12, { dil: false }]] },
    glis: { ad: "Glissando", duz: [[9, 0.8], [31, 1.4]], suslu: [[9, 0.8], [31, 1.4, { glis: 0.3 }]] },
    vib: { ad: "Vibrato", duz: [[31, 2.2]], suslu: [[31, 2.2, { vib: 0.75 }]] },
    tril: { ad: "Tril", duz: [[17, 1.2], [9, 1]], suslu: [...Array(10)].map((_, i) => [i % 2 ? 22 : 17, 0.12, { dil: false }]).concat([[9, 1, { dil: true }]]) },
  };
  Demos.susleme = (stage) => {
    const { cv } = D.tuval(stage, "Süslemenin perde yolu");
    const ctl = h("div.controls");
    stage.append(ctl);
    let sec = "carpma", suslu = true, ol = olayla(SUSLEME.carpma.suslu), calan = null, st;
    function kur() { ol = olayla(suslu ? SUSLEME[sec].suslu : SUSLEME[sec].duz); }
    function cal() { calan && calan.stop(); kur(); calan = oynat(ol, { onBitti: () => (calan = null) }); }
    const draw = () => { if (!st || !st.w) return; st.ctx.clearRect(0, 0, st.w, st.h); yolCiz(st.ctx, st.w, st.h, ol, calan && !calan.bitti ? calan.simdi() : -1, { kAlt: -3, kUst: 36 }); };
    const lp = loop(draw);
    st = canvas(cv, draw);
    ctl.append(seg(Object.entries(SUSLEME).map(([k, s]) => [k, s.ad]), sec, (k) => { sec = k; cal(); }, "Süsleme"),
      seg([[false, "Süslemesiz"], [true, "Süslemeli"]], suslu, (v) => { suslu = v; cal(); }, "Biçim"),
      h("button.btn.primary", { type: "button", onclick: cal }, "▶ Çal"));
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); } };
  };
  G.susleme = [{ click: "=Süslemesiz" }, { wait: 2600 }, { click: "=Süslemeli" }, { wait: 2600 }, { click: "=Glissando" }];

  /* ================= Taksim (bu site için yazılmış kısa bir Uşşak taksimi) ================= */
  const TAKSIM = [
    [9, 1.6, { vib: 0.5 }], [17, 0.3], [9, 0.3, { dil: false }], [0, 0.45], [9, 1.3, { vib: 0.6 }], [null, 0.35],
    [17, 0.25], [22, 0.3, { dil: false }], [17, 0.25, { dil: false }], [22, 0.3, { dil: false }], [31, 1.7, { vib: 0.6 }], [null, 0.3],
    [40, 0.4], [44, 0.3, { dil: false }], [40, 0.3, { dil: false }], [31, 0.3], [40, 1.0, { vib: 0.5 }], [31, 0.3], [22, 0.3, { dil: false }], [31, 1.5, { vib: 0.6 }], [null, 0.35],
    [44, 0.25], [53, 0.6, { glis: 0.18 }], [44, 0.3], [40, 0.3, { dil: false }], [31, 0.3, { dil: false }], [22, 0.3, { dil: false }], [17, 0.3, { dil: false }], [22, 0.7, { vib: 0.4 }], [null, 0.3],
    [17, 0.4], [9, 0.4, { dil: false }], [0, 0.55], [9, 2.4, { vib: 0.6 }],
  ];
  Demos.taksim = (stage) => {
    const { cv } = D.tuval(stage, "Taksimin seyir izi");
    const ctl = h("div.controls");
    stage.append(ctl);
    const ol = olayla(TAKSIM);
    let calan = null, st;
    const m = makam("ussak");
    const draw = () => { if (!st || !st.w) return; st.ctx.clearRect(0, 0, st.w, st.h); yolCiz(st.ctx, st.w, st.h, ol, calan && !calan.bitti ? calan.simdi() : -1, { kAlt: -4, kUst: 56, makam: m }); };
    const lp = loop(draw);
    st = canvas(cv, draw);
    const btn = h("button.btn.primary", { type: "button", onclick: () => { if (calan && !calan.bitti) { calan.stop(); btn.textContent = "▶ Taksimi dinle"; return; } calan = oynat(ol, { nefes: 0.72, onBitti: () => (btn.textContent = "▶ Taksimi dinle") }); if (calan) btn.textContent = "■ Durdur"; } }, "▶ Taksimi dinle");
    ctl.append(btn, h("span.mute", "Durak (Dügâh) ve güçlü (Nevâ) renkli; iz seyrin yolunu çiziyor"));
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); btn.textContent = "▶ Taksimi dinle"; } };
  };
  G.taksim = [{ click: "▶ Taksimi dinle" }];

  /* ================= Taksim alanı ================= */
  Demos.taksimalani = (stage) => {
    const ust = h("div.controls.top");
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const { fill, cv } = (() => { const f = h("div.fill"); const c = h("canvas", { role: "img", "aria-label": "Taksim izi ve makam dizisi" }); f.append(c); return { fill: f, cv: c }; })();
    ikili.append(kcYer, fill);
    const rehber = h("div.ta-rehber", { "aria-live": "polite" });
    const ctl = h("div.controls");
    stage.append(ust, ikili, rehber, ctl);
    let m = makam("ussak"), iz = [], t0 = performance.now(), ufluyor = false, abone = null, adim = -1, adimT = 0, st;
    const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: true, onUfle: (on) => { ufluyor = on; } });
    kc.goster(K.perdeYazili(m.durakKoma).midi, { sessiz: true });
    const pk = (ad) => (K.perde(ad) || {}).koma;
    const ADIMLAR = () => [
      { ad: `Durağı tanıtın: ${m.durak} çevresinde dolaşın`, kosul: (s) => s.yakin(m.durakKoma, 5) > 2.5 },
      { ad: `Güçlüye çıkın: ${m.guclu}`, kosul: (s) => s.tut(pk(m.guclu), 0.8) },
      { ad: `${m.guclu} perdesinde dinlenin, yarım karar verin`, kosul: (s) => s.tut(pk(m.guclu), 2) },
      { ad: `Durağa dönün ve karar verin: ${m.durak}`, kosul: (s) => s.tut(m.durakKoma, 1.5) },
    ];
    function rehberCiz() {
      const A = ADIMLAR();
      rehber.innerHTML = adim < 0 ? '<span class="mute">"Rehberi başlat" ile seyir adımlarını izleyin ya da serbestçe çalın.</span>'
        : A.map((a, i) => `<span class="ta-adim${i < adim ? " ok" : i === adim ? " simdi" : ""}">${i + 1}. ${a.ad}</span>`).join("") + (adim >= A.length ? '<b class="c-guclu">Karar verdiniz. Güzel bir taksimdi.</b>' : "");
    }
    // iz örneği ekle (koma, makam aralığına oktavla taşınmış)
    function ekle(f) {
      const kA = Math.min(...m.dizi) - 9, kU = Math.max(...m.dizi);
      let k = 53 * Math.log2(f / K.perdeFrekans(0, D.ahenk()));
      while (k < kA - 3) k += 53; while (k > kU + 3) k -= 53;
      const t = (performance.now() - t0) / 1000;
      const yakin = m.dizi.concat([pk(m.yeden)]).reduce((b, x) => Math.min(b, Math.abs(x - k)), 99);
      iz.push([t, k, yakin > 1.5]);
      while (iz.length && iz[0][0] < t - 12) iz.shift();
      kontrol(t);
    }
    function kontrol(t) {
      const A = ADIMLAR();
      if (adim < 0 || adim >= A.length) return;
      const son = (s) => iz.filter((x) => x[0] >= t - s);
      const s = {
        yakin: (k, w) => son(6).filter((x) => Math.abs(x[1] - k) <= w).length / 30,
        tut: (k, sure) => { const p = son(sure); return p.length > sure * 20 && p.every((x) => Math.abs(x[1] - k) <= 1.2); },
      };
      if (t - adimT > 0.5 && A[adim].kosul(s)) { adim++; adimT = t; rehberCiz(); }
    }
    // kaynak: klarnet çizimi (üflerken) ya da mikrofon
    const lp = loop(() => {
      if (ufluyor && !Mikrofon.acik) ekle(kc.frekans());
      draw();
    });
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const g = Merdiven(ctx, w, hh, { makam: m, roller: { durak: true, guclu: true, yeden: true } });
      if (iz.length > 1) {
        const tNow = (performance.now() - t0) / 1000;
        const x0 = Math.min(w * 0.55, (w < 520 ? 174 : 270)), x1 = w - 16;
        const X = (t) => x1 - ((tNow - t) / 12) * (x1 - x0);
        ctx.strokeStyle = C.silverHi; ctx.lineWidth = 2; ctx.beginPath();
        let ilk = true;
        iz.forEach(([t, k], i) => { if (i && t - iz[i - 1][0] > 0.15) ilk = true; ilk ? ctx.moveTo(X(t), g.yOf(k)) : ctx.lineTo(X(t), g.yOf(k)); ilk = false; });
        ctx.stroke();
        iz.forEach(([t, k, disi]) => { if (disi) { ctx.fillStyle = rgba(C.yeden, 0.7); ctx.beginPath(); ctx.arc(X(t), g.yOf(k), 3, 0, 7); ctx.fill(); } });
      }
    }
    st = canvas(cv, draw);
    function mikDinle() { if (abone) abone(); abone = Mikrofon.dinle((o) => { if (o.f) ekle(o.f); }); }
    ust.append(seg(MAKAMLAR.map((x) => [x.id, x.ad]), m.id, (id) => { m = makam(id); iz = []; adim = -1; rehberCiz(); kc.goster(K.perdeYazili(m.durakKoma).midi, { sessiz: true }); }, "Makam"));
    ctl.append(h("button.btn.primary", { type: "button", onclick: () => { adim = 0; adimT = (performance.now() - t0) / 1000; iz = []; rehberCiz(); } }, "Rehberi başlat"),
      Mikrofon.dugme({ kucuk: true, onAcik: (a) => { if (a) mikDinle(); } }),
      h("span.mute", "Ağızlığı basılı tutun; makam dışı perdeler kırmızı noktayla işaretlenir"));
    rehberCiz();
    return { enter() { lp.start(); if (Mikrofon.acik) mikDinle(); }, leave() { lp.stop(); if (abone) { abone(); abone = null; } kc.ufle(false); } };
  };
  G["taksim-alani"] = [{ click: "Rehberi başlat" }];
})();
