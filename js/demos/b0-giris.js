/* Ortak demo yardımcıları ve kapak (0. bölüm). */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum } = L;

  /* ---- ortak yardımcılar ---- */
  const D = {};
  // sahneye tuval ekle: { fill, cv }
  D.tuval = (stage, aria, cls = "") => {
    const fill = h("div.fill" + cls);
    const cv = h("canvas", { role: "img", "aria-label": aria });
    fill.append(cv); stage.append(fill);
    return { fill, cv };
  };
  // zamanlayıcı kümesi: slayttan çıkınca hepsi iptal
  D.timers = () => {
    const ids = new Set();
    return {
      set(fn, ms) { const id = setTimeout(() => { ids.delete(id); fn(); }, ms); ids.add(id); return id; },
      clear() { ids.forEach(clearTimeout); ids.clear(); },
    };
  };
  // perde (Rast = 0 koma) frekansı: seçili ahenk; varsayılan bolahenk
  D.ahenk = () => L.store.get("ahenk", "bolahenk");
  D.tur = () => L.store.get("tur", "sol");
  D.perdeHz = (k) => K.perdeFrekans(k, D.ahenk());
  // perde → klarnette yazılı en yakın nota (MIDI) ve sapma
  D.perdeNota = (k) => K.perdeYazili(k);
  // tek bir perde çal
  D.perdeCal = (k, dur = 0.7, opts = {}) => { Klarnet.hazirla(); return Klarnet.ezgi([{ f: D.perdeHz(k), t: 0, d: dur }], { gecikme: 0.02, ...opts }); };
  // yazılı notayı (MIDI) Sol klarnette çal
  D.notaCal = (m, dur = 0.7, tur = "sol", opts = {}) => { Klarnet.hazirla(); return Klarnet.ezgi([{ f: K.yaziliFrekans(m, tur), t: 0, d: dur }], { gecikme: 0.02, ...opts }); };
  // [koma, vuruş] dizisini ezgiye çevir
  D.komaEzgi = (dizi, tempo = 90, { legato = false, ahenk } = {}) => {
    const b = 60 / tempo; let t = 0;
    return dizi.map(([k, v]) => { const n = { f: k == null ? null : K.perdeFrekans(k, ahenk || D.ahenk()), k, t, d: v * b * (legato ? 1 : 0.94), legato }; t += v * b; return n; });
  };
  // perde adı (yazım işaretiyle birlikte HTML)
  D.perdeAdi = (k) => { const p = K.perdeKoma(k); return p ? p.ad : `${k} koma`; };
  D.yazimHTML = (k, boy = 15) => { const p = K.perdeKoma(k); if (!p) return ""; return K.notaAdi(p.harfMidi).replace(/-?\d+$/, "") + (p.isaret ? Isaret.svg(p.isaret, boy) : "") + (Math.floor(p.harfMidi / 12) - 1); };
  // rol: makam içinde perdenin rolü
  D.rol = (m, k) => {
    const pk = (ad) => (K.perde(ad) || {}).koma;
    if (k === m.durakKoma || k === m.durakKoma + 53) return "durak";
    if (k === pk(m.guclu)) return "guclu";
    if (k === pk(m.yeden)) return "yeden";
    return null;
  };
  window.D = D;
  window.GuideScenarios = window.GuideScenarios || {};

  /* ================= Kapak: 78'lik plak, 53 komalık perde çemberi ================= */
  // Bu site için yazılmış kısa bir Uşşak cümlesi (sofyan, 84 vuruş/dk)
  const KAPAK_EZGI = [[9, 1], [17, 0.5], [22, 0.5], [31, 1], [31, 0.5], [40, 0.5], [44, 1], [40, 0.5], [31, 0.5], [40, 1.5], [31, 0.5],
    [22, 1], [17, 0.5], [22, 0.5], [31, 1], [22, 0.5], [17, 0.5], [9, 0.5], [17, 0.5], [22, 1], [17, 0.5], [9, 0.5], [0, 1], [9, 3]];

  Demos.kapak = (stage, slide) => {
    const { cv } = D.tuval(stage, "Taş plak: çevresinde 53 komalık perde çemberi");
    const kcHost = h("div.kapak-klarnet");
    stage.append(kcHost);
    const kc = KlarnetCiz(kcHost, { yon: "dikey", etiket: false });
    const dinle = h("button.btn.kapak-dinle", { type: "button" }, "▶ Dinle");
    stage.append(dinle);
    const PER = K.PERDELER.filter((p) => p.koma >= 0 && p.koma < 53 && K.anaMi(p));
    const ADLI = new Set(["Rast", "Dügâh", "Segâh", "Çârgâh", "Nevâ", "Hüseynî", "Acem", "Eviç", "Kürdî", "Bûselik", "Zirgüle", "Hisar"]);
    let st, aci = 0, isik = null, isikT = 0, hover = null, calan = null;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function geo() {
      const { w, h: hh } = st;
      const dar = w <= 860;
      const R = dar ? Math.min((w / 2 - 62) / 1.05, hh * 0.36) : Math.min(hh * 0.38, w * 0.25);
      const cx = dar ? w * 0.5 : w * 0.635, cy = dar ? hh * 0.45 : hh * 0.48;
      return { w, hh, dar, R, cx, cy };
    }
    const aOf = (k) => -Math.PI / 2 + (k / 53) * Math.PI * 2;
    function draw() {
      if (!st || !st.w) return;
      const g = geo(), ctx = st.ctx;
      ctx.clearRect(0, 0, g.w, g.hh);
      const { cx, cy, R } = g;
      // gölge
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 18;
      ctx.fillStyle = "#0d090b"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.restore();
      // oluklar (dönerken parlama döner)
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(aci);
      for (let r = R * 0.36; r < R * 0.985; r += 2.2) {
        const a = 0.05 + 0.035 * Math.sin(r * 0.9) * Math.sin(r * 0.13);
        ctx.strokeStyle = `rgba(236,229,218,${Math.max(0.012, a)})`; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
      }
      // gümüş parlama (iki karşılıklı yelpaze)
      const gr = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
      if (gr) {
        gr.addColorStop(0, "rgba(201,206,214,0)"); gr.addColorStop(0.08, "rgba(201,206,214,0.10)"); gr.addColorStop(0.16, "rgba(201,206,214,0)");
        gr.addColorStop(0.5, "rgba(201,206,214,0)"); gr.addColorStop(0.58, "rgba(201,206,214,0.08)"); gr.addColorStop(0.66, "rgba(201,206,214,0)"); gr.addColorStop(1, "rgba(201,206,214,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, R * 0.985, 0, 7); ctx.arc(0, 0, R * 0.36, 0, 7, true); ctx.fill();
      }
      // etiket
      ctx.fillStyle = "#3b2a31"; ctx.beginPath(); ctx.arc(0, 0, R * 0.33, 0, 7); ctx.fill();
      ctx.strokeStyle = rgba(C.durak, 0.7); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, R * 0.3, 0, 7); ctx.stroke();
      ctx.strokeStyle = rgba(C.durak, 0.35); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, R * 0.28, 0, 7); ctx.stroke();
      text(ctx, "Nefesten", 0, -R * 0.035, { size: R * 0.072, align: "center", color: C.ink, font: FONT.display, weight: 400 });
      text(ctx, "Taksime", 0, R * 0.1, { size: R * 0.072, align: "center", color: C.ink, font: FONT.display, weight: 400 });
      text(ctx, "Sol klarnet", 0, R * 0.19, { size: Math.max(10, R * 0.04), align: "center", color: rgba(C.durak, 0.9), weight: 600 });
      text(ctx, "53 koma", 0, -R * 0.16, { size: Math.max(10, R * 0.04), align: "center", color: rgba(C.ink, 0.6), weight: 500 });
      ctx.fillStyle = "#0d090b"; ctx.beginPath(); ctx.arc(0, 0, Math.max(3, R * 0.018), 0, 7); ctx.fill();
      ctx.restore();
      // 53 komalık çember (dönmez): plağın dışında
      const r0 = R * 1.05;
      for (let k = 0; k < 53; k++) {
        const a = aOf(k), on = isik === k || hover === k;
        const p = PER.find((x) => x.koma === k);
        const len = p ? (ADLI.has(p.ad) ? 14 : 9) : 5;
        ctx.strokeStyle = on ? C.durak : p ? rgba(p && K.sapanMi(k) ? C.koma : C.silver, p ? 0.75 : 0.3) : rgba(C.silver, 0.25);
        ctx.lineWidth = on ? 3 : p ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len)); ctx.stroke();
        if (p && (ADLI.has(p.ad) || on)) {
          const tr = r0 + (g.dar ? 22 : 28);
          const tx = cx + Math.cos(a) * tr, ty = cy + Math.sin(a) * tr;
          const al = Math.abs(Math.cos(a)) < 0.25 ? "center" : Math.cos(a) > 0 ? "left" : "right";
          text(ctx, p.ad, tx, ty + 4, { size: g.dar ? 10 : 12, align: al, weight: on ? 700 : 500, color: on ? C.durak : K.sapanMi(k) ? C.koma : C.ink2 });
        }
        if (on) {
          ctx.save(); ctx.shadowColor = C.durak; ctx.shadowBlur = 14; ctx.fillStyle = C.durak;
          ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (r0 - 6), cy + Math.sin(a) * (r0 - 6), 3.5, 0, 7); ctx.fill(); ctx.restore();
        }
      }
    }
    let lastT = 0;
    const lp = loop((dt) => {
      if (calan && !reduce) aci += dt * 0.55;
      if (isik != null && performance.now() > isikT) isik = null;
      draw();
    });
    st = canvas(cv, draw);

    function yerlestir() {
      if (!st || !st.w) return;
      const g = geo();
      const goster = !g.dar && g.w > 1080;
      kcHost.style.display = goster ? "" : "none";
      if (goster) {
        const hh = Math.min(g.hh * 0.86, g.R * 2.3);
        const kw = hh * 0.23;
        Object.assign(kcHost.style, { left: Math.min(g.cx + g.R * 1.05 + 70, g.w - kw - 28) + "px", top: g.cy - hh / 2 + "px", height: hh + "px", width: kw + "px" });
      }
      const by = g.dar ? g.cy + g.R + 30 : g.cy + g.R + 50;
      Object.assign(dinle.style, { left: g.cx + "px", top: Math.min(by, g.hh - 50) + "px" });
    }
    new ResizeObserver(yerlestir).observe(stage);

    function kAt(e) {
      const r = cv.getBoundingClientRect(), g = geo();
      const x = e.clientX - r.left - g.cx, y = e.clientY - r.top - g.cy;
      const d = Math.hypot(x, y);
      if (d < g.R * 0.9 || d > g.R * 1.05 + 60) return null;
      let a = Math.atan2(y, x) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
      const k = Math.round((a / (Math.PI * 2)) * 53) % 53;
      // en yakın adlı perdeye yapış
      let best = null;
      PER.forEach((p) => { const dd = Math.min(Math.abs(p.koma - k), 53 - Math.abs(p.koma - k)); if (dd <= 1 && (!best || dd < best.dd)) best = { k: p.koma, dd }; });
      return best ? best.k : null;
    }
    cv.addEventListener("pointermove", (e) => { hover = kAt(e); cv.style.cursor = hover != null ? "pointer" : ""; });
    cv.addEventListener("pointerleave", () => { hover = null; });
    cv.addEventListener("click", (e) => {
      const k = kAt(e); if (k == null) return;
      Snd.unlock();
      isik = k; isikT = performance.now() + 700;
      kc.goster(D.perdeNota(k).midi, { sessiz: true });
      D.perdeCal(k, 0.8);
    });

    function cal() {
      if (calan) { calan.stop(); calan = null; dinle.textContent = "▶ Dinle"; return; }
      Snd.unlock(); Klarnet.hazirla();
      const n = D.komaEzgi(KAPAK_EZGI, 84);
      calan = Klarnet.ezgi(n, {
        nefes: 0.72, vibrato: 0.12,
        onNota: (i, nn) => { isik = nn.k; isikT = performance.now() + nn.d * 1000 + 60; kc.goster(D.perdeNota(nn.k).midi, { sessiz: true }); },
        onBitti: () => { calan = null; dinle.textContent = "▶ Dinle"; },
      });
      if (calan) dinle.textContent = "■ Durdur";
    }
    dinle.addEventListener("click", cal);

    return {
      enter() { lp.start(); yerlestir(); },
      leave() { lp.stop(); if (calan) { calan.stop(); calan = null; dinle.textContent = "▶ Dinle"; } },
    };
  };

})();
