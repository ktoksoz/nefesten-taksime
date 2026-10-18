/* 3. bölüm: Çalgıyı tanı — parçalar, Sol ve Si♭, Albert ve Boehm, kamış seçimi */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;
  const NS = "http://www.w3.org/2000/svg";
  const s = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); kids.forEach((k) => k && el.append(k)); return el; };

  /* ================= Parçalar ================= */
  // yatay çizim: ağızlık solda, kalak sağda. x: takılı hâldeki yeri, ayrik: sökük hâldeki kayma
  const PARCALAR = [
    { id: "agizlik", ad: "Ağızlık, kamış ve kelepçe", metin: "Kamış ağızlığın düz yüzüne oturur, kelepçe onu yerinde tutar. Ses burada başlar.", x0: 0, x1: 92, sira: 4 },
    { id: "barilet", ad: "Barilet", metin: "Ağızlıkla üst gövde arasındaki kısa parça. Biraz dışarı çekilince klarnet pesleşir: akordun ilk ayarı buradadır.", x0: 92, x1: 150, sira: 3 },
    { id: "ust", ad: "Üst gövde", metin: "Sol elin delikleri ve anahtarları, arkada başparmak deliği ve register anahtarı.", x0: 150, x1: 470, sira: 2 },
    { id: "alt", ad: "Alt gövde", metin: "Sağ elin delikleri, yan anahtarlar ve serçe parmak anahtarları.", x0: 470, x1: 790, sira: 1 },
    { id: "kalak", ad: "Kalak", metin: "Genişleyen çan. En pes notaların sesini dışarı yayar.", x0: 790, x1: 880, sira: 0 },
  ];
  Demos.parcalar = (stage) => {
    const svg = s("svg", { class: "pc-svg", viewBox: "-110 -80 1100 220", role: "img", "aria-label": "Klarnetin parçaları" });
    const fill = h("div.fill.pc-yer"); fill.append(svg);
    const bilgi = h("div.tc-bilgi");
    const ctl = h("div.controls");
    stage.append(fill, bilgi, ctl);
    let takili = false;
    const gruplar = PARCALAR.map((p, i) => {
      const g = s("g", { class: "pc-parca", tabindex: "0", role: "button", "aria-label": p.ad });
      const y = 30, r = p.id === "kalak" ? 0 : 22;
      if (p.id === "agizlik") {
        g.append(s("path", { class: "kc-agiz", d: `M2 ${y - 10} Q-4 ${y} 2 ${y + 10} L70 ${y + 21} L92 ${y + 21} L92 ${y - 21} L70 ${y - 21} Z` }));
        g.append(s("path", { class: "kc-kamis", d: `M4 ${y + 9} L70 ${y + 18}` }));
        g.append(s("rect", { class: "kc-bilezik", x: 50, y: y - 19, width: 10, height: 38, rx: 2 }));
      } else if (p.id === "kalak") {
        g.append(s("path", { class: "kc-tahta", d: `M${p.x0} ${y - 18} C${p.x0 + 30} ${y - 20} ${p.x0 + 60} ${y - 34} ${p.x1} ${y - 48} L${p.x1} ${y + 48} C${p.x0 + 60} ${y + 34} ${p.x0 + 30} ${y + 20} ${p.x0} ${y + 18} Z` }));
      } else {
        g.append(s("rect", { class: "kc-tahta", x: p.x0, y: y - r, width: p.x1 - p.x0, height: 2 * r }));
        g.append(s("rect", { class: "kc-bilezik", x: p.x0, y: y - r - 2, width: 6, height: 2 * r + 4, rx: 1.5 }));
        g.append(s("rect", { class: "kc-bilezik", x: p.x1 - 6, y: y - r - 2, width: 6, height: 2 * r + 4, rx: 1.5 }));
        if (p.id === "ust" || p.id === "alt") {
          const delik = p.id === "ust" ? [210, 260, 310] : [540, 600, 660];
          delik.forEach((x) => g.append(s("circle", { class: "kc-halka", cx: x, cy: y, r: 8 })));
          g.append(s("path", { class: "kc-mil", d: `M${p.x0 + 20} ${y - 22} L${p.x1 - 20} ${y - 22}` }));
        }
      }
      g.append(s("text", { class: "pc-ad", x: (p.x0 + p.x1) / 2, y: 124, "text-anchor": "middle" }, document.createTextNode(p.ad.split(",")[0])));
      svg.append(g);
      g.addEventListener("click", () => sec(i));
      g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sec(i); } });
      return g;
    });
    function yerlestir(anim) {
      PARCALAR.forEach((p, i) => {
        const g = gruplar[i];
        const kay = takili ? 0 : (i - 2) * 34; // sökükken parçalar arası boşluk
        g.style.transition = anim ? `transform .6s cubic-bezier(.3,.7,.2,1) ${(4 - p.sira) * 0.35}s` : "none";
        g.style.transform = `translateX(${kay}px)`;
      });
    }
    function sec(i) {
      gruplar.forEach((g, j) => g.classList.toggle("on", j === i));
      bilgi.innerHTML = ""; bilgi.append(h("b", PARCALAR[i].ad), h("p", PARCALAR[i].metin));
    }
    const tak = h("button.btn.primary", { type: "button", onclick: () => { takili = !takili; tak.textContent = takili ? "Sök" : "Tak"; yerlestir(true); bilgi.innerHTML = ""; bilgi.append(h("b", takili ? "Takma sırası" : "Sökük"), h("p", takili ? "Alt gövde ve kalak, sonra üst gövde, barilet, ağızlık ve en son kamış ile kelepçe." : "Parçalara dokunun.")); } }, "Tak");
    ctl.append(tak, h("span.mute", "Parçalara dokunun"));
    yerlestir(false);
    sec(0);
    return {};
  };
  G.parcalar = [{ click: "aria:Barilet" }, { wait: 700 }, { click: "=Tak" }];

  /* ================= Sol ve Si♭ ================= */
  Demos.solsib = (stage) => {
    const yer = h("div.ss-yer");
    const sol = h("div.ss-k", { style: { height: "92%" } }), sib = h("div.ss-k", { style: { height: (92 * 66 / 76.5).toFixed(1) + "%" } });
    const solEt = h("div.ss-et"), sibEt = h("div.ss-et");
    yer.append(h("div.ss-sutun", sol, solEt), h("div.ss-sutun", sib, sibEt));
    const ctl = h("div.controls");
    stage.append(yer, ctl);
    const kSol = KlarnetCiz(sol, { yon: "dikey", etiket: false, salt: true });
    const kSib = KlarnetCiz(sib, { yon: "dikey", etiket: false, salt: true, tur: "sib" });
    let nota = 72;
    const NOTALAR = [[60, "Do4"], [67, "Sol4"], [72, "Do5"], [79, "Sol5"]];
    function guncelle() {
      kSol.goster(nota, { sessiz: true }); kSib.goster(nota, { sessiz: true });
      solEt.innerHTML = `<b>Sol klarnet</b><span>≈ 76 cm</span><span>yazılı ${K.notaAdi(nota)} → <b>${K.notaAdi(K.duyulan(nota, "sol"))}</b></span><span>${fmtHz(K.yaziliFrekans(nota, "sol"))}</span>`;
      sibEt.innerHTML = `<b>Si♭ klarnet</b><span>≈ 66 cm</span><span>yazılı ${K.notaAdi(nota)} → <b>${K.notaAdi(K.duyulan(nota, "sib")).replace("La♯", "Si♭")}</b></span><span>${fmtHz(K.yaziliFrekans(nota, "sib"))}</span>`;
    }
    const sg = seg(NOTALAR.map(([m, a]) => [m, "Yazılı " + a]), nota, (m) => { nota = m; guncelle(); }, "Yazılı nota");
    ctl.append(sg,
      h("button.btn", { type: "button", onclick: () => D.notaCal(nota, 1.1, "sol") }, "▶ Sol klarnet"),
      h("button.btn", { type: "button", onclick: () => D.notaCal(nota, 1.1, "sib") }, "▶ Si♭ klarnet"),
      h("button.btn", { type: "button", onclick: () => { D.notaCal(nota, 1.0, "sol"); setTimeout(() => D.notaCal(nota, 1.0, "sib"), 1150); } }, "▶ Art arda"));
    guncelle();
    return {};
  };
  G["sol-ve-sib"] = [{ click: "▶ Sol klarnet" }, { wait: 1300 }, { click: "▶ Si♭ klarnet" }];

  /* ================= Albert ve Boehm ================= */
  // Boehm pozisyonları: WFG Boehm temel tablosu. Albert: js/data/parmaklar.js
  const BOEHM = {
    58: { f: "T L1 L2 L3 R1", not: "Boehm'de sağ el 1. parmak Si♭'yi verir" },
    59: { f: "T L1 L2 L3 R2", not: "Boehm'de Si için sağ el 2. parmak" },
    63: { f: "T L1 L2 S4", not: "" },
    65: { f: "T", not: "Boehm'de Fa yalnızca başparmakla" },
    66: { f: "L1", not: "Boehm'de Fa♯ başparmaksız 1. parmakla" },
    77: { f: "R T L1 L2 L3 R1", not: "" },
    78: { f: "R T L1 L2 L3 R2", not: "" },
    84: { f: "R T", not: "" },
  };
  const ADLAR = { T: "başparmak deliği", R: "register", A: "La anahtarı", Gs: "yan Sol♯", LEb: "sol Mi♭ kolu", LCs: "sol serçe Do♯", LE: "sol serçe Mi", LFs: "sol serçe Fa♯", S1: "yan 1", S3: "yan 3", S4: "yan 4 (Mi♭)", RBb: "sağ Si♭ kolu", Ra: "", RGs: "serçe Sol♯", RF: "serçe Fa" };
  function sema(fstr, fark) {
    const k = typeof fstr === "string" ? parseParmak(fstr) : fstr;
    const w = h("div.sema");
    const delik = (id, et) => h("span.sd" + (k[id] >= 1 ? ".kapali" : k[id] ? ".yarim" : "") + (fark.has(id) ? ".fark" : ""), { title: et, "aria-label": et + (k[id] >= 1 ? " kapalı" : " açık") });
    w.append(
      h("div.sd-arka", delik("T", "başparmak"), h("span.sd-reg" + (k.R ? ".kapali" : "") + (fark.has("R") ? ".fark" : ""), "R")),
      h("div.sd-el", delik("L1", "sol 1"), delik("L2", "sol 2"), delik("L3", "sol 3")),
      h("div.sd-el", delik("R1", "sağ 1"), delik("R2", "sağ 2"), delik("R3", "sağ 3")),
    );
    const anahtar = Object.keys(k).filter((id) => k[id] >= 1 && !["T", "R", "L1", "L2", "L3", "R1", "R2", "R3", "Ra"].includes(id));
    w.append(h("div.sd-anahtar", anahtar.length ? anahtar.map((id) => h("span.chip" + (fark.has(id) ? ".fark" : ""), ADLAR[id] || id)) : h("span.mute", "ek anahtar yok")));
    return w;
  }
  Demos.albertboehm = (stage) => {
    const ust = h("div.ab-yer");
    const ctl = h("div.controls");
    stage.append(ust, ctl);
    const notalar = Object.keys(BOEHM).map(Number);
    let m = 59;
    function guncelle() {
      const a = parmak(m), b = BOEHM[m];
      const ka = a.kapali, kb = parseParmak(b.f);
      const fark = new Set([...Object.keys(ka), ...Object.keys(kb)].filter((id) => id !== "Ra" && (ka[id] || 0) !== (kb[id] || 0)));
      ust.innerHTML = "";
      ust.append(
        h("div.ab-sutun", h("h4", "Albert"), sema(ka, fark), h("p.mute", a.ana)),
        h("div.ab-sutun", h("h4", "Boehm"), sema(kb, fark), h("p.mute", b.not || "")),
      );
      ust.prepend(h("div.ab-nota", h("b", K.notaAdi(m)), h("span", "yazılı nota")));
    }
    ctl.append(seg(notalar.map((x) => [x, K.notaAdi(x).replace("La♯", "Si♭").replace("Re♯", "Mi♭")]), m, (x) => { m = x; guncelle(); D.notaCal(m, 0.6); }, "Nota"));
    guncelle();
    return {};
  };
  G["albert-boehm"] = [{ click: "=Fa♯4" }, { wait: 1200 }, { click: "=Si3" }];

  /* ================= Kamış seçimi ================= */
  // modelde ölçülen salınım eşiği (dudak 0,5): sertlik 0 → 0,44, 0,25 → 0,50, 0,5 → 0,60, 0,75 → 0,76, 1 → 1,02
  const ESIK = [[0, 0.44], [0.25, 0.5], [0.5, 0.6], [0.75, 0.76], [1, 1.02]];
  const UST = [[0, 0.82], [0.25, 0.96], [0.5, 1.14], [0.75, 1.4], [1, 1.4]];
  const ara = (T, x) => { for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const [a, va] = T[i - 1], [b, vb] = T[i]; return va + ((x - a) / (b - a)) * (vb - va); } return T[T.length - 1][1]; };
  Demos.kamissec = (stage) => {
    const { cv } = D.tuval(stage, "Kamış sertliği ve gereken nefes");
    const ctl = h("div.controls");
    stage.append(ctl);
    let no = 2.5, nefes = 0.75, v = null, st;
    const sert = () => clamp((no - 1.5) / 2.5, 0, 1);
    const sl1 = slider({ label: "Kamış sertliği", min: 1.5, max: 4, step: 0.5, value: no, fmt: (x) => fmtNum(x, 1), oninput: (x) => { no = x; v && v.set("sertlik", sert(), 0.05); draw(); } });
    const sl2 = slider({ label: "Nefes", min: 0.3, max: 1.25, step: 0.01, value: nefes, fmt: (x) => fmtNum(x * 100) + "%", oninput: (x) => { nefes = x; v && v.set("nefes", x, 0.04); draw(); } });
    const ufle = h("button.btn.primary", { type: "button", onclick: () => { if (v) { v.stop(); v = null; ufle.textContent = "▶ Üfle"; } else { Snd.unlock(); Klarnet.hazirla(); v = Klarnet.ses({ frekans: K.yaziliFrekans(67, "sol"), sertlik: sert() }); if (v) { Snd.own(v); v.ufle(nefes); ufle.textContent = "■ Durdur"; } } draw(); } }, "▶ Üfle");
    ctl.append(ufle, sl1, sl2);
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = 70, x1 = w - 30, y0 = 30, y1 = hh - 50;
      const X = (n) => x0 + ((n - 1.5) / 2.5) * (x1 - x0), Y = (b) => y1 - ((b - 0.3) / 1.0) * (y1 - y0);
      // ses veren bölge
      ctx.fillStyle = rgba(C.guclu, 0.16);
      ctx.beginPath();
      for (let i = 0; i <= 50; i++) { const n = 1.5 + 2.5 * i / 50; const y = Y(ara(ESIK, (n - 1.5) / 2.5)); i ? ctx.lineTo(X(n), y) : ctx.moveTo(X(n), y); }
      for (let i = 50; i >= 0; i--) { const n = 1.5 + 2.5 * i / 50; ctx.lineTo(X(n), Y(Math.min(1.3, ara(UST, (n - 1.5) / 2.5)))); }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.guclu; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i <= 50; i++) { const n = 1.5 + 2.5 * i / 50; const y = Y(ara(ESIK, (n - 1.5) / 2.5)); i ? ctx.lineTo(X(n), y) : ctx.moveTo(X(n), y); } ctx.stroke();
      text(ctx, "ses veren bölge", X(2.1), Y(0.78), { size: 12, color: C.guclu, weight: 600 });
      text(ctx, "eşik: kamışın titreşmeye başladığı nefes", X(3.9), Y(ara(ESIK, 0.95)) + 18, { size: 11, color: C.guclu, align: "right" });
      text(ctx, "yumuşak kamış güçlü nefeste kapanır", X(1.6), Y(0.98) - 6, { size: 11, color: C.muted });
      // eksenler
      ctx.strokeStyle = rgba(C.ink, 0.3); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (let n = 1.5; n <= 4; n += 0.5) text(ctx, fmtNum(n, 1), X(n), y1 + 18, { size: 11, align: "center", color: C.ink2 });
      text(ctx, "kamış numarası", (x0 + x1) / 2, y1 + 38, { size: 11, align: "center", color: C.muted });
      text(ctx, "nefes", x0 - 10, y0 + 4, { size: 11, align: "right", color: C.muted });
      // nokta
      const ses = nefes >= ara(ESIK, sert()) && nefes <= ara(UST, sert());
      ctx.save(); ctx.shadowColor = ses ? C.durak : C.ink; ctx.shadowBlur = 12; ctx.fillStyle = ses ? C.durak : C.ink2;
      ctx.beginPath(); ctx.arc(X(no), Y(nefes), 7, 0, 7); ctx.fill(); ctx.restore();
    }
    st = canvas(cv, draw);
    return { leave() { if (v) { v.stop(); v = null; ufle.textContent = "▶ Üfle"; } } };
  };
  G["kamis-secimi"] = [{ click: "▶ Üfle" }, { slide: "label:Kamış sertliği", to: 4 }, { wait: 1000 }, { slide: "label:Kamış sertliği", to: 1.5 }, { wait: 800 }, { click: "■ Durdur" }];
})();
