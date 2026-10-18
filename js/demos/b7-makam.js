/* 7. bölüm: Makamlar — roller, dörtlü ve beşliler, dokuz makam, Roman havalarında makam */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;

  /* Makam merdiveni + zamana yayılmış ezgi izi (müzik eğitimindeki seyir çizimiyle aynı dil).
     o: { makam, roller: {durak, guclu, yeden}, ezgi: [{k,t,d}], simdi, canli: [[t, koma]] } */
  function merdiven(ctx, w, hh, o) {
    const m = o.makam;
    const kAlt = Math.min(...m.dizi, m.durakKoma - 9) - 2, kUst = Math.max(...m.dizi) + 3;
    const dar = w < 520;
    const x = dar ? 104 : 150, x1 = w - 16;
    const rolOf = (k) => { const r = D.rol(m, k); return r && o.roller[r] ? r : null; };
    const pk = (ad) => (K.perde(ad) || {}).koma;
    const dizi = m.dizi.slice();
    if (o.roller.yeden && !dizi.includes(pk(m.yeden))) dizi.unshift(pk(m.yeden));
    const per = dizi.map((k) => { const p = K.perdeKoma(k); const y = K.perdeYazili(k); return { koma: k, ad: p ? p.ad : k + "", bati: K.notaAdi(y.midi), sapma: y.sapma, sapan: Math.abs(y.sapma) > 10, rol: rolOf(k), isik: o.isik === k }; });
    const g = Cizim.izgara(ctx, { x, y0: 18, y1: hh - 18, kAlt, kUst, perdeler: per, sag: x1 - x, bati: !dar, dar });
    // aralıklar (koma) basamak aralarında
    if (!dar) for (let i = 0; i < m.dizi.length - 1; i++) {
      const d = m.dizi[i + 1] - m.dizi[i], y = (g.yOf(m.dizi[i]) + g.yOf(m.dizi[i + 1])) / 2;
      text(ctx, String(d), x - 118, y + 4, { size: 10, align: "right", color: d === 12 || d === 4 ? C.koma : C.muted });
    }
    // ezgi izi
    const ezgi = o.ezgi || [];
    if (ezgi.length) {
      const top = ezgi[ezgi.length - 1].t + ezgi[ezgi.length - 1].d;
      const px0 = x + (dar ? 70 : 120), pw = x1 - px0 - 10;
      const X = (t) => px0 + (t / top) * pw;
      const now = o.simdi ?? top;
      ezgi.forEach((n) => {
        if (n.k == null || n.t > now) return;
        const y = g.yOf(n.k), r = rolOf(n.k);
        ctx.fillStyle = r ? Cizim.rolRenk(r) : rgba(C.ink, 0.75);
        ctx.fillRect(X(n.t), y - 3, Math.max(3, X(Math.min(now, n.t + n.d)) - X(n.t) - 2), 6);
      });
    }
    // canlı (mikrofon) izi
    if (o.canli && o.canli.length > 1) {
      const tNow = o.canli[o.canli.length - 1][0];
      const px0 = x + (dar ? 70 : 120), pw = x1 - px0 - 10;
      const X = (t) => px0 + pw - ((tNow - t) / 8) * pw;
      ctx.strokeStyle = C.silverHi; ctx.lineWidth = 2; ctx.beginPath();
      let ilk = true;
      o.canli.forEach(([t, k], i) => { if (t < tNow - 8 || k < kAlt || k > kUst) { ilk = true; return; } if (i && t - o.canli[i - 1][0] > 0.2) ilk = true; ilk ? ctx.moveTo(X(t), g.yOf(k)) : ctx.lineTo(X(t), g.yOf(k)); ilk = false; });
      ctx.stroke();
    }
    return g;
  }
  window.Merdiven = merdiven;

  // mikrofondan gelen frekansı (seçili ahenkte) Rast'tan komaya çevir, makam aralığına oktavla taşı
  function komaOf(f, kAlt, kUst) {
    let k = 53 * Math.log2(f / K.perdeFrekans(0, D.ahenk()));
    while (k < kAlt - 3) k += 53; while (k > kUst + 3) k -= 53;
    return k;
  }

  /* ================= Makam nedir? ================= */
  Demos.makamnedir = (stage) => {
    const { cv } = D.tuval(stage, "Uşşak dizisi: durak, güçlü ve yeden");
    const ctl = h("div.controls");
    stage.append(ctl);
    const m = makam("ussak");
    const roller = { durak: true, guclu: true, yeden: true };
    let st, ezgi = [], t0 = 0, calan = null, isik = null;
    const draw = () => { if (!st || !st.w) return; st.ctx.clearRect(0, 0, st.w, st.h); merdiven(st.ctx, st.w, st.h, { makam: m, roller, ezgi, simdi: calan ? Snd.now() - t0 : undefined, isik }); };
    const lp = loop(draw);
    st = canvas(cv, draw);
    const tog = (ad, etiket, sinif) => {
      const b = h("button.btn.on.rol-btn", { type: "button", "aria-pressed": "true", onclick: () => { roller[ad] = !roller[ad]; b.classList.toggle("on", roller[ad]); b.setAttribute("aria-pressed", roller[ad]); draw(); } }, h("span.rol." + sinif), etiket);
      return b;
    };
    function cal(dizi, tempo) {
      calan && calan.stop();
      Snd.unlock(); Klarnet.hazirla();
      ezgi = D.komaEzgi(dizi, tempo);
      calan = Klarnet.ezgi(ezgi, { gecikme: 0.08, onNota: (i, n) => (isik = n.k), onBitti: () => { calan = null; isik = null; } });
      t0 = Snd.now() + 0.08;
    }
    ctl.append(tog("durak", "Durak", "durak"), tog("guclu", "Güçlü", "guclu"), tog("yeden", "Yeden", "yeden"),
      h("span.spacer"),
      h("button.btn", { type: "button", onclick: () => cal(m.dizi.map((k) => [k, 0.6]).concat([[m.dizi[m.dizi.length - 1], 0.6]]).concat(m.dizi.slice().reverse().slice(1).map((k) => [k, 0.6])).concat([[0, 0.6], [9, 1.4]]), 110) }, "▶ Diziyi çal"),
      h("button.btn.primary", { type: "button", onclick: () => cal(m.cumle, 96) }, "▶ Kısa seyir"));
    return { enter() { lp.start(); }, leave() { lp.stop(); calan && calan.stop(); } };
  };
  G["makam-nedir"] = [{ click: "▶ Kısa seyir" }, { wait: 6500 }, { click: "Güçlü" }, { wait: 500 }, { click: "Güçlü" }];

  /* ================= Dörtlüler ve beşliler ================= */
  const DORTLU = [["uşşak", [8, 5, 9]], ["hicaz", [5, 12, 5]], ["kürdî", [4, 9, 9]], ["rast", [9, 8, 5]], ["bûselik", [9, 4, 9]]];
  const BESLI = [["bûselik", [9, 4, 9, 9]], ["hicaz", [5, 12, 5, 9]], ["rast", [9, 8, 5, 9]], ["hüseynî", [8, 5, 9, 9]], ["kürdî", [4, 9, 9, 9]]];
  Demos.cinsler = (stage) => {
    const ust = h("div.controls.top.cn-ust");
    const { cv } = D.tuval(stage, "Dörtlü ve beşliden kurulan dizi");
    const ctl = h("div.controls");
    stage.prepend(ust); stage.append(ctl);
    let d = 0, b = 0, sira = "dortlu", st, ezgi = [], t0 = 0, calan = null, isik = null;
    const sonuc = h("span.readout.cn-sonuc");
    ust.append(
      h("div.cn-satir", h("span.mute", "Dörtlü"), seg(DORTLU.map(([ad], i) => [i, ad]), d, (i) => { d = i; guncelle(true); }, "Dörtlü")),
      h("div.cn-satir", h("span.mute", "Beşli"), seg(BESLI.map(([ad], i) => [i, ad]), b, (i) => { b = i; guncelle(true); }, "Beşli")),
      h("div.cn-satir", h("span.mute", "Sıra"), seg([["dortlu", "Dörtlü altta"], ["besli", "Beşli altta"]], sira, (s) => { sira = s; guncelle(true); }, "Sıra")),
    );
    ctl.append(h("button.btn.primary", { type: "button", onclick: () => cal() }, "▶ Diziyi çal"), sonuc);
    function araliklar() { return sira === "dortlu" ? DORTLU[d][1].concat(BESLI[b][1]) : BESLI[b][1].concat(DORTLU[d][1]); }
    function guncelle(ses) {
      const a = araliklar();
      const es = MAKAMLAR.filter((m) => m.araliklar.join() === a.join());
      sonuc.innerHTML = es.length ? `Bu dizi: <b>${es.map((m) => m.ad).join(", ")}</b> <span class="mute">(yalnız dizi düzeyinde)</span>` : '<span class="mute">Bu dokuz makam arasında aynı diziye sahip olan yok</span>';
      draw();
      if (ses) cal();
    }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const a = araliklar();
      const dizi = [0]; a.forEach((x) => dizi.push(dizi[dizi.length - 1] + x));
      const x0 = 60, x1 = w - 40, y = hh * 0.5;
      const X = (k) => x0 + (k / 53) * (x1 - x0);
      ctx.strokeStyle = rgba(C.koma, 0.45); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      for (let k = 0; k <= 53; k++) { const xx = Math.round(X(k)) + 0.5, len = k % 9 === 0 ? 7 : 3; ctx.beginPath(); ctx.moveTo(xx, y - len); ctx.lineTo(xx, y + len); ctx.stroke(); }
      const ilk = sira === "dortlu" ? 3 : 4;
      const br = (i0, i1, lab, alt) => {
        const xa = X(dizi[i0]) + 3, xb = X(dizi[i1]) - 3, yy = alt ? y + 34 : y - 34;
        ctx.strokeStyle = rgba(C.ink, 0.4); ctx.beginPath(); ctx.moveTo(xa, yy + (alt ? -6 : 6)); ctx.lineTo(xa, yy); ctx.lineTo(xb, yy); ctx.lineTo(xb, yy + (alt ? -6 : 6)); ctx.stroke();
        text(ctx, lab, (xa + xb) / 2, yy + (alt ? 18 : -8), { size: 13, align: "center", color: C.ink, weight: 600 });
      };
      br(0, ilk, (sira === "dortlu" ? DORTLU[d][0] + " dörtlüsü" : BESLI[b][0] + " beşlisi"), false);
      br(ilk, a.length, (sira === "dortlu" ? BESLI[b][0] + " beşlisi" : DORTLU[d][0] + " dörtlüsü"), true);
      dizi.forEach((k, i) => {
        const on = isik === i;
        ctx.save(); if (on) { ctx.shadowColor = C.durak; ctx.shadowBlur = 14; }
        Cizim.rol(ctx, X(k), y, on ? 7 : 5.5, i === 0 || i === dizi.length - 1 ? "durak" : null, { isik: on });
        ctx.restore();
        if (i < a.length) text(ctx, String(a[i]), (X(k) + X(dizi[i + 1])) / 2, y + 16, { size: 11, align: "center", color: a[i] === 12 || a[i] === 4 ? C.koma : C.muted });
        const p = K.perdeKoma(k + 9);
        if (p) text(ctx, p.ad, X(k), y - 58 - (i % 2) * 14, { size: 11, align: "center", color: C.ink2 });
      });
      text(ctx, `${a.slice(0, ilk).reduce((s, x) => s + x, 0)} + ${a.slice(ilk).reduce((s, x) => s + x, 0)} = 53 koma`, w / 2, hh * 0.86, { size: 13, align: "center", color: C.ink2 });
    }
    function cal() {
      calan && calan.stop(); Snd.unlock(); Klarnet.hazirla();
      const a = araliklar(); const dizi = [9]; a.forEach((x) => dizi.push(dizi[dizi.length - 1] + x));
      calan = Klarnet.ezgi(D.komaEzgi(dizi.map((k) => [k, 0.5]), 120), { onNota: (i) => { isik = i; draw(); }, onBitti: () => { isik = null; draw(); calan = null; } });
    }
    st = canvas(cv, draw);
    guncelle(false);
    return { leave() { calan && calan.stop(); } };
  };
  G.cinsler = [{ click: "=hicaz" }, { wait: 2200 }, { click: "=rast" }];
  window.GuideTargets = Object.assign(window.GuideTargets || {}, { cinsler: "css:.cn-ust" });

  /* ================= Dokuz makam ================= */
  Demos.makamlar = (stage) => {
    const ust = h("div.controls.top");
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const { fill, cv } = (() => { const f = h("div.fill"); const c = h("canvas", { role: "img", "aria-label": "Makam dizisi ve seyir cümlesi" }); f.append(c); return { fill: f, cv: c }; })();
    ikili.append(kcYer, fill);
    const kart = h("div.mk-kart");
    const ctl = h("div.controls");
    stage.append(ust, ikili, kart, ctl);
    const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: false });
    let m = makam("rast"), st, ezgi = [], t0 = 0, calan = null, isik = null, canli = [], abone = null;
    const roller = { durak: true, guclu: true, yeden: true };
    const draw = () => { if (!st || !st.w) return; st.ctx.clearRect(0, 0, st.w, st.h); merdiven(st.ctx, st.w, st.h, { makam: m, roller, ezgi, simdi: calan ? Snd.now() - t0 : undefined, isik, canli }); };
    const lp = loop(draw);
    st = canvas(cv, draw);
    ust.append(seg(MAKAMLAR.map((x) => [x.id, x.ad]), m.id, (id) => { m = makam(id); ezgi = []; canli = []; yaz(); kc.goster(K.perdeYazili(m.durakKoma).midi, { sessiz: true }); }, "Makam"));
    function yaz() {
      kart.innerHTML = `<span><span class="rol durak"></span>Durak <b>${m.durak}</b></span><span><span class="rol guclu"></span>Güçlü <b>${m.guclu}</b></span><span><span class="rol yeden"></span>Yeden <b>${m.yeden}</b></span><span>Seyir <b>${m.seyir}</b></span><span class="mute">${m.cinsler}${m.not ? ". " + m.not : ""}</span>`;
    }
    function cal(dizi, tempo) {
      calan && calan.stop(); Snd.unlock(); Klarnet.hazirla();
      ezgi = D.komaEzgi(dizi, tempo);
      calan = Klarnet.ezgi(ezgi, { gecikme: 0.08, vibrato: 0.08, onNota: (i, n) => { isik = n.k; kc.goster(K.perdeYazili(n.k).midi, { sessiz: true }); }, onBitti: () => { calan = null; isik = null; } });
      t0 = Snd.now() + 0.08;
    }
    const mik = Mikrofon.dugme({ kucuk: true, onAcik: (a) => { if (a) dinle(); } });
    function dinle() {
      if (abone) abone();
      const t00 = performance.now();
      abone = Mikrofon.dinle((o) => { if (!o.f) return; const k = komaOf(o.f, Math.min(...m.dizi) - 9, Math.max(...m.dizi)); canli.push([(o.t - t00) / 1000, k]); if (canli.length > 500) canli.shift(); });
    }
    ctl.append(
      h("button.btn.primary", { type: "button", onclick: () => cal(m.cumle, 96) }, "▶ Cümleyi dinle"),
      h("button.btn", { type: "button", onclick: () => cal(m.dizi.map((k) => [k, 0.5]).concat(m.dizi.slice().reverse().slice(1).map((k) => [k, 0.5])), 120) }, "▶ Dizi"),
      mik);
    yaz(); kc.goster(K.perdeYazili(m.durakKoma).midi, { sessiz: true });
    return { enter() { lp.start(); if (Mikrofon.acik) dinle(); }, leave() { lp.stop(); calan && calan.stop(); if (abone) { abone(); abone = null; } kc.ufle(false); } };
  };
  G.makamlar = [{ click: "=Hicaz" }, { click: "▶ Cümleyi dinle" }];

  /* ================= Roman havalarında makam ================= */
  Demos.romanmakam = (stage) => {
    const yer = h("div.rm-yer");
    const ctl = h("div.controls");
    stage.append(yer, ctl);
    const iki = ["hicaz", "ussak"].map((id) => {
      const m = makam(id);
      const kol = h("div.rm-kol");
      const kcYer = h("div.kc-yer.rm-kc");
      const cvYer = h("div.fill");
      const cv = h("canvas", { role: "img", "aria-label": m.ad + " dizisi" });
      cvYer.append(cv);
      kol.append(h("h4", m.ad), h("div.rm-ic", kcYer, cvYer));
      yer.append(kol);
      const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: false, salt: true });
      const o = { m, kc, isik: null };
      o.st = canvas(cv, () => ciz(o));
      kc.goster(K.perdeYazili(m.durakKoma).midi, { sessiz: true });
      return o;
    });
    function ciz(o) { if (!o.st || !o.st.w) return; o.st.ctx.clearRect(0, 0, o.st.w, o.st.h); merdiven(o.st.ctx, o.st.w, o.st.h, { makam: o.m, roller: { durak: true, guclu: true, yeden: true }, isik: o.isik }); }
    let calan = null;
    function cal(i, sonra) {
      const o = iki[i];
      calan && calan.stop(); Snd.unlock(); Klarnet.hazirla();
      const d = o.m.dizi.slice(0, 5);
      const dizi = d.concat(d.slice(0, -1).reverse());
      calan = Klarnet.ezgi(D.komaEzgi(dizi.map((k) => [k, 0.55]), 116), { onNota: (j, n) => { o.isik = n.k; o.kc.goster(K.perdeYazili(n.k).midi, { sessiz: true }); ciz(o); }, onBitti: () => { o.isik = null; ciz(o); calan = null; sonra && sonra(); } });
    }
    ctl.append(h("button.btn.primary", { type: "button", onclick: () => cal(0, () => setTimeout(() => cal(1), 400)) }, "▶ Hicaz, sonra uşşak"),
      h("button.btn", { type: "button", onclick: () => cal(0) }, "▶ Hicaz"), h("button.btn", { type: "button", onclick: () => cal(1) }, "▶ Uşşak"));
    return { leave() { calan && calan.stop(); } };
  };
  G["roman-makamlari"] = [{ click: "▶ Hicaz, sonra uşşak" }];
})();
