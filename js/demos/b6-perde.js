/* 6. bölüm: Türk müziğinin perdeleri — koma, perde ızgarası, koma perdeleri klarnette, akort aleti */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp, lerp } = L;
  const G = window.GuideScenarios;

  // bir sesin çıkışından perde izleyen çözümleyici (deneme sesleri için; mikrofonla aynı YIN hattı)
  function sesIzle(node, cb) {
    const c = Snd.ctx, an = c.createAnalyser(); an.fftSize = 2048; node.connect(an);
    const buf = new Float32Array(2048);
    let raf = 0, son = [];
    const tik = () => {
      an.getFloatTimeDomainData(buf);
      const r = YIN.rms(buf);
      let o = { f: 0, rms: r, t: performance.now() };
      if (r > 0.008) { const y = YIN.yin(buf, c.sampleRate, { fmin: 100, fmax: 2000, esik: 0.15 }); if (y && y.olasilik > 0.75) { son.push(y.f); if (son.length > 3) son.shift(); const s = [...son].sort((a, b) => a - b); o.f = s[s.length >> 1]; } }
      cb(o); raf = requestAnimationFrame(tik);
    };
    tik();
    return () => { cancelAnimationFrame(raf); try { node.disconnect(an); } catch (e) {} };
  }
  window.SesIzle = sesIzle;

  /* ================= Koma nedir? ================= */
  const ARALIKLAR = [[1, "1 koma"], [4, "4 bakiye"], [5, "5 küçük mücennep"], [8, "8 büyük mücennep"], [9, "9 tanini"], [12, "12 artık ikili"]];
  Demos.koma = (stage) => {
    const { cv } = D.tuval(stage, "53 komalık oktav ve seçilen aralık");
    const ctl = h("div.controls");
    stage.append(ctl);
    let a = 9, st, isik = -1, t0 = 0, calan = null;
    const tm = D.timers();
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = 40, x1 = w - 40, y = hh * 0.42;
      const X = (k) => x0 + (k / 53) * (x1 - x0);
      // 53 komalık çizgi
      ctx.strokeStyle = rgba(C.koma, 0.5); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let k = 0; k <= 53; k++) { const x = Math.round(X(k)) + 0.5, len = k % 9 === 0 ? 9 : 4; ctx.beginPath(); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke(); }
      // 12 ses
      const yw = hh * 0.66;
      ctx.strokeStyle = rgba(C.ink, 0.35); ctx.beginPath(); ctx.moveTo(x0, yw); ctx.lineTo(x1, yw); ctx.stroke();
      for (let s = 0; s <= 12; s++) { const x = x0 + (s / 12) * (x1 - x0); ctx.beginPath(); ctx.moveTo(x, yw - 6); ctx.lineTo(x, yw + 6); ctx.stroke(); }
      text(ctx, "53 koma", x1, y - 18, { size: 11, color: C.koma, align: "right" });
      text(ctx, "12 yarım ses", x1, yw - 14, { size: 11, color: C.ink2, align: "right" });
      // aralık: Dügâh'tan (9) yukarı
      const k0 = 9, k1 = 9 + a;
      ctx.fillStyle = rgba(C.durak, 0.18); ctx.fillRect(X(k0), y - 16, X(k1) - X(k0), 32);
      [k0, k1].forEach((k, i) => {
        ctx.save(); if (isik === i) { ctx.shadowColor = C.durak; ctx.shadowBlur = 16; }
        ctx.fillStyle = C.durak; ctx.beginPath(); ctx.arc(X(k), y, isik === i ? 8 : 6, 0, 7); ctx.fill(); ctx.restore();
      });
      text(ctx, `${a} koma = ${fmtNum(a * K.KOMA_CENT, 1)} cent`, (X(k0) + X(k1)) / 2, y - 26, { size: 14, align: "center", color: C.ink, weight: 700 });
      // en yakın yarım ses karşılaştırması
      const yari = Math.round((a * K.KOMA_CENT) / 100);
      ctx.strokeStyle = rgba(C.koma, 0.5); ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(X(k1), y + 12); ctx.lineTo(x0 + ((9 * K.KOMA_CENT / 100 + yari) / 12) * (x1 - x0), yw - 8); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, `en yakın Batı aralığı: ${yari} yarım ses (${yari * 100} cent), fark ${fmtNum(a * K.KOMA_CENT - yari * 100, 1)} cent`, w / 2, hh * 0.86, { size: 12, align: "center", color: C.ink2 });
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    function cal() {
      tm.clear(); calan && calan.stop();
      Snd.unlock(); Klarnet.hazirla();
      const n = [{ f: D.perdeHz(9), t: 0, d: 0.7, k: 9 }, { f: D.perdeHz(9 + a), t: 0.8, d: 0.9, k: 9 + a }];
      calan = Klarnet.ezgi(n, { onNota: (i) => { isik = i; tm.set(() => (isik = -1), 800); } });
    }
    ctl.append(seg(ARALIKLAR, a, (k) => { a = k; cal(); }, "Aralık"),
      h("button.btn", { type: "button", onclick: () => {
        tm.clear(); calan && calan.stop(); Snd.unlock(); Klarnet.hazirla();
        const n = [[9, 0], [17, 0.65], [9, 1.5], [18, 2.15]].map(([k, t]) => ({ f: D.perdeHz(k), t, d: 0.55 }));
        calan = Klarnet.ezgi(n);
      } }, "▶ 8 ile 9 koma"));
    return { enter() { lp.start(); }, leave() { lp.stop(); tm.clear(); calan && calan.stop(); } };
  };
  G.koma = [{ click: "=8 büyük mücennep" }, { wait: 1800 }, { click: "=9 tanini" }, { wait: 1800 }, { click: "▶ 8 ile 9 koma" }];

  /* ================= Perdeler ve adları ================= */
  Demos.perdeler = (stage) => {
    const ikili = h("div.ikili.ters");
    const kcYer = h("div.kc-yer");
    const { fill, cv } = (() => { const f = h("div.fill"); const c = h("canvas", { role: "img", "aria-label": "Perde ızgarası: Yegâh'tan Muhayyer'e" }); f.append(c); return { fill: f, cv: c }; })();
    ikili.append(fill, kcYer);
    const bilgi = h("div.tc-bilgi.pr-bilgi");
    stage.append(ikili, bilgi);
    const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: false });
    const PER = Cizim.perdeListesi(-22, 62);
    let sec = 9, st, geoS = null;
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x = Math.max(130, w * 0.36);
      geoS = Cizim.izgara(ctx, { x, y0: 16, y1: hh - 16, kAlt: -22, kUst: 62, sag: w - x - 20, bati: true, dar: w < 420,
        perdeler: PER.map((p) => ({ ...p, isik: p.koma === sec })) });
    }
    st = canvas(cv, draw);
    function secim(k, ses) {
      sec = k; draw();
      const p = K.perdeKoma(k), y = K.perdeYazili(k);
      kc.goster(y.midi, { sessiz: true });
      if (ses) D.perdeCal(k, 0.8);
      const yon = Math.abs(y.sapma) < 6 ? "dudak nötr" : y.sapma < 0 ? `dudakla <b class="c-koma">${fmtNum(Math.abs(y.sapma))} cent pesleştir</b>` : `dudakla <b class="c-koma">${fmtNum(y.sapma)} cent tizleştir</b>`;
      bilgi.innerHTML = `<b>${p.ad}</b><p>Rast'tan ${k} koma · portede ${D.yazimHTML(k, 17)} · klarnette yazılı ${K.notaAdi(y.midi)} pozisyonu, ${yon}. Bolahenkte ${fmtHz(D.perdeHz(k))}.</p>`;
    }
    cv.addEventListener("click", (e) => {
      if (!geoS) return;
      const r = cv.getBoundingClientRect();
      const k = geoS.kOf(e.clientY - r.top);
      let best = null; PER.forEach((p) => { const d = Math.abs(p.koma - k); if (!best || d < best.d) best = { k: p.koma, d }; });
      if (best && best.d < 3) { Snd.unlock(); secim(best.k, true); }
    });
    secim(17, false);
    return { leave() { kc.ufle(false); } };
  };
  G.perdeler = [{ tap: "css:.fill canvas", at: [0.4, 0.5] }, { wait: 900 }, { tap: "css:.fill canvas", at: [0.4, 0.33] }];

  /* ================= Koma perdeleri klarnette ================= */
  // Segâh: AEU'da Rast'tan 17 koma; SymbTr uşşakta çoğunlukla 16 koma yazar
  Demos.komaklarnet = (stage) => {
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const { fill, cv } = (() => { const f = h("div.fill"); const c = h("canvas", { role: "img", "aria-label": "Segâh çevresinde perde ızgarası ve canlı iz" }); f.append(c); return { fill: f, cv: c }; })();
    ikili.append(kcYer, fill);
    const ust = h("div.controls.top");
    const ctl = h("div.controls");
    stage.append(ust, ikili, ctl);
    const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: false, salt: true });
    let yol = "dudak", v = null, st, iz = [], t0 = performance.now(), dudak = 0.5, yarim = 0;
    const ADIM = { dudak: { m: 71, f: null }, yarim: { m: 59 }, alt: { m: 71 } };
    const BZ = () => K.yaziliFrekans(71, "sol"); // yazılı Si4
    // anlık hedef frekans ve klarnet pozisyonu
    function durum() {
      if (yol === "dudak") return { f: BZ(), poz: "R T L1 L2 L3 LE R1 R2 R3 RF", not: "Si4 pozisyonu; perde dudakla ayarlanır" };
      if (yol === "yarim") { const c = -yarim * 90; return { f: K.yaziliFrekans(59, "sol") * Math.pow(2, c / 1200), poz: `T L1 L2 L3 R1 R2${yarim > 0.02 ? "/2" : ""}`.replace("R2/2", yarim > 0.02 ? "R2/2" : ""), oktav: -1, not: "Kaba segâh (Si3): sağ el 2. delik kısmen kapalı" }; }
      return { f: BZ() * Math.pow(2, -50 / 1200), poz: "S1", not: "WFG çeyrek ses pozisyonu (Si4 −50 cent): yalnızca sağ yan 1. anahtar" };
    }
    const sDudak = slider({ label: "Dudak", min: 0, max: 1, step: 0.01, value: 0.5, fmt: (x) => (x < 0.5 ? "gevşek" : x > 0.5 ? "sıkı" : "nötr"), oninput: (x) => { dudak = x; v && v.set("dudak", x, 0.03); } });
    const sYarim = slider({ label: "Yarım delik", min: 0, max: 1, step: 0.01, value: 0, fmt: (x) => "%" + fmtNum(x * 100), oninput: (x) => { yarim = x; uygula(); } });
    const yolSeg = seg([["dudak", "1. Dudak"], ["yarim", "2. Yarım delik"], ["alt", "3. Alternatif pozisyon"]], yol, (k) => { yol = k; uygula(); }, "Yöntem");
    const ufle = h("button.btn.primary", { type: "button", onclick: () => (v ? kapat() : ac()) }, "▶ Üfle");
    const notEl = h("span.mute.kk-not");
    ust.append(yolSeg);
    ctl.append(ufle, sDudak, sYarim, notEl);
    function uygula() {
      const d = durum();
      sDudak.style.display = yol === "dudak" ? "" : "none";
      sYarim.style.display = yol === "yarim" ? "" : "none";
      kc.goster(yol === "yarim" ? { T: 1, L1: 1, L2: 1, L3: 1, R1: 1, ...(yarim > 0.02 ? { R2: 0.5 } : {}) } : d.poz, { sessiz: true });
      notEl.innerHTML = d.not + (yol === "alt" ? ' <span class="dogrula">doğrulanmalı</span>' : "");
      if (v) { v.set("frekans", d.f, 0.02); v.set("dudak", yol === "dudak" ? dudak : 0.5, 0.03); }
    }
    function ac() { Snd.unlock(); Klarnet.hazirla(); const d = durum(); v = Klarnet.ses({ frekans: d.f, dudak: yol === "dudak" ? dudak : 0.5 }); if (!v) return; Snd.own(v); v.ufle(0.74); ufle.textContent = "■ Durdur"; izle = sesIzle(v.out, (o) => { if (o.f) { iz.push([(o.t - t0) / 1000, o.f]); if (iz.length > 600) iz.shift(); } }); }
    let izle = null;
    function kapat() { if (izle) { izle(); izle = null; } if (v) v.stop(); v = null; ufle.textContent = "▶ Üfle"; }
    // ızgara: Rast'tan koma (bolahenk değil, yazılı perde düzeyinde): f → koma = 53·log2(f / f(yazılı Sol4))
    const PER = Cizim.perdeListesi(5, 27, { ana: false }).filter((p) => [9, 13, 14, 17, 18, 22, 26, 27, 8, 5].includes(p.koma));
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x = Math.max(110, w * 0.3), x1 = w - 20;
      const g = Cizim.izgara(ctx, { x, y0: 20, y1: hh - 24, kAlt: 6, kUst: 25, sag: x1 - x, bati: true, dar: w < 420,
        perdeler: PER.map((p) => ({ ...p, rol: p.koma === 17 ? "koma" : null, isik: p.koma === 17 })) });
      // SymbTr uşşak segâhı (16 koma)
      const y16 = g.yOf(16);
      ctx.strokeStyle = rgba(C.koma, 0.6); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x + 8, y16); ctx.lineTo(x1, y16); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "uşşaktaki segâh (SymbTr, 16 koma)", x1, y16 - 5, { size: 11, color: C.koma, align: "right" });
      // eşit tamperamanlı Si (yazılı)
      const ySi = g.yOf(400 / K.KOMA_CENT);
      ctx.strokeStyle = rgba(C.ink, 0.35); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(x + 8, ySi); ctx.lineTo(x1, ySi); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "eşit tamperamanlı Si", x1, ySi - 5, { size: 11, color: C.ink2, align: "right" });
      // canlı iz: son 6 saniye
      if (iz.length > 1) {
        const tNow = (performance.now() - t0) / 1000;
        const ref = K.yaziliFrekans(67, "sol");
        const X = (t) => x1 - ((tNow - t) / 6) * (x1 - x - 20);
        ctx.strokeStyle = C.durak; ctx.lineWidth = 2.2; ctx.beginPath();
        let ilk = true;
        iz.forEach(([t, f], i) => {
          if (t < tNow - 6) return;
          let k = 53 * Math.log2(f / ref); while (k < 0) k += 53; while (k >= 53) k -= 53;
          const y = g.yOf(clamp(k, 6, 25));
          if (i && t - iz[i - 1][0] > 0.2) ilk = true;
          ilk ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); ilk = false;
        });
        ctx.stroke();
        const [, fs] = iz[iz.length - 1];
        let ks = 53 * Math.log2(fs / ref); while (ks < 0) ks += 53; while (ks >= 53) ks -= 53;
        text(ctx, `şu an: Rast'tan ${fmtNum(ks, 1)} koma`, x + 16, 16, { size: 12, color: C.durak, weight: 700 });
      }
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    uygula();
    return { enter() { lp.start(); }, leave() { lp.stop(); kapat(); } };
  };
  G["koma-klarnette"] = [{ click: "▶ Üfle" }, { slide: "label:Dudak", to: 0.36 }, { wait: 1000 }, { click: "=3. Alternatif pozisyon" }, { wait: 1500 }, { click: "■ Durdur" }];

  /* ================= Koma akort aleti ================= */
  Demos.akort = (stage) => {
    const ust = h("div.controls.top");
    const { cv } = D.tuval(stage, "Akort aleti: en yakın perde ve sapma");
    const alt = h("div.controls");
    stage.prepend(ust); stage.append(alt);
    let ahenk = D.ahenk(), tur = D.tur(), son = null, sonT = 0, st, deneme = null, abone = null, izleD = null;
    const aSel = h("select", { "aria-label": "Ahenk", onchange: (e) => { ahenk = e.target.value; L.store.set("ahenk", ahenk); } }, Object.entries(K.AHENKLER).map(([id, a]) => h("option", { value: id, selected: id === ahenk ? "" : null }, a.ad + (a.dogrula ? " (doğrulanmalı)" : ""))));
    const tSel = h("select", { "aria-label": "Klarnet", onchange: (e) => { tur = e.target.value; L.store.set("tur", tur); } }, Object.entries(K.KLARNETLER).map(([id, k]) => h("option", { value: id, selected: id === tur ? "" : null }, k.ad)));
    const mik = Mikrofon.dugme({ onAcik: (a) => { if (a) dinle(); } });
    const denemeBtn = h("button.btn", { type: "button", onclick: () => (deneme ? denemeDur() : denemeCal()) }, "▶ Deneme sesi");
    ust.append(mik, h("label", "Ahenk", aSel), h("label", "Klarnet", tSel));
    alt.append(denemeBtn, h("span.mute", "A4 = 440 Hz"));
    const ANA = K.PERDELER.filter((p) => K.anaMi(p));
    function olcum(o) {
      if (!o.f) return;
      const r = K.enYakinPerde(o.f, { ahenk, kume: ANA });
      const n = K.enYakinNota(o.f, tur);
      son = { ...r, nota: n, f: o.f }; sonT = performance.now();
    }
    function dinle() { if (abone) abone(); abone = Mikrofon.dinle(olcum); }
    function denemeCal() {
      Snd.unlock(); Klarnet.hazirla();
      // Segâh çevresinde gezinen ses: yazılı Si4 pozisyonu, dudakla aşağı yukarı
      const v = Klarnet.ses({ frekans: K.yaziliFrekans(71, "sol") });
      if (!v) return; Snd.own(v);
      const c = Snd.ctx, t = c.currentTime + 0.05;
      v.ufle(0.74, t);
      v.p.sent.setValueAtTime(10, t); v.p.sent.linearRampToValueAtTime(-60, t + 4); v.p.sent.linearRampToValueAtTime(5, t + 8);
      v.sus(t + 8.2);
      izleD = sesIzle(v.out, olcum);
      const id = setTimeout(denemeDur, 8600);
      deneme = { stop() { clearTimeout(id); v.stop(); } };
      denemeBtn.textContent = "■ Durdur";
    }
    function denemeDur() { if (izleD) { izleD(); izleD = null; } if (deneme) deneme.stop(); deneme = null; denemeBtn.textContent = "▶ Deneme sesi"; }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const taze = son && performance.now() - sonT < 600;
      const cx = w * (w > 640 ? 0.42 : 0.5), cy = hh * 0.62, R = Math.min(w * 0.36, hh * 0.5);
      // kadran: ±1,5 koma
      ctx.strokeStyle = rgba(C.ink, 0.2); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      for (let k = -1.5; k <= 1.501; k += 0.25) {
        const a = -Math.PI / 2 + (k / 1.5) * (Math.PI * 0.35);
        const big = Math.abs(k * 2 - Math.round(k * 2)) < 0.01 && Math.abs(k % 0.5) < 0.01;
        ctx.strokeStyle = Math.abs(k) < 0.01 ? C.guclu : rgba(C.ink, big ? 0.5 : 0.2);
        ctx.lineWidth = Math.abs(k) < 0.01 ? 3 : 1.2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.lineTo(cx + Math.cos(a) * (R - (big ? 16 : 8)), cy + Math.sin(a) * (R - (big ? 16 : 8))); ctx.stroke();
        if (big && Math.abs(k) > 0.01) text(ctx, (k > 0 ? "+" : "−") + fmtNum(Math.abs(k), 1), cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16) + 4, { size: 11, align: "center", color: C.muted });
      }
      text(ctx, "koma", cx, cy - R - 22, { size: 11, align: "center", color: C.muted });
      // yeşil bölge ±0,25 koma
      ctx.strokeStyle = rgba(C.guclu, 0.25); ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(cx, cy, R - 8, -Math.PI / 2 - (0.25 / 1.5) * Math.PI * 0.35, -Math.PI / 2 + (0.25 / 1.5) * Math.PI * 0.35); ctx.stroke();
      if (son) {
        const k = clamp(son.komaSapma, -1.5, 1.5);
        const a = -Math.PI / 2 + (k / 1.5) * (Math.PI * 0.35);
        ctx.globalAlpha = taze ? 1 : 0.35;
        ctx.strokeStyle = Math.abs(son.komaSapma) < 0.25 ? C.guclu : C.durak; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (R - 20), cy + Math.sin(a) * (R - 20)); ctx.stroke();
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
        text(ctx, son.perde.ad, cx, cy + 46, { size: Math.min(44, w * 0.08), align: "center", color: C.ink, font: FONT.display, weight: 400 });
        text(ctx, `${son.komaSapma >= 0 ? "+" : "−"}${fmtNum(Math.abs(son.komaSapma), 2)} koma · ${son.centSapma >= 0 ? "+" : "−"}${fmtNum(Math.abs(son.centSapma), 1)} cent · ${fmtHz(son.f)}`, cx, cy + 74, { size: 13, align: "center", color: C.ink2 });
        text(ctx, `${K.KLARNETLER[tur].ad}: yazılı ${K.notaAdi(son.nota.yazili)} ${son.nota.cent >= 0 ? "+" : "−"}${fmtNum(Math.abs(son.nota.cent))} cent`, cx, cy + 96, { size: 12, align: "center", color: C.muted });
        ctx.globalAlpha = 1;
        // yan şerit: yakın perdeler
        if (w > 640) {
          const x = w * 0.84, k0 = son.perde.koma;
          const g = Cizim.izgara(ctx, { x, y0: 30, y1: hh - 30, kAlt: k0 - 9, kUst: k0 + 9, perdeler: Cizim.perdeListesi(k0 - 9, k0 + 9).map((p) => ({ ...p, isik: p.koma === k0 })), dar: true });
          const yk = g.yOf(clamp(son.koma, k0 - 9, k0 + 9));
          ctx.fillStyle = Math.abs(son.komaSapma) < 0.25 ? C.guclu : C.durak;
          ctx.beginPath(); ctx.moveTo(x + 12, yk); ctx.lineTo(x + 24, yk - 6); ctx.lineTo(x + 24, yk + 6); ctx.fill();
        }
      } else {
        text(ctx, "Mikrofonu açıp bir nota çalın", cx, cy + 40, { size: 15, align: "center", color: C.muted });
      }
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    return { enter() { lp.start(); if (Mikrofon.acik) dinle(); }, leave() { lp.stop(); if (abone) { abone(); abone = null; } denemeDur(); } };
  };
  G.akort = [{ click: "▶ Deneme sesi" }];
})();
