/* Sitenin tek klarnet bileşeni: Albert sistem Sol klarnetin stilize SVG çizimi.
   - Deliğe ya da anahtara tıklayınca kapanır/açılır ve o pozisyonun sesi çalar.
     Uzun basış, sağ tık ya da klavyede H: delik yarım kapanır.
   - Ağızlığı basılı tutunca klarnet üflenir; üflerken parmakları değiştirmek sesi canlı değiştirir.
   - Ters yön: goster(nota) parmakları o pozisyona taşır (180 ms'lik geçiş).
   - Yön: "dikey" (telefonda ve dar sahnelerde) ya da "yatay"; "oto" sahnenin en-boy oranına bakar.
   Çizim ölçülü değil, okunaklı olsun diye stilize: delik aralıkları el ve dokunma için büyütüldü. */
(function () {
  const { h } = L;
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}, ...kids) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
    kids.flat().forEach((k) => k && el.append(k));
    return el;
  };
  const W = 200, H = 880, CX = 100;

  // Anahtarların çizimdeki yeri (dikey koordinatlar). tip: delik | klape | kol
  const YER = {
    R: { tip: "klape", x: 28, y: 206, w: 16, hh: 26, arka: true },
    T: { tip: "delik", x: 36, y: 250, r: 10, arka: true },
    A: { tip: "klape", x: 112, y: 196, w: 22, hh: 12, r: 6 },
    Gs: { tip: "kol", x: 136, y: 228, w: 12, hh: 30 },
    L1: { tip: "delik", x: CX, y: 240, r: 12 },
    L2: { tip: "delik", x: CX, y: 300, r: 12 },
    LEb: { tip: "kol", x: 128, y: 324, w: 9, hh: 26 },
    L3: { tip: "delik", x: CX, y: 362, r: 12 },
    LCs: { tip: "klape", x: 50, y: 406, w: 22, hh: 13, r: 6 },
    LE: { tip: "klape", x: 46, y: 426, w: 22, hh: 13, r: 6 },
    LFs: { tip: "klape", x: 50, y: 446, w: 22, hh: 13, r: 6 },
    S1: { tip: "kol", x: 144, y: 520, w: 12, hh: 22 },
    S3: { tip: "kol", x: 144, y: 548, w: 12, hh: 22 },
    S4: { tip: "kol", x: 144, y: 576, w: 12, hh: 22 },
    R1: { tip: "delik", x: CX, y: 548, r: 12 },
    Ra: { tip: "klape", x: 66, y: 590, w: 16, hh: 11, r: 5 },
    R2: { tip: "delik", x: CX, y: 612, r: 12 },
    RBb: { tip: "kol", x: 128, y: 640, w: 9, hh: 26 },
    R3: { tip: "delik", x: CX, y: 676, r: 12 },
    RGs: { tip: "klape", x: 50, y: 728, w: 22, hh: 13, r: 6 },
    RF: { tip: "klape", x: 46, y: 750, w: 22, hh: 13, r: 6 },
  };
  const SIRA = ["R", "T", "A", "Gs", "L1", "L2", "LEb", "L3", "LCs", "LE", "LFs", "S1", "S3", "S4", "R1", "Ra", "R2", "RBb", "R3", "RGs", "RF"];
  const DELIK = new Set(["T", "L1", "L2", "L3", "R1", "R2", "R3"]);

  function govde() {
    const g = s("g", { class: "kc-govde", "aria-hidden": "true" });
    // ağızlık: gaga ucu yukarıda, kamış arka yüzde (kenarda ince açık çizgi)
    g.append(
      s("path", { class: "kc-agiz", d: `M${CX - 9} 6 Q${CX} 0 ${CX + 9} 6 L${CX + 16} 70 L${CX + 17} 96 L${CX - 17} 96 L${CX - 16} 70 Z` }),
      s("path", { class: "kc-kamis", d: `M${CX - 8} 8 L${CX - 15} 72` }),
      s("rect", { class: "kc-bilezik", x: CX - 19, y: 58, width: 38, height: 9, rx: 2 }), // kelepçe
      s("rect", { class: "kc-bilezik", x: CX - 19, y: 72, width: 38, height: 5, rx: 2 }),
      // barilet
      s("path", { class: "kc-tahta", d: `M${CX - 19} 96 L${CX + 19} 96 L${CX + 18} 148 L${CX - 18} 148 Z` }),
      s("rect", { class: "kc-bilezik", x: CX - 21, y: 94, width: 42, height: 6, rx: 1.5 }),
      s("rect", { class: "kc-bilezik", x: CX - 21, y: 144, width: 42, height: 6, rx: 1.5 }),
      // üst gövde
      s("rect", { class: "kc-tahta", x: CX - 17, y: 150, width: 34, height: 322 }),
      s("rect", { class: "kc-bilezik", x: CX - 20, y: 466, width: 40, height: 10, rx: 1.5 }),
      // alt gövde
      s("rect", { class: "kc-tahta", x: CX - 17.5, y: 476, width: 35, height: 318 }),
      s("rect", { class: "kc-bilezik", x: CX - 21, y: 790, width: 42, height: 8, rx: 1.5 }),
      // kalak (çan)
      s("path", { class: "kc-tahta", d: `M${CX - 18} 798 C${CX - 20} 830 ${CX - 34} 860 ${CX - 48} 874 L${CX + 48} 874 C${CX + 34} 860 ${CX + 20} 830 ${CX + 18} 798 Z` }),
      s("path", { class: "kc-bilezik-cizgi", d: `M${CX - 49} 874 L${CX + 49} 874` }),
      // klape milleri (ince gümüş çizgiler)
      s("path", { class: "kc-mil", d: `M${CX + 24} 190 L${CX + 24} 450 M${CX - 24} 400 L${CX - 24} 460 M${CX + 26} 500 L${CX + 26} 770 M${CX - 26} 580 L${CX - 26} 770` }),
      // arka yüz şeridi: başparmak deliği ve register anahtarı
      s("rect", { class: "kc-arka", x: 18, y: 186, width: 36, height: 88, rx: 8 }),
    );
    return g;
  }

  function cizAnahtar(id) {
    const y = YER[id];
    const g = s("g", { class: `kc-k kc-${y.tip}`, "data-k": id, tabindex: 0, role: "button", "aria-pressed": "false", "aria-label": P().ANAHTARLAR[id].ad });
    if (y.tip === "delik") {
      g.append(
        s("circle", { class: "kc-hit", cx: y.x, cy: y.y, r: y.r + 9 }),
        s("circle", { class: "kc-halka", cx: y.x, cy: y.y, r: y.r }),
        s("circle", { class: "kc-dolu", cx: y.x, cy: y.y, r: y.r - 2.2 }),
        // yarım: çapraz kesimli yarım disk
        s("path", { class: "kc-yarim", d: yarimYol(y.x, y.y, y.r - 2.2) }),
      );
    } else {
      const rx = y.r ?? (y.tip === "kol" ? 4 : 3);
      g.append(
        s("rect", { class: "kc-hit", x: y.x - y.w / 2 - 7, y: y.y - y.hh / 2 - 7, width: y.w + 14, height: y.hh + 14, rx: 6 }),
        s("rect", { class: "kc-yuz", x: y.x - y.w / 2, y: y.y - y.hh / 2, width: y.w, height: y.hh, rx }),
      );
    }
    g.append(s("title", {}, document.createTextNode(P().ANAHTARLAR[id].ad)));
    return g;
  }
  function yarimYol(x, y, r) {
    // kesim çizgisi çapraz (sol üstten sağ alta), dolu yarı alt-sol
    const a1 = (-45 * Math.PI) / 180, a2 = (135 * Math.PI) / 180;
    return `M${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} A${r} ${r} 0 0 1 ${x + r * Math.cos(a2)} ${y + r * Math.sin(a2)} Z`;
  }
  const P = () => window; // parmaklar.js küresel adları (ANAHTARLAR, tahmin, parmak...)

  /* opts: { yon, sesli, etiket, tur, onDegis, salt (yalnız gösterim) } */
  function KlarnetCiz(host, opts = {}) {
    const o = { yon: "oto", sesli: true, etiket: true, tur: "sol", ...opts };
    const wrap = h("div.kc", { "data-yon": "dikey" });
    const svg = s("svg", { class: "kc-svg", role: "group", "aria-label": "Klarnet parmak pozisyonu" });
    const ic = s("g", {});
    ic.append(govde());
    const keys = {};
    SIRA.forEach((id, i) => { const g = cizAnahtar(id); g.style.setProperty("--d", i * 9 + "ms"); keys[id] = g; ic.append(g); });
    // ağızlığa basılı tutunca üfle
    const agizHit = s("path", { class: "kc-agiz-hit", d: `M${CX - 26} 0 L${CX + 26} 0 L${CX + 26} 100 L${CX - 26} 100 Z`, tabindex: 0, role: "button", "aria-label": "Ağızlık: basılı tutunca üfler" });
    ic.append(agizHit);
    svg.append(ic);
    wrap.append(svg);
    const readout = h("div.kc-etiket", { "aria-live": "polite" });
    if (o.etiket) wrap.append(readout);
    host.append(wrap);

    let kapali = {};
    let yon = "dikey";
    function yerlesim() {
      let y = o.yon;
      if (y === "oto") {
        const r = host.getBoundingClientRect();
        y = r.width > r.height * 1.25 ? "yatay" : "dikey";
      }
      if (y === yon && svg.getAttribute("viewBox")) return;
      yon = y;
      wrap.dataset.yon = y;
      if (y === "yatay") { svg.setAttribute("viewBox", `0 0 ${H} ${W}`); ic.setAttribute("transform", `translate(0 ${W}) rotate(-90)`); }
      else { svg.setAttribute("viewBox", `0 0 ${W} ${H}`); ic.removeAttribute("transform"); }
    }
    yerlesim();
    if (o.yon === "oto") new ResizeObserver(yerlesim).observe(host);

    function boya() {
      for (const id of SIRA) {
        const v = kapali[id] || 0;
        const g = keys[id];
        g.classList.toggle("kapali", v >= 1);
        g.classList.toggle("yarim", v > 0 && v < 1);
        g.setAttribute("aria-pressed", v >= 1 ? "true" : v > 0 ? "mixed" : "false");
      }
    }
    function etiket() {
      if (!o.etiket) return;
      const t = P().tahmin(kapali);
      readout.innerHTML = "";
      const yazili = t.midi;
      const isim = K.notaAdi(yazili);
      const f = K.yaziliFrekans(yazili, o.tur) * Math.pow(2, t.cent / 1200);
      const centTxt = Math.abs(t.cent) >= 1 ? ` ${t.cent > 0 ? "+" : "−"}${L.fmtNum(Math.abs(t.cent))} cent` : "";
      readout.append(...[
        h("b", isim + centTxt),
        h("span", `duyulan ${L.fmtHz(f)}`),
        t.kaynak === "tahmin" ? h("span.kc-yaklasik", "tabloda yok: yaklaşık") : t.kaynak === "ceyrek" ? h("span.kc-dogrula", "çeyrek ses · doğrulanmalı") : t.kaynak === "alt" ? h("span", "alternatif pozisyon") : null,
      ].filter(Boolean));
    }
    function frekans() { const t = P().tahmin(kapali); return K.yaziliFrekans(t.midi, o.tur) * Math.pow(2, t.cent / 1200); }

    // --- ses ---
    let ufleyen = null, kisaSes = null;
    function sesGuncelle() {
      if (ufleyen) ufleyen.set("frekans", frekans(), 0.012);
    }
    function kisaCal() {
      if (!o.sesli || ufleyen) return;
      if (kisaSes) kisaSes.stop();
      const c = Snd.ready(); if (!c) return;
      Klarnet.hazirla();
      kisaSes = Klarnet.ezgi([{ f: frekans(), t: 0, d: 0.55 }], { gecikme: 0.02 });
    }
    function ufle(on) {
      o.onUfle && o.onUfle(on, P().tahmin(kapali));
      if (o.sessizUfle) return;
      if (on && !ufleyen) {
        const c = Snd.ready(); if (!c) return;
        Klarnet.hazirla();
        if (kisaSes) { kisaSes.stop(); kisaSes = null; }
        ufleyen = Klarnet.ses({ frekans: frekans() });
        if (!ufleyen) return;
        Snd.own(ufleyen);
        ufleyen.ufle(o.nefes || 0.74);
        wrap.classList.add("ufluyor");
      } else if (!on && ufleyen) {
        ufleyen.stop(); ufleyen = null; wrap.classList.remove("ufluyor");
      }
    }
    agizHit.addEventListener("pointerdown", (e) => { if (o.salt) return; e.preventDefault(); agizHit.setPointerCapture(e.pointerId); ufle(true); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((t) => agizHit.addEventListener(t, () => ufle(false)));
    agizHit.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); e.stopPropagation(); ufle(true); } });
    agizHit.addEventListener("keyup", (e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); ufle(false); } });

    function degisti(kaynak) {
      boya(); etiket(); sesGuncelle();
      o.onDegis && o.onDegis({ ...kapali }, P().tahmin(kapali), kaynak);
    }
    function ayarla(id, v) {
      if (v) kapali[id] = v; else delete kapali[id];
      // alternatif anahtar R2/R3 ile kapanır
      if (id === "R2" || id === "R3") { if ((kapali.R2 || 0) >= 1 || (kapali.R3 || 0) >= 1) kapali.Ra = 1; else delete kapali.Ra; }
    }
    // --- anahtar etkileşimi ---
    SIRA.forEach((id) => {
      const g = keys[id];
      let uzunT = 0, uzun = false;
      g.addEventListener("pointerdown", (e) => {
        if (o.salt) return;
        e.preventDefault();
        uzun = false;
        if (DELIK.has(id)) uzunT = setTimeout(() => { uzun = true; ayarla(id, (kapali[id] || 0) === 0.5 ? 0 : 0.5); degisti("yarim"); kisaCal(); }, 420);
      });
      g.addEventListener("pointerup", (e) => {
        if (o.salt) return;
        clearTimeout(uzunT);
        if (uzun) return;
        ayarla(id, (kapali[id] || 0) >= 1 ? 0 : 1);
        degisti("tik"); kisaCal();
      });
      g.addEventListener("pointerleave", () => clearTimeout(uzunT));
      g.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (o.salt || !DELIK.has(id)) return;
        clearTimeout(uzunT); uzun = true;
        ayarla(id, (kapali[id] || 0) === 0.5 ? 0 : 0.5); degisti("yarim"); kisaCal();
      });
      g.addEventListener("keydown", (e) => {
        if (o.salt) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); ayarla(id, (kapali[id] || 0) >= 1 ? 0 : 1); degisti("tik"); kisaCal(); }
        if ((e.key === "h" || e.key === "H") && DELIK.has(id)) { e.stopPropagation(); ayarla(id, (kapali[id] || 0) === 0.5 ? 0 : 0.5); degisti("yarim"); kisaCal(); }
      });
    });

    /* Ters yön: bir pozisyonu göster. hedef: MIDI (yazılı), pozisyon dizgesi ("T L1 L2") ya da {kimlik: değer} */
    function goster(hedef, { ses = false, sessiz = false } = {}) {
      let k;
      if (typeof hedef === "number") { const p = P().parmak(hedef); k = p ? { ...p.kapali } : {}; }
      else if (typeof hedef === "string") k = P().parseParmak(hedef);
      else k = { ...hedef };
      kapali = k;
      boya(); etiket(); sesGuncelle();
      if (!sessiz) o.onDegis && o.onDegis({ ...kapali }, P().tahmin(kapali), "goster");
      if (ses) kisaCal();
    }
    /* Hedef pozisyonu vurgula (öğretim): basılması gereken anahtarlar nabız atar, fazladan basılanlar kırmızı çerçeve */
    function vurgula(hedef) {
      const k = hedef == null ? null : typeof hedef === "number" ? (P().parmak(hedef) || {}).kapali : typeof hedef === "string" ? P().parseParmak(hedef) : hedef;
      for (const id of SIRA) keys[id].classList.toggle("hedef", !!(k && k[id] && id !== "Ra"));
    }
    function isaretle(sinif) { wrap.classList.remove("dogru", "yanlis"); if (sinif) { void wrap.offsetWidth; wrap.classList.add(sinif); } }

    boya(); etiket();
    return {
      el: wrap, svg, goster, vurgula, isaretle, ufle, frekans,
      get kapali() { return { ...kapali }; },
      get tahmin() { return P().tahmin(kapali); },
      set tur(t) { o.tur = t; etiket(); sesGuncelle(); },
      set yon(y) { o.yon = y; yerlesim(); },
      temizle() { kapali = {}; boya(); etiket(); },
    };
  }
  window.KlarnetCiz = KlarnetCiz;
})();
