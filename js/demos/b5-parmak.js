/* 5. bölüm: Parmaklar ve notalar — alt register, üst register, parmak tablosu, aktarım */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;

  // yazılı notanın Türk perde adı (AEU, Rast = yazılı Sol4); eşit tamperamanlı notaya en yakın ana perde
  function perdeAdi(m) {
    const c = (m - 67) * 100;
    let best = null;
    K.PERDELER.filter((p) => K.anaMi(p)).forEach((p) => { const d = Math.abs(p.cent - c); if (!best || d < best.d) best = { p, d }; });
    return best && best.d < 30 ? best.p.ad : "";
  }
  window.PerdeAdiYazili = perdeAdi;
  const notaEt = (m) => { const a = perdeAdi(m); return K.notaAdi(m) + (a ? " · " + a : ""); };

  // nota düğmeleri + klarnet: ortak kurgu
  function notaKlarnet(stage, { notalar, baslangic, register = false, ust = null }) {
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const sag = h("div.fill.nk-sag");
    ikili.append(kcYer, sag);
    stage.append(ikili);
    const buyuk = h("div.nk-buyuk");
    const liste = h("div.nk-liste", { role: "group", "aria-label": "Notalar" });
    sag.append(buyuk, liste);
    if (ust) sag.prepend(ust);
    let secili = baslangic;
    const btn = new Map();
    notalar.forEach((m) => {
      const b = h("button.nk-nota", { type: "button", "aria-label": notaEt(m), onclick: () => sec(m, true) }, h("b", K.notaAdi(m)), h("small", perdeAdi(m) || " "));
      btn.set(m, b); liste.append(b);
    });
    const kc = KlarnetCiz(kcYer, {
      yon: "dikey",
      onDegis: (k, th, kaynak) => { if (kaynak !== "goster") goster(th.midi, th); },
    });
    function goster(m, th) {
      btn.forEach((b, mm) => b.classList.toggle("on", mm === m));
      const f = K.yaziliFrekans(m, "sol") * Math.pow(2, ((th && th.cent) || 0) / 1200);
      const p = perdeAdi(m);
      buyuk.innerHTML = `<b>${K.notaAdi(m)}</b><span>${p ? p + " perdesi" : "&nbsp;"}</span><span class="mute">duyulan ${fmtHz(f)} (Sol klarnet)</span>`;
    }
    function sec(m, ses) { secili = m; kc.goster(m, { ses, sessiz: true }); goster(m); }
    sec(baslangic, false);
    return { kc, sec, get secili() { return secili; } };
  }

  /* ================= Alt register ================= */
  const ALT = [67, 66, 64, 62, 60, 59, 57, 55, 53, 52];
  Demos.alt = (stage) => {
    const nk = notaKlarnet(stage, { notalar: ALT, baslangic: 67 });
    const ctl = h("div.controls");
    stage.append(ctl);
    let calan = null;
    const inis = h("button.btn.primary", { type: "button", onclick: () => {
      if (calan) { calan.stop(); calan = null; inis.textContent = "▶ Sol4'ten Mi3'e in"; return; }
      Snd.unlock(); Klarnet.hazirla();
      const n = ALT.map((m, i) => ({ f: K.yaziliFrekans(m, "sol"), t: i * 0.62, d: 0.56, m }));
      calan = Klarnet.ezgi(n, { onNota: (i, x) => nk.sec(x.m, false), onBitti: () => { calan = null; inis.textContent = "▶ Sol4'ten Mi3'e in"; } });
      if (calan) inis.textContent = "■ Durdur";
    } }, "▶ Sol4'ten Mi3'e in");
    ctl.append(inis, h("span.mute", "Notaya dokunun ya da ağızlığı basılı tutup delikleri kapatın"));
    return { leave() { calan && calan.stop(); nk.kc.ufle(false); } };
  };
  G.chalumeau = [{ click: "aria:Fa♯4 · Irak" }, { wait: 700 }, { click: "aria:Mi4 · Hüseynî aşîrân" }, { wait: 700 }, { click: "aria:Re4 · Yegâh" }];

  /* ================= Üst register ================= */
  const CIFT = [[52, 71], [53, 72], [55, 74], [57, 76], [59, 78], [60, 79], [62, 81], [64, 83]];
  Demos.ust = (stage) => {
    const ustBar = h("div.nk-cift");
    let reg = false;
    const nk = notaKlarnet(stage, { notalar: CIFT.map((c) => c[0]), baslangic: 52, ust: ustBar });
    const regBtn = h("button.btn", { type: "button", "aria-pressed": "false", onclick: () => { reg = !reg; uygula(true); } }, "Register anahtarı: kapalı");
    const ctl = h("div.controls");
    stage.append(ctl);
    ctl.append(regBtn, h("button.btn.primary", { type: "button", onclick: () => { const c = CIFT.find((x) => x[0] === taban); D.notaCal(c[0], 0.6); setTimeout(() => D.notaCal(c[1], 0.8), 650); } }, "▶ İkisini art arda"));
    let taban = 52;
    function uygula(ses) {
      regBtn.classList.toggle("on", reg); regBtn.setAttribute("aria-pressed", reg);
      regBtn.textContent = reg ? "Register anahtarı: açık" : "Register anahtarı: kapalı";
      const c = CIFT.find((x) => x[0] === taban);
      nk.kc.goster(reg ? c[1] : c[0], { ses, sessiz: true });
      ustBar.innerHTML = `<span>${K.notaAdi(c[0])}</span><span class="nk-ok">onikili yukarı</span><span>${K.notaAdi(c[1])}</span>`;
      ustBar.children[reg ? 2 : 0].classList.add("on");
    }
    nk.kc.el.addEventListener("click", () => {});
    // nota düğmeleri tabanı değiştirir
    stage.querySelectorAll(".nk-nota").forEach((b, i) => b.addEventListener("click", () => { taban = CIFT[i][0]; reg = false; uygula(false); }));
    uygula(false);
    return { leave() { nk.kc.ufle(false); } };
  };
  G.clarion = [{ click: "Register anahtarı" }, { wait: 900 }, { click: "Register anahtarı" }, { wait: 700 }, { click: "▶ İkisini art arda" }];

  /* ================= Parmak tablosu ================= */
  Demos.tablo = (stage) => {
    const yer = h("div.tb-yer");
    const sol = h("div.tb-sol");
    const kcYer = h("div.kc-yer.tb-kc");
    const sag = h("div.tb-sag");
    yer.append(sol, kcYer, sag);
    stage.append(yer);
    const ara = h("input.tb-ara", { type: "text", placeholder: "Ara: Do5, Fa♯, Rast, Dügâh, Segâh…", "aria-label": "Nota ya da perde ara" });
    const liste = h("div.tb-liste", { role: "listbox", "aria-label": "Notalar" });
    sol.append(ara, liste);
    const satir = new Map();
    PARMAKLAR.forEach((p) => {
      const pa = perdeAdi(p.midi);
      const b = h("button.tb-satir", { type: "button", role: "option", "data-ara": (K.notaAdi(p.midi) + " " + K.notaLat(p.midi) + " " + pa + " " + p.yazili).toLocaleLowerCase("tr"), onclick: () => sec(p.midi, true) },
        h("b", K.notaAdi(p.midi)), h("span", pa), CEYREK_SESLER.some((q) => q.midi === p.midi) ? h("i.tb-q", { title: "çeyrek ses pozisyonu var" }, "¼") : null);
      satir.set(p.midi, b); liste.append(b);
    });
    // perde araması: segâh gibi koma perdeleri için en yakın notayı bul
    ara.addEventListener("input", () => {
      const q = ara.value.trim().toLocaleLowerCase("tr").replace("#", "♯");
      let ilk = null;
      satir.forEach((b, m) => { const ok = !q || b.dataset.ara.includes(q); b.style.display = ok ? "" : "none"; if (ok && !ilk) ilk = m; });
      const pe = K.PERDELER.find((p) => p.ad.toLocaleLowerCase("tr") === q);
      if (pe) { const y = K.perdeYazili(pe.koma); sec(y.midi, false, pe); satir.get(y.midi) && (satir.get(y.midi).style.display = ""); }
    });
    ara.addEventListener("keydown", (e) => e.stopPropagation());
    const kc = KlarnetCiz(kcYer, { yon: "dikey", onDegis: (k, th, kaynak) => { if (kaynak !== "goster") bilgi(th.midi, th); } });
    let secili = 67;
    function sec(m, ses, perde) { secili = m; kc.goster(m, { ses, sessiz: true }); bilgi(m, null, perde); }
    function bilgi(m, th, perde) {
      satir.forEach((b, mm) => b.classList.toggle("on", mm === m));
      const p = parmak(m);
      sag.innerHTML = "";
      if (!p) { sag.append(h("p.mute", "Bu birleşim tabloda yok.")); return; }
      const f = K.yaziliFrekans(m, "sol");
      sag.append(h("div.tb-baslik", h("b", K.notaAdi(m)), h("span", perdeAdi(m) ? perdeAdi(m) + " perdesi" : "")), h("p.mute", `Sol klarnette duyulan ${fmtHz(f)}`));
      if (perde) {
        const y = K.perdeYazili(perde.koma);
        sag.append(h("p.tb-perde", { html: `<b>${perde.ad}</b>: ${K.notaAdi(y.midi)} pozisyonu, dudakla <b class="c-koma">${y.sapma < 0 ? "pesleştir" : "tizleştir"} (${fmtNum(Math.abs(y.sapma))} cent)</b>.` }));
      }
      const poz = (ad, kapali, not, guven, fn) => h("button.tb-poz", { type: "button", onclick: fn || (() => kc.goster(kapali, { ses: true, sessiz: true })) },
        h("span", ad), not ? h("small", not) : null, guven === "dogrula" ? h("span.dogrula", "doğrulanmalı") : guven === "model" ? h("span.chip", "modele bağlı") : null);
      sag.append(h("h4", "Pozisyonlar"), poz("Ana pozisyon", p.kapali, p.not, "kaynak"));
      p.alt.forEach((a, i) => sag.append(poz(`Alternatif ${i + 1}`, a.kapali, a.not, a.guven)));
      const q = CEYREK_SESLER.filter((x) => x.midi === m || x.midi === m - 1);
      if (q.length) {
        sag.append(h("h4", "Çeyrek ses (WFG)"));
        q.forEach((x) => sag.append(poz(`${K.notaAdi(x.midi)} +${x.cent} cent`, x.kapali, x.not, "dogrula")));
      }
      sag.append(h("p.tb-kaynak", "Kaynak: Woodwind Fingering Guide, Albert/Oehler tabloları (E. McAuley, A. Wendl)."));
    }
    sec(67, false);
    return { leave() { kc.ufle(false); } };
  };
  G["parmak-tablosu"] = [{ click: "css:.tb-satir:nth-child(18)" }, { wait: 900 }, { click: "Alternatif 1" }];

  /* ================= Aktarım hesaplayıcı ================= */
  Demos.aktarim = (stage) => {
    const ust = h("div.controls.top");
    const yer = h("div.ak-yer");
    const kcYer = h("div.kc-yer.ak-kc");
    const sonuc = h("div.ak-sonuc");
    yer.append(sonuc, kcYer);
    stage.append(ust, yer);
    const perdeler = K.PERDELER.filter((p) => K.anaMi(p) && p.koma >= -13 && p.koma <= 62);
    let pk = 9, ahenk = "bolahenk", tur = "sol";
    const pSel = h("select", { "aria-label": "Perde", onchange: (e) => { pk = +e.target.value; guncelle(); } }, perdeler.map((p) => h("option", { value: p.koma, selected: p.koma === pk ? "" : null }, p.ad)));
    const aSel = h("select", { "aria-label": "Ahenk", onchange: (e) => { ahenk = e.target.value; guncelle(); } }, Object.entries(K.AHENKLER).map(([id, a]) => h("option", { value: id }, a.ad + (a.dogrula ? " (doğrulanmalı)" : ""))));
    const tSel = h("select", { "aria-label": "Klarnet", onchange: (e) => { tur = e.target.value; guncelle(); } }, Object.entries(K.KLARNETLER).map(([id, k]) => h("option", { value: id }, k.ad)));
    ust.append(h("label", "Perde", pSel), h("label", "Ahenk", aSel), h("label", "Klarnet", tSel));
    const kc = KlarnetCiz(kcYer, { yon: "dikey", etiket: false, salt: true });
    function guncelle() {
      const f = K.perdeFrekans(pk, ahenk);
      const duy = K.ftom(f);
      const yaz = duy - K.KLARNETLER[tur].aktarim;
      const ym = Math.round(yaz), sap = (yaz - ym) * 100;
      kc.goster(ym, { sessiz: true });
      const p = K.perdeKoma(pk), y = K.perdeYazili(pk);
      const ayni = Math.abs(ym - y.midi) === 0;
      sonuc.innerHTML = "";
      sonuc.append(...[
        h("div.ak-satir", h("span.mute", "Notada"), h("b", { html: `${p.ad} <span class="mute">(portede ${D.yazimHTML(pk, 18)})</span>` })),
        h("div.ak-satir", h("span.mute", "Duyulan"), h("b", `${K.notaAdi(Math.round(duy))}${Math.abs(duy - Math.round(duy)) > 0.05 ? ` ${duy - Math.round(duy) > 0 ? "+" : "−"}${fmtNum(Math.abs(duy - Math.round(duy)) * 100)} c` : ""} · ${fmtHz(f)}`)),
        h("div.ak-satir", h("span.mute", "Çalacağınız"), h("b", `yazılı ${K.notaAdi(ym)} pozisyonu${Math.abs(sap) >= 3 ? `, dudakla ${sap < 0 ? "pesleştir" : "tizleştir"} (${fmtNum(Math.abs(sap))} c)` : ""}`)),
        h("p.ak-not", ayni ? "Notayı yazıldığı gibi okuyorsunuz." : `Notayı ${aralikAdi(ym - y.midi)} okumanız gerekiyor.`),
        K.AHENKLER[ahenk].dogrula ? h("p.ak-not", h("span.dogrula", "doğrulanmalı"), " Bu ahengin karşılığı için kaynaklar yetersiz.") : null,
        h("button.btn.primary", { type: "button", onclick: () => { Snd.unlock(); Klarnet.hazirla(); Klarnet.ezgi([{ f, t: 0, d: 1.1 }], { gecikme: 0.02 }); } }, "▶ Duyulan sesi çal"),
      ].filter(Boolean));
    }
    function aralikAdi(d) {
      const ad = { 0: "aynı", 1: "yarım ses tiz", 2: "büyük ikili tiz", 3: "küçük üçlü tiz", 4: "büyük üçlü tiz", 5: "tam dörtlü tiz", 7: "tam beşli tiz", "-1": "yarım ses pes", "-2": "büyük ikili pes", "-3": "küçük üçlü pes", "-4": "büyük üçlü pes", "-5": "tam dörtlü pes", "-7": "tam beşli pes" };
      return ad[d] ? "bir " + ad[d] : `${Math.abs(d)} yarım ses ${d > 0 ? "tiz" : "pes"}`;
    }
    guncelle();
    return {};
  };
  G.aktarim = [{ click: "▶ Duyulan sesi çal" }];
})();
