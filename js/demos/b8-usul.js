/* 8. bölüm: Usuller — düm ve tek, usul metronomu, dokuz sekizlik, bir oyun havası */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;

  // gruplardan vurgu usulü (düm-tek dizilimi olmayanlar ve gruplama denemesi için)
  function gruplu(ad, olcu, gruplar) {
    const u = { id: "g-" + gruplar.join(""), ad, olcu, payda: 8, gruplar, vuruslar: null };
    u.uzunluk = gruplar.reduce((a, b) => a + b, 0);
    let p = 0; u.olaylar = gruplar.map((g, i) => { const o = [p, i === 0 ? "vurgu" : "tık", g]; p += g; return o; });
    return u;
  }

  // ortak usul sahnesi: halka + hece göstergesi; dönüş: { ciz, st }
  function halkaSahne(stage, aria) {
    const { cv } = D.tuval(stage, aria);
    const o = { u: null, ctl: null, st: null, hece: "" };
    function ciz() {
      if (!o.st || !o.st.w || !o.u) return;
      const { ctx, w, h: hh } = o.st;
      ctx.clearRect(0, 0, w, hh);
      const R = Math.min(w, hh) * 0.34;
      const adim = o.ctl && o.ctl.on ? o.ctl.adim() : -1;
      Cizim.usulHalka(ctx, w / 2, hh / 2, R, o.u, adim, { dar: w < 420 });
      if (adim >= 0) {
        const ev = o.u.olaylar.find(([p, , d]) => adim >= p && adim < p + d);
        if (ev && ev[0] === adim) o.hece = ev[1];
      }
    }
    o.st = canvas(cv, ciz);
    o.ciz = ciz;
    return o;
  }

  /* ================= Düm ve tek ================= */
  Demos.usulnedir = (stage) => {
    const s = halkaSahne(stage, "Usul halkası");
    const ctl = h("div.controls");
    stage.append(ctl);
    let saz = "darbuka";
    s.u = usul("sofyan");
    const cal = h("button.btn.primary", { type: "button", onclick: () => toggle() }, "▶ Çal");
    function toggle() {
      if (s.ctl && s.ctl.on) { s.ctl.stop(); cal.textContent = "▶ Çal"; return; }
      Snd.unlock();
      s.ctl = Usul.cal(s.u, { tempo: s.u.id === "sofyan" ? 84 : 100, saz });
      if (s.ctl.start()) cal.textContent = "■ Durdur";
    }
    ctl.append(cal,
      seg([["sofyan", "Sofyan 4/4"], ["nimsofyan", "Nim sofyan 2/4"]], "sofyan", (id) => { const on = s.ctl && s.ctl.on; if (on) s.ctl.stop(); s.u = usul(id); s.ciz(); if (on) { s.ctl = null; toggle(); } }, "Usul"),
      seg([["darbuka", "Darbuka"], ["def", "Def"]], saz, (k) => { saz = k; if (s.ctl) s.ctl.saz = k; }, "Saz"),
      h("button.btn", { type: "button", onclick: () => { Snd.unlock(); Usul.vurus(Snd.ctx, "düm", Snd.now() + 0.02, saz); } }, "düm"),
      h("button.btn", { type: "button", onclick: () => { Snd.unlock(); Usul.vurus(Snd.ctx, "tek", Snd.now() + 0.02, saz); } }, "tek"));
    const lp = loop(s.ciz);
    return { enter() { lp.start(); }, leave() { lp.stop(); s.ctl && s.ctl.stop(); cal.textContent = "▶ Çal"; }, bosluk: toggle };
  };
  G["usul-nedir"] = [{ click: "=düm" }, { wait: 400 }, { click: "=tek" }, { wait: 400 }, { click: "▶ Çal" }];

  /* ================= Usul metronomu ================= */
  Demos.metronom = (stage) => {
    const ust = h("div.controls.top");
    const s = halkaSahne(stage, "Usul metronomu");
    const ctl = h("div.controls");
    stage.prepend(ust); stage.append(ctl);
    let saz = L.store.get("metronom.saz", "darbuka");
    let u = usul(L.store.get("metronom.usul", "aksak")) || usul("aksak");
    let tempo = L.store.get("metronom.tempo." + u.id, u.tempo);
    let diziAcik = false, mk = makam("hicaz"), diziI = 0, diziV = null;
    s.u = u;
    const bilgi = h("span.mt-bilgi");
    const uSel = h("select", { "aria-label": "Usul", onchange: (e) => sec(e.target.value) }, USULLER.map((x) => h("option", { value: x.id, selected: x.id === u.id ? "" : null }, `${x.ad} (${x.olcu})${x.dogrula ? " · doğrulanmalı" : ""}`)));
    const birim = () => (u.payda === 4 ? "♩" : "♪");
    const tSl = slider({ label: "Hız", min: 40, max: 420, step: 2, value: tempo, fmt: (v) => `${birim()} = ${v}`, oninput: (v) => { tempo = v; if (s.ctl) s.ctl.tempo = v; L.store.set("metronom.tempo." + u.id, v); } });
    const sazSeg = seg([["darbuka", "Darbuka"], ["def", "Def"], ["tik", "Tık"]], saz, (k) => { saz = k; L.store.set("metronom.saz", k); if (s.ctl) s.ctl.saz = k; }, "Ses");
    const calBtn = h("button.btn.primary", { type: "button", onclick: () => toggle() }, "▶ Başlat (Boşluk)");
    const diziBtn = h("button.btn", { type: "button", "aria-pressed": "false", onclick: () => { diziAcik = !diziAcik; diziBtn.classList.toggle("on", diziAcik); diziBtn.setAttribute("aria-pressed", diziAcik); if (!diziAcik && diziV) { diziV.stop(); diziV = null; } } }, "Dizi çal");
    const mSel = h("select", { "aria-label": "Dizi", onchange: (e) => { mk = makam(e.target.value); diziI = 0; } }, MAKAMLAR.map((m) => h("option", { value: m.id, selected: m.id === mk.id ? "" : null }, m.ad)));
    ust.append(h("label", "Usul", uSel), tSl);
    ctl.append(calBtn, sazSeg, diziBtn, mSel, h("span.spacer"), bilgi);
    function yazBilgi() { bilgi.innerHTML = (u.dogrula ? '<span class="dogrula">doğrulanmalı</span> ' : "") + `<span class="mute">${u.not || ""}${u.kaynak ? " Kaynak: " + u.kaynak + "." : ""}</span>`; }
    function sec(id) {
      const on = s.ctl && s.ctl.on;
      if (on) s.ctl.stop();
      u = usul(id); s.u = u; L.store.set("metronom.usul", id);
      tempo = L.store.get("metronom.tempo." + u.id, u.tempo); tSl.set(tempo);
      yazBilgi(); s.ciz();
      if (on) { s.ctl = null; toggle(); }
    }
    // dizi: her vuruşta (olay başında) bir sonraki perde; çık ve in
    function diziSirasi() { const d = mk.dizi; return d.concat(d.slice(1, -1).reverse()); }
    function toggle() {
      if (s.ctl && s.ctl.on) { s.ctl.stop(); calBtn.textContent = "▶ Başlat (Boşluk)"; if (diziV) { diziV.stop(); diziV = null; } return; }
      Snd.unlock(); Klarnet.hazirla();
      s.ctl = Usul.cal(u, { tempo, saz, onAdim: (adim, olay, t) => {
        if (!diziAcik || !olay) return;
        const sira = diziSirasi(), k = sira[diziI % sira.length]; diziI++;
        if (!diziV || diziV.durdu) { diziV = Klarnet.ses({ frekans: D.perdeHz(k) }); if (diziV) Snd.own(diziV); }
        if (!diziV) return;
        const P = diziV.p, d = (olay[2] * 60) / tempo;
        P.frekans.setValueAtTime(D.perdeHz(k), t);
        P.nefes.setTargetAtTime(0.15, t - 0.02, 0.005); P.nefes.setTargetAtTime(0.72, t, 0.01);
        P.nefes.setTargetAtTime(0.0, t + d * 0.9, 0.02);
      } });
      if (s.ctl.start()) calBtn.textContent = "■ Durdur (Boşluk)";
    }
    yazBilgi();
    const lp = loop(s.ciz);
    return { enter() { lp.start(); }, leave() { lp.stop(); s.ctl && s.ctl.stop(); if (diziV) { diziV.stop(); diziV = null; } calBtn.textContent = "▶ Başlat (Boşluk)"; }, bosluk: toggle };
  };
  G.metronom = [{ click: "▶ Başlat" }, { wait: 2500 }, { slide: "label:Hız", to: 200 }, { wait: 1500 }, { click: "■ Durdur" }];

  /* ================= Dokuz sekizlik ================= */
  Demos.dokuzsekiz = (stage) => {
    const s = halkaSahne(stage, "Dokuz sekizlik: gruplar");
    const ctl = h("div.controls");
    stage.append(ctl);
    const SECIM = {
      aksak: usul("aksak"),
      g2223: gruplu("2+2+2+3", "9/8", [2, 2, 2, 3]),
      g2322: gruplu("Raks aksağı", "9/8 · 2+3+2+2", [2, 3, 2, 2]),
    };
    s.u = SECIM.aksak;
    const cal = h("button.btn.primary", { type: "button", onclick: () => toggle() }, "▶ Çal");
    function toggle() {
      if (s.ctl && s.ctl.on) { s.ctl.stop(); cal.textContent = "▶ Çal"; return; }
      Snd.unlock();
      s.ctl = Usul.cal(s.u, { tempo: 280, saz: s.u.vuruslar ? "darbuka" : "tik" });
      if (s.ctl.start()) cal.textContent = "■ Durdur";
    }
    ctl.append(cal, seg([["aksak", "Aksak usulü (düm-tek)"], ["g2223", "2+2+2+3 vurgular"], ["g2322", "2+3+2+2 vurgular"]], "aksak", (k) => {
      const on = s.ctl && s.ctl.on; if (on) s.ctl.stop(); s.u = SECIM[k]; s.ciz(); if (on) { s.ctl = null; toggle(); }
    }, "Gruplama"));
    const lp = loop(s.ciz);
    return { enter() { lp.start(); }, leave() { lp.stop(); s.ctl && s.ctl.stop(); cal.textContent = "▶ Çal"; }, bosluk: toggle };
  };
  G["dokuz-sekiz"] = [{ click: "▶ Çal" }, { wait: 2600 }, { click: "2+3+2+2" }, { wait: 2600 }, { click: "■ Durdur" }];

  /* ================= Bir oyun havası (Hicaz, 9/8) — bu site için yazıldı ================= */
  const OYUN_HAVASI = [
    [9, 2], [14, 1], [26, 1], [31, 2], [26, 2], [31, 1],
    [40, 2], [31, 1], [26, 1], [31, 2], [26, 2], [14, 1],
    [26, 2], [31, 1], [40, 1], [48, 2], [40, 2], [31, 1],
    [40, 3], [31, 1], [26, 1], [14, 2], [9, 2],
    [31, 2], [40, 1], [48, 1], [53, 2], [48, 2], [40, 1],
    [48, 2], [40, 1], [31, 1], [40, 2], [31, 2], [26, 1],
    [31, 2], [26, 1], [14, 1], [26, 2], [14, 2], [9, 1],
    [14, 2], [26, 1], [14, 1], [9, 5],
  ];
  window.OYUN_HAVASI = OYUN_HAVASI;
  Demos.romanhavasi = (stage) => {
    const s = halkaSahne(stage, "Usul halkası ve oyun havası");
    const ctl = h("div.controls");
    stage.append(ctl);
    s.u = usul("aksak");
    let tempo = 300, ezgiCtl = null, durum = h("span.readout");
    const tSl = slider({ label: "Hız", min: 150, max: 380, step: 5, value: tempo, fmt: (v) => `♪ = ${v}`, oninput: (v) => { tempo = v; if (s.ctl) s.ctl.tempo = v; } });
    const cal = h("button.btn.primary", { type: "button", onclick: () => toggle() }, "▶ Çal");
    function dur() { s.ctl && s.ctl.stop(); ezgiCtl && ezgiCtl.stop(); ezgiCtl = null; cal.textContent = "▶ Çal"; durum.textContent = ""; }
    function toggle() {
      if (s.ctl && s.ctl.on) { dur(); return; }
      Snd.unlock(); Klarnet.hazirla();
      s.ctl = Usul.cal(s.u, { tempo, saz: "darbuka" });
      if (!s.ctl.start()) return;
      const olcu = (60 / tempo) * 9;
      const dizi = OYUN_HAVASI.concat(OYUN_HAVASI);
      ezgiCtl = Klarnet.ezgi(D.komaEzgi(dizi, tempo), { gecikme: 0.06 + olcu, nefes: 0.8, onBitti: () => { durum.innerHTML = "<b>Sıra sizde:</b> darbuka devam ediyor"; } });
      durum.textContent = "Bir ölçü giriş, sonra klarnet";
      cal.textContent = "■ Durdur";
    }
    ctl.append(cal, tSl, durum);
    const lp = loop(s.ciz);
    return { enter() { lp.start(); }, leave() { lp.stop(); dur(); }, bosluk: toggle };
  };
  G["roman-havasi"] = [{ slide: "label:Hız", to: 240 }, { click: "▶ Çal" }];
})();
