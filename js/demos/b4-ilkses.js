/* 4. bölüm: İlk ses — ağız yapısı, nefes haritası, dil vuruşu, uzun ses */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp, lerp } = L;
  const G = window.GuideScenarios;
  const SOL4 = () => K.yaziliFrekans(67, "sol");

  /* ================= Ağız yapısı ================= */
  const AGIZ = [
    { id: "gevsek", ad: "Çok gevşek", dudak: 0.03, nefes: 0.95, metin: "Dudak kamışı tutmuyor: hava kaçar, kamış titreşmez. Yalnızca hava sesi.", rol: "yeden" },
    { id: "dengeli", ad: "Dengeli", dudak: 0.5, nefes: 0.76, metin: "Dudak kamışı hafifçe destekler, ağız köşeleri sıkı. Ses dolgun ve kararlı.", rol: "guclu" },
    { id: "siki", ad: "Çok sıkı", dudak: 0.96, nefes: 1.0, metin: "Dudak kamışı ezer: kamış üst titreşime sıçrar. Kaz sesi (cıyaklama).", rol: "yeden" },
    { id: "azNefes", ad: "Nefes yetersiz", dudak: 0.5, nefes: 0.42, metin: "Ağız doğru ama nefes desteği yok: kamış eşiği geçemez.", rol: "yeden" },
  ];
  Demos.agiz = (stage) => {
    const { cv } = D.tuval(stage, "Ağızlık, dudak ve dişlerin stilize kesiti");
    const bilgi = h("div.tc-bilgi");
    const ctl = h("div.controls");
    stage.append(bilgi, ctl);
    let sec = AGIZ[1], st, calan = null, t = 0;
    function draw(dt = 0) {
      if (!st || !st.w) return;
      t += dt;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const cx = w * 0.46, cy = hh * 0.5, S = Math.min(w / 520, hh / 300);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(S, S);
      // ağızlık (sağa doğru uzanır), uç solda
      ctx.fillStyle = "#0d090b"; ctx.strokeStyle = rgba(C.silver, 0.45); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-150, -6); ctx.quadraticCurveTo(-160, 0, -150, 8); ctx.lineTo(220, 26); ctx.lineTo(220, -34); ctx.lineTo(-40, -28); ctx.closePath(); ctx.fill(); ctx.stroke();
      // kamış (altta)
      const ez = sec.dudak; // dudak baskısı kamışı ağızlığa iter
      const acik = lerp(9, 1.5, ez);
      const titre = calan && sec.id === "dengeli" ? Math.sin(t * 70) * 1.5 : calan && sec.id === "siki" ? Math.sin(t * 160) * 0.7 : 0;
      ctx.strokeStyle = "#cbb88f"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-148, 8 + acik + titre); ctx.quadraticCurveTo(-40, 16 + acik * 0.4, 60, 28); ctx.lineTo(200, 30); ctx.stroke();
      // üst dişler ve üst dudak
      ctx.fillStyle = "#e8e2d6"; ctx.beginPath(); ctx.roundRect(-118, -30, 30, 18, 4); ctx.fill();
      ctx.fillStyle = "#8a4a52"; ctx.beginPath(); ctx.ellipse(-112, -40, 46, 14, 0, 0, 7); ctx.fill();
      // alt dudak (dişlerin üzerine kıvrılmış yastık): baskı arttıkça basıklaşır
      const ky = lerp(12, 6, ez);
      ctx.fillStyle = "#9b555e"; ctx.beginPath(); ctx.ellipse(-110, 20 + acik + ky, 40, ky + 6, 0, 0, 7); ctx.fill();
      ctx.fillStyle = "#e8e2d6"; ctx.beginPath(); ctx.roundRect(-126, 26 + acik + ky * 1.6, 28, 16, 4); ctx.fill();
      // hava
      if (calan) {
        ctx.strokeStyle = rgba(C.ink, 0.35); ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) { const x = -230 + ((t * 160 + i * 25) % 90); ctx.beginPath(); ctx.moveTo(x, 2 + i * 2); ctx.lineTo(x + 18, 2 + i * 2); ctx.stroke(); }
      }
      ctx.restore();
      text(ctx, "üst dişler", cx - 104 * S, cy - 64 * S, { size: 11, color: C.muted, align: "center" });
      text(ctx, "alt dudak yastığı", cx - 110 * S, cy + 70 * S, { size: 11, color: C.muted, align: "center" });
      text(ctx, "kamış", cx + 120 * S, cy + 50 * S, { size: 11, color: "#cbb88f" });
    }
    const lp = loop((dt) => draw(dt));
    st = canvas(cv, () => draw());
    function sec_(o) {
      sec = o;
      bilgi.innerHTML = ""; bilgi.append(h("b", o.ad), h("p", o.metin));
      cal();
    }
    function cal() {
      if (calan) calan.stop();
      Snd.unlock(); Klarnet.hazirla();
      calan = Klarnet.ezgi([{ f: SOL4(), t: 0, d: 1.6 }], { nefes: sec.nefes, dudak: sec.dudak, onBitti: () => { calan = null; } });
    }
    ctl.append(seg(AGIZ.map((o) => [o.id, o.ad]), "dengeli", (id) => sec_(AGIZ.find((o) => o.id === id)), "Ağız yapısı"), h("button.btn", { type: "button", onclick: cal }, "▶ Yeniden üfle"));
    bilgi.append(h("b", sec.ad), h("p", sec.metin));
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); } };
  };
  G["agiz-yapisi"] = [{ click: "=Çok gevşek" }, { wait: 1800 }, { click: "=Dengeli" }, { wait: 1800 }, { click: "=Çok sıkı" }];

  /* ================= Nefes × dudak haritası ================= */
  Demos.nefes = (stage) => {
    const { cv } = D.tuval(stage, "Nefes ve dudak haritası: sessiz bölge, güzel ses, kaz sesi");
    const ctl = h("div.controls");
    stage.append(ctl);
    const M = window.NEFES_HARITA;
    let p = { nefes: 0.75, dudak: 0.5 }, v = null, st, img = null;
    const oku = h("span.readout");
    const ufle = h("button.btn.primary", { type: "button", onclick: () => (v ? kapat() : ac()) }, "▶ Üfle");
    ctl.append(ufle, h("span.spacer"), oku);
    function ac() { Snd.unlock(); Klarnet.hazirla(); v = Klarnet.ses({ frekans: SOL4(), dudak: p.dudak }); if (v) { Snd.own(v); v.ufle(p.nefes); ufle.textContent = "■ Durdur"; } }
    function kapat() { if (v) v.stop(); v = null; ufle.textContent = "▶ Üfle"; }
    const geo = () => { const { w, h: hh } = st; const x0 = 64, x1 = w - 24, y0 = 24, y1 = hh - 54; return { w, hh, x0, x1, y0, y1, X: (b) => x0 + ((b - 0.2) / 1.1) * (x1 - x0), Y: (l) => y1 - l * (y1 - y0) }; };
    function bolge(b, l) {
      const i = clamp(Math.round((b - 0.2) / 0.05), 0, M.nefes.length - 1), j = clamp(Math.round(l / 0.05), 0, M.dudak.length - 1);
      const r = M.rms[j][i], c = M.cent[j][i];
      if (c == null || r < 0.03) return { ad: "Sessiz: yalnızca hava sesi", tur: "sessiz", c: null };
      if (c > 1000) return { ad: "Kaz sesi: kamış üst titreşime sıçradı", tur: "kaz", c };
      return { ad: "Ses var", tur: "ses", c, r };
    }
    function boyaHarita() {
      const g = geo();
      const W = Math.max(1, Math.round(g.x1 - g.x0)), H = Math.max(1, Math.round(g.y1 - g.y0));
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d"), id = o.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const b = 0.2 + (x / W) * 1.1, l = 1 - y / H;
        const fi = clamp((b - 0.2) / 0.05, 0, M.nefes.length - 1.001), fj = clamp(l / 0.05, 0, M.dudak.length - 1.001);
        const i = Math.floor(fi), j = Math.floor(fj), u = fi - i, w2 = fj - j;
        const R = (jj, ii) => M.rms[jj][ii];
        const r = (R(j, i) * (1 - u) + R(j, i + 1) * u) * (1 - w2) + (R(j + 1, i) * (1 - u) + R(j + 1, i + 1) * u) * w2;
        const c = M.cent[Math.round(fj)][Math.round(fi)];
        let col;
        if (c != null && c > 1000) col = [217, 80, 95];
        else if (r > 0.03 && c != null) { const k = clamp(r / 0.6, 0, 1); col = [lerp(60, 93, k), lerp(70, 184, k), lerp(64, 160, k)]; }
        else col = [42, 33, 38];
        const a = (y * W + x) * 4; id.data[a] = col[0]; id.data[a + 1] = col[1]; id.data[a + 2] = col[2]; id.data[a + 3] = 255;
      }
      o.putImageData(id, 0, 0);
      img = off;
    }
    function draw() {
      if (!st || !st.w) return;
      const g = geo(), ctx = st.ctx;
      ctx.clearRect(0, 0, g.w, g.hh);
      if (!img || img.width !== Math.round(g.x1 - g.x0)) boyaHarita();
      ctx.globalAlpha = 0.85; ctx.drawImage(img, g.x0, g.y0); ctx.globalAlpha = 1;
      // perde eş-sapma çizgileri: ±20 cent bölgeleri yazı olarak
      text(ctx, "Güzel ses bölgesi", g.X(0.78), g.Y(0.62), { size: 13, color: C.ink, weight: 700, align: "center" });
      text(ctx, "Kaz sesi", g.X(1.12), g.Y(0.95), { size: 12, color: C.ink, weight: 700, align: "center" });
      text(ctx, "Sessiz", g.X(0.33), g.Y(0.5), { size: 12, color: C.muted, weight: 700, align: "center" });
      // eksenler
      ctx.strokeStyle = rgba(C.ink, 0.35); ctx.lineWidth = 1; ctx.strokeRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
      text(ctx, "nefes basıncı →", (g.x0 + g.x1) / 2, g.y1 + 22, { size: 12, align: "center", color: C.ink2 });
      ctx.save(); ctx.translate(g.x0 - 16, (g.y0 + g.y1) / 2); ctx.rotate(-Math.PI / 2); text(ctx, "dudak baskısı →", 0, 0, { size: 12, align: "center", color: C.ink2 }); ctx.restore();
      text(ctx, "gevşek", g.x0 - 6, g.y1 - 2, { size: 10, align: "right", color: C.muted });
      text(ctx, "sıkı", g.x0 - 6, g.y0 + 10, { size: 10, align: "right", color: C.muted });
      // nokta
      const x = g.X(p.nefes), y = g.Y(p.dudak), b = bolge(p.nefes, p.dudak);
      ctx.save(); ctx.shadowColor = C.durak; ctx.shadowBlur = 14; ctx.fillStyle = C.durak; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.stroke();
      oku.innerHTML = `<b>${b.ad}</b>` + (b.tur === "ses" ? ` · perde ${b.c >= 0 ? "+" : "−"}${fmtNum(Math.abs(b.c))} cent` : "");
    }
    st = canvas(cv, () => { img = null; draw(); });
    let surukle = false;
    function at(e) {
      const r = cv.getBoundingClientRect(), g = geo();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      p.nefes = clamp(0.2 + ((x - g.x0) / (g.x1 - g.x0)) * 1.1, 0.2, 1.3);
      p.dudak = clamp((g.y1 - y) / (g.y1 - g.y0), 0, 1);
      if (!v) ac();
      if (v) { v.set("nefes", p.nefes, 0.03); v.set("dudak", p.dudak, 0.03); }
      draw();
    }
    cv.addEventListener("pointerdown", (e) => { surukle = true; cv.setPointerCapture(e.pointerId); at(e); });
    cv.addEventListener("pointermove", (e) => { if (surukle) at(e); });
    cv.addEventListener("pointerup", () => { surukle = false; });
    cv.style.touchAction = "none";
    return { leave() { kapat(); } };
  };
  G.nefes = [{ drag: "css:.fill canvas", path: [[0.5, 0.5], [0.25, 0.5], [0.55, 0.45], [0.85, 0.12]], speed: 4, pause: 500 }];

  /* ================= Dil vuruşu ================= */
  const DIL_EZGI = [[9, 1], [17, 1], [22, 1], [31, 1], [22, 1], [17, 1], [9, 2]];
  const DILLER = [
    { id: "tu", ad: "Tu", dip: 0, uz: 0.93 },
    { id: "du", ad: "Du", dip: 0.4, uz: 0.97 },
    { id: "legato", ad: "Legato", dip: null, uz: 1 },
    { id: "staccato", ad: "Staccato", dip: 0, uz: 0.45 },
  ];
  Demos.dil = (stage) => {
    const { cv } = D.tuval(stage, "Nefes basıncı zarfı");
    const ctl = h("div.controls");
    stage.append(ctl);
    let sec = DILLER[0], st, t0 = 0, calan = null, n = [];
    const tempo = 112, b = 60 / tempo;
    function plan() {
      let t = 0;
      n = DIL_EZGI.map(([k, v]) => { const o = { k, t, d: v * b }; t += v * b; return o; });
    }
    // zarf: zaman → nefes (görsel; çalınan sesle aynı kural)
    function zarf(t) {
      const N = 0.75;
      for (let i = 0; i < n.length; i++) {
        const o = n[i];
        if (t >= o.t && t < o.t + o.d) {
          const u = t - o.t;
          const son = o.d * sec.uz;
          if (u > son) return i === n.length - 1 || sec.dip !== null ? 0 : N;
          if (sec.dip === null) return i === 0 ? N * Math.min(1, u / 0.02) : N;
          const atak = Math.min(1, u / 0.03);
          return sec.dip + (N - sec.dip) * atak;
        }
      }
      return 0;
    }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = 40, x1 = w - 30, y0 = hh * 0.2, y1 = hh * 0.78;
      const T = n.length ? n[n.length - 1].t + n[n.length - 1].d + 0.2 : 1;
      const X = (t) => x0 + (t / T) * (x1 - x0), Y = (v) => y1 - (v / 0.9) * (y1 - y0);
      ctx.strokeStyle = rgba(C.ink, 0.15); ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      const now = calan ? Snd.now() - t0 : T;
      ctx.fillStyle = rgba(C.guclu, 0.18); ctx.strokeStyle = C.guclu; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(X(0), Y(0));
      for (let i = 0; i <= 600; i++) { const t = (i / 600) * T; ctx.lineTo(X(t), Y(zarf(t))); }
      ctx.lineTo(X(T), Y(0)); ctx.closePath(); ctx.fill();
      ctx.beginPath(); for (let i = 0; i <= 600; i++) { const t = (i / 600) * T; i ? ctx.lineTo(X(t), Y(zarf(t))) : ctx.moveTo(X(t), Y(zarf(t))); } ctx.stroke();
      n.forEach((o) => text(ctx, D.perdeAdi(o.k), X(o.t + o.d / 2), y1 + 18, { size: 11, align: "center", color: C.ink2 }));
      if (calan && now < T) { ctx.strokeStyle = C.durak; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(now), y0 - 10); ctx.lineTo(X(now), y1); ctx.stroke(); }
      text(ctx, "nefes basıncı", x0, y0 - 12, { size: 11, color: C.muted });
      text(ctx, sec.ad === "Legato" ? "dil vurulmaz: notalar bağlı" : sec.ad === "Staccato" ? "kısa ve ayrık" : sec.ad === "Tu" ? "derin ve kısa dil vuruşu" : "sığ, yumuşak dil vuruşu", x1, y0 - 12, { size: 12, color: C.ink, weight: 600, align: "right" });
    }
    function cal() {
      if (calan) calan.stop();
      Snd.unlock(); Klarnet.hazirla();
      plan();
      const v = Klarnet.ses({ frekans: D.perdeHz(n[0].k) });
      if (!v) return;
      const P = v.p, c = Snd.ctx;
      t0 = c.currentTime + 0.08;
      P.nefes.setValueAtTime(0, c.currentTime);
      n.forEach((o, i) => {
        const t = t0 + o.t;
        P.frekans.setValueAtTime(D.perdeHz(o.k), t);
        if (sec.dip === null) { if (i === 0) P.nefes.setTargetAtTime(0.75, t, 0.01); }
        else { P.nefes.setTargetAtTime(sec.dip, t - 0.02, 0.005); P.nefes.setTargetAtTime(0.75, t, 0.01); }
        if (sec.uz < 1) P.nefes.setTargetAtTime(sec.dip === null ? 0.75 : 0, t + o.d * sec.uz, 0.012);
      });
      const T = n[n.length - 1].t + n[n.length - 1].d;
      P.nefes.setTargetAtTime(0, t0 + T, 0.03);
      const id = setTimeout(() => { v.stop(); calan = null; }, (T + 0.4) * 1000);
      calan = { stop() { clearTimeout(id); v.stop(); calan = null; } };
      Snd.own(calan);
    }
    plan();
    const lp = loop(draw);
    st = canvas(cv, draw);
    ctl.append(seg(DILLER.map((o) => [o.id, o.ad]), "tu", (id) => { sec = DILLER.find((o) => o.id === id); cal(); }, "Dil vuruşu"), h("button.btn.primary", { type: "button", onclick: cal }, "▶ Çal"));
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); } };
  };
  G.dil = [{ click: "=Tu" }, { wait: 2600 }, { click: "=Legato" }, { wait: 2600 }, { click: "=Staccato" }];

  /* ================= Uzun ses ================= */
  // perde izi çözümleyici: [zaman (s), cent] dizisi → ortalama, kararlılık, vibrato
  function cozumle(iz, pencere = 4) {
    if (iz.length < 10) return null;
    const tSon = iz[iz.length - 1][0];
    const p = iz.filter((x) => x[0] >= tSon - pencere).map((x) => x[1]);
    if (p.length < 10) return null;
    const ort = p.reduce((a, b) => a + b, 0) / p.length;
    const sd = Math.sqrt(p.reduce((a, b) => a + (b - ort) * (b - ort), 0) / p.length);
    // vibrato: ortalamadan sapmanın sıfır geçişleri (yumuşatılmış)
    const ps = iz.filter((x) => x[0] >= tSon - pencere);
    const yum = ps.map((x, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - 1); j <= Math.min(ps.length - 1, i + 1); j++) { s += ps[j][1]; n++; } return [x[0], s / n - ort]; });
    let gec = 0;
    for (let i = 1; i < yum.length; i++) if ((yum[i - 1][1] < 0) !== (yum[i][1] < 0)) gec++;
    const sure = yum[yum.length - 1][0] - yum[0][0];
    const hiz = sure > 0 ? gec / 2 / sure : 0;
    const ust = Math.max(...yum.map((x) => x[1])), alt = Math.min(...yum.map((x) => x[1]));
    const vib = hiz > 3.5 && hiz < 9 && sd > 4 ? { hiz, genislik: ust - alt } : null;
    return { ort, sd, vib };
  }
  window.PerdeCozumle = cozumle;
  Demos.uzunses = (stage) => {
    const ust = h("div.controls.top");
    const { cv } = D.tuval(stage, "Perdenin zaman içindeki izi");
    const alt = h("div.controls");
    stage.prepend(ust); stage.append(alt);
    let iz = [], hedef = null, st, t0 = performance.now(), kaynak = null, ornek = null;
    const istat = h("div.us-istat");
    const mik = Mikrofon.dugme({ onAcik: (a) => { if (a) basla("mik"); else dur(); } });
    const ornekBtn = h("button.btn", { type: "button", onclick: () => (ornek ? dur() : ornekCal()) }, "▶ Örnek öğrenci");
    ust.append(mik, ornekBtn);
    alt.append(istat);
    let abone = null;
    function olcum(f, t) {
      if (!f) return;
      const n = K.enYakinNota(f, D.tur());
      if (!hedef || Math.abs(n.yazili - hedef) > 0 && Math.abs(1200 * Math.log2(f / K.yaziliFrekans(hedef, D.tur()))) > 70) { hedef = n.yazili; iz = []; }
      const c = 1200 * Math.log2(f / K.yaziliFrekans(hedef, D.tur()));
      iz.push([t, c]);
      while (iz.length && iz[0][0] < t - 10) iz.shift();
    }
    function basla(k) {
      dur(true);
      kaynak = k; iz = []; hedef = null; t0 = performance.now();
      abone = Mikrofon.dinle((o) => olcum(o.f, (o.t - t0) / 1000));
    }
    function dur(sessiz) {
      if (abone) { abone(); abone = null; }
      if (ornek) { ornek.stop(); ornek = null; ornekBtn.textContent = "▶ Örnek öğrenci"; }
    }
    // sentezlenmiş öğrenci: 3 s titrek, 3 s kararlı, 3 s vibratolu. Ölçüm aynı YIN hattından geçer.
    function ornekCal() {
      dur();
      Snd.unlock(); Klarnet.hazirla();
      const f = K.yaziliFrekans(64, D.tur());
      const v = Klarnet.ses({ frekans: f });
      if (!v) return;
      Snd.own(v);
      const c = Snd.ctx, t = c.currentTime + 0.05;
      v.ufle(0.74, t);
      // titrek: rastgele kaymalar
      for (let i = 0; i < 12; i++) v.p.sent.setTargetAtTime((Math.random() * 2 - 1) * 18, t + i * 0.25, 0.08);
      v.p.sent.setTargetAtTime(0, t + 3, 0.1);
      v.p.vibrato.setValueAtTime(0, t); v.p.vibrato.setValueAtTime(0, t + 6); v.p.vibrato.linearRampToValueAtTime(0.8, t + 6.4);
      v.sus(t + 9.2);
      const an = c.createAnalyser(); an.fftSize = 2048; v.out.connect(an);
      const buf = new Float32Array(2048);
      iz = []; hedef = null; t0 = performance.now();
      let raf = 0;
      const tik = () => { an.getFloatTimeDomainData(buf); const y = YIN.yin(buf, c.sampleRate, { fmin: 100, fmax: 2000 }); if (y && y.olasilik > 0.8) olcum(y.f, (performance.now() - t0) / 1000); raf = requestAnimationFrame(tik); };
      tik();
      const id = setTimeout(() => dur(), 9800);
      ornek = { stop() { cancelAnimationFrame(raf); clearTimeout(id); v.stop(); } };
      ornekBtn.textContent = "■ Durdur";
    }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = 56, x1 = w - 20, y0 = 20, y1 = hh - 30;
      const tNow = iz.length ? iz[iz.length - 1][0] : 0;
      const X = (t) => x1 - ((tNow - t) / 10) * (x1 - x0), Y = (c) => (y0 + y1) / 2 - (c / 50) * ((y1 - y0) / 2);
      ctx.fillStyle = rgba(C.guclu, 0.07); ctx.fillRect(x0, Y(10), x1 - x0, Y(-10) - Y(10));
      for (const c of [-50, -25, 0, 25, 50]) {
        ctx.strokeStyle = rgba(C.ink, c === 0 ? 0.35 : 0.1); ctx.beginPath(); ctx.moveTo(x0, Y(c)); ctx.lineTo(x1, Y(c)); ctx.stroke();
        text(ctx, (c > 0 ? "+" : c < 0 ? "−" : "±") + Math.abs(c) + " c", x0 - 8, Y(c) + 4, { size: 10, align: "right", color: C.muted });
      }
      if (iz.length > 1) {
        ctx.strokeStyle = C.durak; ctx.lineWidth = 2; ctx.beginPath();
        let ilk = true;
        for (let i = 0; i < iz.length; i++) {
          const [t, c] = iz[i];
          if (i && t - iz[i - 1][0] > 0.25) ilk = true;
          const y = Y(clamp(c, -55, 55));
          ilk ? ctx.moveTo(X(t), y) : ctx.lineTo(X(t), y); ilk = false;
        }
        ctx.stroke();
      }
      text(ctx, hedef != null ? `Hedef: yazılı ${K.notaAdi(hedef)} (${D.tur() === "sol" ? "Sol klarnet" : "Si♭ klarnet"})` : "Bir nota tutun", x0 + 6, y0 + 4, { size: 12, color: C.ink, weight: 600 });
      const r = cozumle(iz);
      istat.innerHTML = r ? `<span>Ortalama sapma <b>${r.ort >= 0 ? "+" : "−"}${fmtNum(Math.abs(r.ort), 1)} cent</b></span><span>Kararlılık <b>±${fmtNum(r.sd, 1)} cent</b></span><span>Vibrato <b>${r.vib ? fmtNum(r.vib.genislik) + " cent, " + fmtNum(r.vib.hiz, 1) + " Hz" : "yok"}</b></span>`
        : `<span class="mute">Son 4 saniyenin ölçüleri burada görünecek.</span>`;
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    return { enter() { lp.start(); if (Mikrofon.acik) basla("mik"); }, leave() { lp.stop(); dur(); } };
  };
  G["uzun-ses"] = [{ click: "▶ Örnek öğrenci" }];
})();
