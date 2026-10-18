/* 9. bölüm: Bir şarkı — Gamzedeyim Devâ Bulmam (Tatyos Efendi, uşşak, sofyan)
   Nota verisi: js/data/sarki-gamzedeyim.js (SymbTr'den, CC BY-NC-SA 4.0). */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;
  const S = window.GAMZEDEYIM;
  const bolum = (ad) => S.bolumler.find((b) => b.ad === ad);
  const DIZELER = ["Gamzedeyim devâ bulmam", "Garibim bir yuva bulmam", "Kaderimdir hep çektiren", "İnlerim hiç rehâ bulmam"];
  const KISA = { "Gamzedeyim devâ bulmam": "Gamzedeyim…", "Garibim bir yuva bulmam": "Garibim…", "Kaderimdir hep çektiren": "Kaderimdir…", "İnlerim hiç rehâ bulmam": "İnlerim…", "Aranağme": "Aranağme" };
  const CARPMA = 0.07;

  /* Bölümlerden zamanlı nota listesi. tam: çarpmalar dahil. kirp: dizenin sonundaki dolgu notalarını at ("mam"/"ren" hecesinde biter) */
  function notalar(adlar, { tam = false, tempo = S.tempo, kirp = false } = {}) {
    const on6 = 60 / tempo / 4;
    const out = [];
    let t = 0;
    adlar.forEach((ad) => {
      let ns = bolum(ad).notalar;
      if (kirp) {
        const son = ns.map((n) => (n[2] || "").trim()).reduce((a, s, i) => (/^(mam|ren)$/.test(s) ? i : a), -1);
        if (son >= 0) ns = ns.slice(0, son + 1);
      }
      ns.forEach(([k, d, soz, cz]) => {
        if (cz) {
          if (!tam) return;
          const onceki = out[out.length - 1];
          if (onceki && onceki.d > CARPMA * 2.5) onceki.d -= CARPMA;
          out.push({ k, t: t - CARPMA, d: CARPMA, soz: "", cz: true, bolum: ad });
          return;
        }
        const hece = (soz || "").trim();
        out.push({ k, t, d: d * on6, soz: /^[A-ZÇĞİÖŞÜ]{2,}$/.test(hece) ? "" : hece, cz: false, bolum: ad });
        t += d * on6;
      });
    });
    return { notalar: out, sure: t };
  }
  window.GamzeNotalar = notalar;

  // perde → (ahenk, klarnet) için duyulan frekans ve çalınacak yazılı nota
  function hedef(k) {
    const f = K.perdeFrekans(k, D.ahenk());
    const yz = K.ftom(f) - K.KLARNETLER[D.tur()].aktarim;
    const m = Math.round(yz);
    return { f, midi: m, sapma: (yz - m) * 100 };
  }

  /* Akan nota satırı: oynatma çizgisi sabit, notalar sağdan sola akar. Hece altta.
     o: { liste, simdi, kAlt, kUst, renk(i), aktif, pencere } */
  function rulo(ctx, w, hh, o) {
    const x0 = Math.min(150, w * 0.26), xp = x0 + (w - x0) * 0.22, y0 = 18, y1 = hh - 40;
    const pps = (w - x0) / (o.pencere || 7);
    const X = (t) => xp + (t - o.simdi) * pps;
    // perde ızgarası (uşşak)
    const per = [0, 9, 16, 22, 31, 40, 44, 53, 62].filter((k) => k >= o.kAlt && k <= o.kUst).map((k) => {
      const p = K.perdeKoma(k);
      return { koma: k, ad: p ? p.ad : k === 16 ? "Segâh (uşşak)" : "", rol: k === 9 ? "durak" : k === 31 ? "guclu" : k === 0 ? "yeden" : null };
    });
    const g = Cizim.izgara(ctx, { x: x0 - 6, y0, y1, kAlt: o.kAlt, kUst: o.kUst, perdeler: per, sag: w - x0, dar: w < 520 });
    // notalar
    o.liste.forEach((n, i) => {
      if (n.k == null) return;
      const xa = X(n.t), xb = X(n.t + n.d);
      if (xb < x0 || xa > w) return;
      const y = g.yOf(n.k);
      ctx.fillStyle = o.renk ? o.renk(i, n) : rgba(C.ink, 0.7);
      ctx.fillRect(Math.max(x0, xa), y - (n.cz ? 2 : 4), Math.max(2, xb - Math.max(x0, xa) - 1.5), n.cz ? 4 : 8);
      if (n.soz && xa > x0) text(ctx, n.soz, xa, y1 + 22, { size: 12, color: i === o.aktif ? C.ink : C.ink2, weight: i === o.aktif ? 700 : 500 });
    });
    ctx.strokeStyle = rgba(C.durak, 0.85); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xp, y0 - 6); ctx.lineTo(xp, y1 + 6); ctx.stroke();
    return { g, X, xp };
  }

  // def ile sofyan + ezgi; dönüş: denetim nesnesi
  function birlikteCal({ adlar, tempo, tam, sesli = true, giris = 1, onBitti }) {
    Snd.unlock(); Klarnet.hazirla();
    const { notalar: ns, sure } = notalar(adlar, { tam, tempo });
    const u = usul("sofyan");
    const olcu = (60 / tempo) * 4;
    const ctl = Usul.cal(u, { tempo, saz: "def", ses: 0.75 });
    if (!ctl.start()) return null;
    const c = Snd.ctx;
    const t0 = c.currentTime + 0.06 + giris * olcu;
    const ez = sesli ? Klarnet.ezgi(ns.map((n) => ({ ...n, f: n.k == null ? null : K.perdeFrekans(n.k, D.ahenk()) })), { gecikme: 0.06 + giris * olcu, nefes: 0.72, vibrato: 0.1 }) : null;
    const bitT = setTimeout(() => { ctl.stop(); onBitti && onBitti(); }, (giris * olcu + sure + 0.5) * 1000 + 60);
    const o = {
      notalar: ns, sure, t0,
      simdi() { return c.currentTime - t0; },
      stop() { clearTimeout(bitT); ctl.stop(); ez && ez.stop(); },
    };
    Snd.own(o);
    return o;
  }

  /* ================= Eserin hikâyesi: baştan sona dinle ================= */
  Demos.gamze = (stage) => {
    const { cv } = D.tuval(stage, "Gamzedeyim: akan nota satırı ve perde ızgarası");
    const ctl = h("div.controls");
    stage.append(ctl);
    let calan = null, st;
    const etiket = h("span.readout");
    const ADLAR = ["Aranağme", DIZELER[0], DIZELER[1], DIZELER[0], DIZELER[1], DIZELER[2], DIZELER[3], DIZELER[2], DIZELER[3]];
    const sabit = notalar(ADLAR);
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const liste = calan ? calan.notalar : sabit.notalar;
      const simdi = calan ? calan.simdi() : 0;
      let aktif = -1;
      liste.forEach((n, i) => { if (simdi >= n.t && simdi < n.t + n.d) aktif = i; });
      rulo(ctx, w, hh, { liste, simdi, kAlt: -8, kUst: 64, aktif, renk: (i, n) => (i === aktif ? C.durak : n.t + n.d < simdi ? rgba(C.ink, 0.35) : rgba(C.ink, 0.8)) });
      const b = aktif >= 0 ? liste[aktif].bolum : calan ? "" : "Dinlemek için ▶";
      etiket.textContent = b;
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    const btn = h("button.btn.primary", { type: "button", onclick: () => {
      if (calan) { calan.stop(); calan = null; btn.textContent = "▶ Dinle"; return; }
      calan = birlikteCal({ adlar: ADLAR, tempo: S.tempo, tam: true, onBitti: () => { calan = null; btn.textContent = "▶ Dinle"; } });
      if (calan) btn.textContent = "■ Durdur";
    } }, "▶ Dinle");
    ctl.append(btn, etiket);
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); calan = null; btn.textContent = "▶ Dinle"; } };
  };
  G.gamzedeyim = [{ click: "▶ Dinle" }];

  /* ================= Cümle cümle öğren ================= */
  Demos.gamzeogren = (stage) => {
    const ust = h("div.controls.top.go-ust");
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const sag = h("div.fill.go-sag");
    ikili.append(kcYer, sag);
    const alt = h("div.controls");
    stage.append(ust, ikili, alt);
    let dize = L.store.get("gamze.dize", DIZELER[0]);
    let tam = L.store.get("gamze.tam", false);
    let tol = L.store.get("gamze.tol", 30);
    let liste = [], idx = 0, aktif = false, dinleyen = null, abone = null;
    let iyiBas = 0, bosluk = true, sonDogru = -1, calan = null;
    const tasYer = h("div.go-taslar", { "aria-live": "polite" });
    const hedefEl = h("div.go-hedef");
    const ibreCv = h("canvas.go-ibre", { role: "img", "aria-label": "Hedeften sapma" });
    sag.append(hedefEl, h("div.go-ibre-yer", ibreCv), tasYer);
    let ibreSt = null, olcum = null;
    const kc = KlarnetCiz(kcYer, {
      yon: "dikey", etiket: true,
      onUfle: (on, th) => { if (on && aktif && !Mikrofon.acik) { const n = liste[idx]; if (n && th.midi === hedef(n.k).midi) dogru(); else kc.isaretle("yanlis"); } },
    });
    // üst denetimler
    const dSeg = seg(DIZELER.map((d) => [d, KISA[d]]), dize, (d) => { dize = d; L.store.set("gamze.dize", d); kur(); }, "Dize");
    const vSeg = seg([[false, "Basit"], [true, "Çarpmalı"]], tam, (v) => { tam = v; L.store.set("gamze.tam", v); kur(); }, "Sürüm");
    const tSeg = seg([[20, "±20 c"], [30, "±30 c"], [50, "±50 c"]], tol, (v) => { tol = v; L.store.set("gamze.tol", v); }, "Tolerans");
    ust.append(dSeg, vSeg, h("label.go-tol", h("span.mute", "Tolerans"), tSeg));
    const dinleBtn = h("button.btn", { type: "button", onclick: () => dinle() }, "▶ Dinle");
    const basBtn = h("button.btn.primary", { type: "button", onclick: () => (aktif ? dur() : basla()) }, "Başla");
    const gecBtn = h("button.btn", { type: "button", onclick: () => aktif && dogru(true) }, "Geç");
    const mik = Mikrofon.dugme({ kucuk: true, onAcik: (a) => { if (a && aktif) mikDinle(); } });
    alt.append(dinleBtn, basBtn, gecBtn, mik);

    function kur() {
      dur();
      liste = notalar([dize], { tam, kirp: true }).notalar.filter((n) => n.k != null);
      idx = 0;
      tasCiz(); hedefCiz();
      const tamam = L.store.get("gamze.tamam", {});
      dSeg.querySelectorAll("button").forEach((b, i) => b.classList.toggle("tamam", !!tamam[DIZELER[i]]));
    }
    function tasCiz() {
      tasYer.innerHTML = "";
      let hece = "";
      liste.forEach((n, i) => {
        const p = K.perdeKoma(n.k);
        const tas = h("span.go-tas" + (i < idx ? ".ok" : i === idx && aktif ? ".simdi" : "") + (n.cz ? ".cz" : ""), { title: p ? p.ad : "" }, h("b", p ? kisaAd(p.ad) : n.k === 16 ? "Seg" : "?"), h("small", n.soz || (n.cz ? "çarpma" : "·")));
        tasYer.append(tas);
      });
      const s = tasYer.querySelector(".simdi"); if (s) s.scrollIntoView({ block: "nearest", inline: "center" });
    }
    const kisaAd = (a) => a.replace("Hüseynî aşîrân", "H. aşîrân").replace("Gerdâniye", "Gerdân.");
    function hedefCiz() {
      const n = liste[idx];
      if (!n) { hedefEl.innerHTML = `<b class="go-bitti">Dize tamam!</b><span class="mute">Bir sonraki dizeyi seçin ya da "Başla" ile yeniden çalın.</span>`; kc.vurgula(null); return; }
      const p = K.perdeKoma(n.k), hd = hedef(n.k);
      const ad = p ? p.ad : n.k === 16 ? "Segâh (uşşak)" : `${n.k} koma`;
      const ipucu = Math.abs(hd.sapma) > 10 ? `<span class="go-ipucu">${K.notaAdi(hd.midi)} pozisyonu, dudakla <b>${fmtNum(Math.abs(hd.sapma))} cent ${hd.sapma < 0 ? "pesleştir" : "tizleştir"}</b></span>` : `<span class="go-ipucu">${K.notaAdi(hd.midi)} pozisyonu</span>`;
      hedefEl.innerHTML = `<span class="mute">${idx + 1}/${liste.length}${n.soz ? " · hece: " + n.soz : ""}${n.cz ? " · kısa çarpma" : ""}</span><b>${ad}</b>${ipucu}<span class="mute">${fmtHz(hd.f)}</span>`;
      kc.goster(hd.midi, { sessiz: true });
      kc.vurgula(hd.midi);
    }
    function dogru(atla) {
      if (!atla) kc.isaretle("dogru");
      sonDogru = idx;
      const simdiki = liste[idx];
      idx++;
      iyiBas = 0;
      // aynı perde art arda: yeni bir atak beklenir
      bosluk = !(liste[idx] && simdiki && liste[idx].k === simdiki.k) ? true : false;
      if (idx >= liste.length) {
        aktif = false; basBtn.textContent = "Başla";
        const t = L.store.get("gamze.tamam", {}); t[dize] = true; L.store.set("gamze.tamam", t);
        dSeg.querySelectorAll("button").forEach((b, i) => b.classList.toggle("tamam", !!t[DIZELER[i]]));
      }
      tasCiz(); hedefCiz();
    }
    function mikDinle() {
      if (abone) abone();
      abone = Mikrofon.dinle((o) => {
        olcum = o;
        if (!aktif) return;
        const n = liste[idx]; if (!n) return;
        if (!o.f || o.rms < 0.01) { bosluk = true; iyiBas = 0; return; }
        if (!bosluk) return; // aynı nota: önce ses kesilmeli
        const c = 1200 * Math.log2(o.f / hedef(n.k).f);
        // oktav hatasını bağışlama: yalnızca doğru oktav
        if (Math.abs(c) <= tol) {
          if (!iyiBas) iyiBas = o.t;
          if (o.t - iyiBas >= (n.cz ? 60 : 200)) dogru();
        } else iyiBas = 0;
      });
    }
    function basla() {
      calan && calan.stop();
      aktif = true; idx = 0; bosluk = true; iyiBas = 0;
      basBtn.textContent = "Durdur";
      if (Mikrofon.acik) mikDinle();
      tasCiz(); hedefCiz();
    }
    function dur() { aktif = false; basBtn.textContent = "Başla"; tasCiz(); }
    function dinle() {
      dur();
      calan && calan.stop(); Snd.unlock(); Klarnet.hazirla();
      const ns = notalar([dize], { tam, kirp: true, tempo: 70 }).notalar.filter((n) => n.k != null);
      calan = Klarnet.ezgi(ns.map((n) => ({ ...n, f: K.perdeFrekans(n.k, D.ahenk()) })), {
        vibrato: 0.08,
        onNota: (j, n) => { kc.goster(hedef(n.k).midi, { sessiz: true }); tasYer.querySelectorAll(".go-tas").forEach((t, q) => t.classList.toggle("dinle", q === j)); },
        onBitti: () => { tasYer.querySelectorAll(".go-tas").forEach((t) => t.classList.remove("dinle")); calan = null; hedefCiz(); },
      });
    }
    // ibre: hedefe göre canlı sapma
    function ibre() {
      if (!ibreSt || !ibreSt.w) return;
      const { ctx, w, h: hh } = ibreSt;
      ctx.clearRect(0, 0, w, hh);
      const n = liste[idx];
      const x0 = 20, x1 = w - 20, y = hh / 2;
      const X = (c) => x0 + ((clamp(c, -100, 100) + 100) / 200) * (x1 - x0);
      ctx.fillStyle = rgba(C.guclu, 0.18); ctx.fillRect(X(-tol), y - 10, X(tol) - X(-tol), 20);
      ctx.strokeStyle = rgba(C.ink, 0.3); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.strokeStyle = C.guclu; ctx.beginPath(); ctx.moveTo(X(0), y - 12); ctx.lineTo(X(0), y + 12); ctx.stroke();
      text(ctx, "−100 c", x0, y + 24, { size: 10, color: C.muted }); text(ctx, "+100 c", x1, y + 24, { size: 10, color: C.muted, align: "right" });
      if (!Mikrofon.acik) { text(ctx, "Mikrofon kapalı: doğru delikleri kapatıp ağızlığa dokunun", w / 2, y - 16, { size: 11, color: C.muted, align: "center" }); return; }
      if (n && olcum && olcum.f) {
        const c = 1200 * Math.log2(olcum.f / hedef(n.k).f);
        const ok = Math.abs(c) <= tol;
        ctx.save(); ctx.shadowColor = ok ? C.guclu : C.durak; ctx.shadowBlur = 10;
        ctx.fillStyle = ok ? C.guclu : Math.abs(c) > 100 ? C.yeden : C.durak;
        ctx.beginPath(); ctx.arc(X(c), y, 7, 0, 7); ctx.fill(); ctx.restore();
        text(ctx, Math.abs(c) > 100 ? (c > 0 ? "çok tiz" : "çok pes") : `${c >= 0 ? "+" : "−"}${fmtNum(Math.abs(c))} c`, X(c), y - 14, { size: 11, align: "center", color: C.ink });
      }
    }
    ibreSt = canvas(ibreCv, ibre);
    const lp = loop(ibre);
    kur();
    return { enter() { lp.start(); if (Mikrofon.acik) mikDinle(); }, leave() { lp.stop(); dur(); calan && calan.stop(); if (abone) { abone(); abone = null; } kc.ufle(false); } };
  };
  G["gamzedeyim-ogren"] = [{ click: "▶ Dinle" }, { wait: 7000 }, { click: "=Başla" }];

  /* ================= Birlikte çal ================= */
  Demos.gamzebirlikte = (stage) => {
    const ust = h("div.controls.top");
    const { cv } = D.tuval(stage, "Akan nota satırı ve isabet şeridi");
    const alt = h("div.controls");
    stage.prepend(ust); stage.append(alt);
    let tempo = L.store.get("gamze.tempo", 64), eksi = false, secim = "hepsi", calan = null, st, abone = null;
    let isabet = [], ornek = [];
    const SECIM = {
      hepsi: [DIZELER[0], DIZELER[1], DIZELER[0], DIZELER[1], DIZELER[2], DIZELER[3], DIZELER[2], DIZELER[3]],
      a: [DIZELER[0], DIZELER[1]], b: [DIZELER[2], DIZELER[3]],
    };
    const skor = h("span.readout");
    ust.append(
      seg([["hepsi", "Bütün şarkı"], ["a", "1. ve 2. dize"], ["b", "3. ve 4. dize"]], secim, (k) => { secim = k; }, "Bölüm"),
      slider({ label: "Hız", min: 44, max: 96, step: 2, value: tempo, fmt: (v) => `♩ = ${v}`, oninput: (v) => { tempo = v; L.store.set("gamze.tempo", v); } }),
      h("label.go-eksi", h("input", { type: "checkbox", onchange: (e) => { eksi = e.target.checked; } }), "Eksi bir (klarnet sussun)"));
    const basBtn = h("button.btn.primary", { type: "button", onclick: () => (calan ? dur() : basla()) }, "▶ Başla");
    const mik = Mikrofon.dugme({ kucuk: true, onAcik: (a) => { if (a) mikDinle(); } });
    alt.append(basBtn, mik, skor);
    function mikDinle() {
      if (abone) abone();
      abone = Mikrofon.dinle((o) => { if (!calan || !o.f) return; ornek.push([calan.simdi() - 0.05, o.f]); });
    }
    function basla() {
      isabet = []; ornek = [];
      calan = birlikteCal({ adlar: SECIM[secim], tempo, tam: false, sesli: !eksi, giris: 1, onBitti: () => { degerlendir(true); calan = null; basBtn.textContent = "▶ Başla"; } });
      if (calan) basBtn.textContent = "■ Durdur";
      if (Mikrofon.acik) mikDinle();
    }
    function dur() { calan && calan.stop(); calan = null; basBtn.textContent = "▶ Başla"; }
    // bitmiş notaları değerlendir: süresinin ≥ 1/3'ünde ±35 c → doğru, ±70 c → kaymış
    function degerlendir(son) {
      if (!calan && !son) return;
      const ns = calan ? calan.notalar : null;
      if (!ns) return;
      const simdi = calan.simdi();
      ns.forEach((n, i) => {
        if (isabet[i] !== undefined || n.k == null || n.t + n.d > simdi) return;
        const f0 = K.perdeFrekans(n.k, D.ahenk());
        const icinde = ornek.filter(([t]) => t >= n.t && t < n.t + n.d);
        if (!icinde.length) { isabet[i] = 0; return; }
        const c = icinde.map(([, f]) => Math.abs(1200 * Math.log2(f / f0)));
        const iyi = c.filter((x) => x <= 35).length / icinde.length, orta = c.filter((x) => x <= 70).length / icinde.length;
        isabet[i] = iyi >= 1 / 3 ? 2 : orta >= 1 / 3 ? 1 : 0;
      });
      const deger = isabet.filter((x) => x !== undefined);
      if (Mikrofon.acik && deger.length) {
        const yuzde = Math.round((deger.filter((x) => x === 2).length / deger.length) * 100);
        skor.innerHTML = `İsabet <b>%${yuzde}</b>`;
        if (son) { const k = "gamze.enIyi." + secim; if (yuzde > L.store.get(k, 0)) L.store.set(k, yuzde); }
      } else skor.innerHTML = Mikrofon.acik ? "" : '<span class="mute">İsabet şeridi için mikrofonu açın</span>';
    }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      if (calan) degerlendir(false);
      const liste = calan ? calan.notalar : notalar(SECIM[secim]).notalar;
      const simdi = calan ? calan.simdi() : -1;
      rulo(ctx, w, hh, { liste, simdi, kAlt: -8, kUst: 56, renk: (i, n) => isabet[i] === 2 ? C.guclu : isabet[i] === 1 ? C.koma : isabet[i] === 0 ? rgba(C.ink, 0.18) : simdi >= n.t && simdi < n.t + n.d ? C.durak : rgba(C.ink, 0.75) });
      if (calan && simdi < 0) text(ctx, String(Math.ceil(-simdi / (60 / tempo))), w * 0.6, hh * 0.45, { size: 64, align: "center", color: rgba(C.durak, 0.8), font: FONT.display, weight: 400 });
      const enIyi = L.store.get("gamze.enIyi." + secim, null);
      if (enIyi != null && !calan) text(ctx, `En iyi sonucunuz: %${enIyi}`, w - 16, 16, { size: 12, align: "right", color: C.muted });
    }
    const lp = loop(draw);
    st = canvas(cv, draw);
    return { enter() { lp.start(); if (Mikrofon.acik) mikDinle(); }, leave() { lp.stop(); dur(); if (abone) { abone(); abone = null; } }, bosluk() { calan ? dur() : basla(); } };
  };
  G["gamzedeyim-birlikte"] = [{ slide: "label:Hız", to: 56 }, { click: "▶ Başla" }];
})();
