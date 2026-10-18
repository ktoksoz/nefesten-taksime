/* 1. bölüm: Klarnet ve Türk müziği — zaman çizelgesi, iki dünya, ustalar */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, seg } = L;
  const G = window.GuideScenarios;

  /* ================= Zaman çizelgesi ================= */
  const DURAKLAR = [
    { yil: 1700, ad: "Denner ve register anahtarı", metin: "Johann Christoph Denner chalumeau'ya register anahtarı ekler (1700 civarı). Klarnet artık sesini bir onikili yukarı taşıyabilir.", ses: "ikisi" },
    { yil: 1710, ad: "İlk belge", metin: "\"Clarinet\" adını taşıyan bilinen en eski belge: Jacob Denner'in 1710 tarihli bir faturası." },
    { yil: 1812, ad: "Müller'in 13 anahtarı", metin: "Iwan Müller her yarım sesi çalabilen 13 anahtarlı klarneti geliştirir." },
    { yil: 1826, ad: "Mızıka-i Hümâyun", metin: "Yeniçeri Ocağı kaldırılır, Batı tarzı saray bandosu Mızıka-i Hümâyun kurulur. Klarnet Osmanlı'ya bu bandoyla girer." },
    { yil: 1828, ad: "Donizetti", metin: "Giuseppe Donizetti 17 Eylül 1828'de bandonun başına geçer." },
    { yil: 1841, ad: "Boehm sistemi", metin: "Klosé ve Buffet, 1839–1843 arasında Boehm sistemini geliştirir. Bugün dünyada en yaygın klarnet sistemi budur.", yaklasik: true },
    { yil: 1850, ad: "Albert sistemi", metin: "Müller'in klarnetine Sax'ın halkaları eklenir: Albert sistemi (1840'lar). Türkiye'de Sol klarnetlerin çoğu bu sistemdedir.", yaklasik: true },
    { yil: 2026, ad: "Bugün", metin: "Sol klarnet Türk müziğinin hem şarkı ve fasıl eşliğinde hem de düğün ve oyun havalarında temel çalgılarından biri." },
  ];
  // tek register ile çalınabilen bir ezgi ve onu register anahtarıyla tekrarlayan klarnet
  const ALT = [52, 55, 57, 59, 60, 62, 64, 62, 60, 57, 55, 52];
  Demos.tarihce = (stage) => {
    const { cv } = D.tuval(stage, "Klarnetin zaman çizelgesi");
    const bilgi = h("div.tc-bilgi");
    const ctl = h("div.controls");
    stage.append(bilgi, ctl);
    let st, sec = 0, calan = null, isik = -1;
    // parçalı eksen: 1690–1720 | 1800–1860 | 2010–2030 (aradaki boşluklar kesik çizgiyle)
    const PARCA = [[1690, 1722, 0.2], [1800, 1862, 0.62], [2012, 2032, 0.18]];
    const yX = (y, g) => {
      const W = g.x1 - g.x0 - 2 * 26;
      let x = g.x0;
      for (let i = 0; i < PARCA.length; i++) {
        const [a, b, f] = PARCA[i];
        if (y <= b) return x + ((Math.max(a, y) - a) / (b - a)) * W * f;
        x += W * f + 26;
      }
      return g.x1;
    };
    function geo() { const { w, h: hh } = st; return { w, hh, x0: 30, x1: w - 30, y: hh * 0.52, dar: w < 560 }; }
    // etiket katmanları: çakışmasın diye yukarı/aşağı iki sıra
    const KAT = [-1, 1, -2, 2, -1, 1, -2, 2];
    function draw() {
      if (!st || !st.w) return;
      const g = geo(), ctx = st.ctx;
      ctx.clearRect(0, 0, g.w, g.hh);
      PARCA.forEach(([a, b], i) => {
        ctx.strokeStyle = rgba(C.silver, 0.4); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(yX(a, g), g.y); ctx.lineTo(yX(b, g), g.y); ctx.stroke();
        if (i < PARCA.length - 1) {
          ctx.setLineDash([2, 4]); ctx.strokeStyle = rgba(C.silver, 0.3);
          ctx.beginPath(); ctx.moveTo(yX(b, g) + 4, g.y); ctx.lineTo(yX(PARCA[i + 1][0], g) - 4, g.y); ctx.stroke(); ctx.setLineDash([]);
        }
        for (let y = Math.ceil(a / 10) * 10; y <= b; y += 10) {
          const x = yX(y, g), big = y % 50 === 0;
          ctx.strokeStyle = rgba(C.ink, big ? 0.4 : 0.15); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x, g.y - (big ? 7 : 3)); ctx.lineTo(x, g.y + (big ? 7 : 3)); ctx.stroke();
          if (big) text(ctx, String(y), x, g.y + 22, { size: 11, align: "center", color: C.muted });
        }
      });
      const fs = g.dar ? 11 : 12;
      DURAKLAR.forEach((d, i) => {
        const x = yX(d.yil, g), on = i === sec, kat = KAT[i];
        const yy = g.y + kat * (g.dar ? 34 : 44) + (kat < 0 ? -6 : 22);
        ctx.strokeStyle = rgba(on ? C.durak : C.silver, on ? 0.9 : 0.3); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, g.y); ctx.lineTo(x, kat < 0 ? yy + 6 : yy - 26); ctx.stroke();
        ctx.save();
        if (on) { ctx.shadowColor = C.durak; ctx.shadowBlur = 14; }
        ctx.fillStyle = on ? C.durak : C.bg2; ctx.strokeStyle = on ? C.durak : C.silver; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(x, g.y, on ? 7 : 5.5, 0, 7); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.font = `600 ${fs}px ${FONT.body}`;
        const tw = Math.max(ctx.measureText(d.ad).width, 30);
        const tx = Math.max(g.x0 + tw / 2 - 20, Math.min(g.x1 - tw / 2 + 20, x));
        text(ctx, (d.yaklasik ? "~" : "") + d.yil, tx, yy - 16, { size: fs, align: "center", weight: 700, color: on ? C.durak : C.ink });
        text(ctx, d.ad, tx, yy, { size: fs, align: "center", color: on ? C.ink : C.ink2 });
      });
    }
    st = canvas(cv, draw);
    function sec_(i) {
      sec = i; draw();
      const d = DURAKLAR[i];
      bilgi.innerHTML = "";
      bilgi.append(h("b", (d.yaklasik ? "~" : "") + d.yil + " · " + d.ad), h("p", d.metin));
      ctl.innerHTML = "";
      if (d.ses === "ikisi") {
        ctl.append(
          h("button.btn", { type: "button", onclick: () => cal(false) }, "Chalumeau: tek register"),
          h("button.btn", { type: "button", onclick: () => cal(true) }, "Klarnet: register anahtarıyla"),
        );
      } else ctl.append(h("span.mute", "Bir durağa dokunun."));
    }
    function cal(reg) {
      if (calan) calan.stop();
      Snd.unlock(); Klarnet.hazirla();
      const n = [];
      let t = 0;
      ALT.forEach((m, i) => {
        n.push({ f: K.yaziliFrekans(m, "sol"), t, d: 0.3 }); t += 0.32;
        if (reg) { n.push({ f: K.yaziliFrekans(m + 19, "sol"), t, d: 0.3 }); t += 0.32; }
      });
      calan = Klarnet.ezgi(n, { nefes: 0.7 });
    }
    cv.addEventListener("click", (e) => {
      const r = cv.getBoundingClientRect(), g = geo();
      const x = e.clientX - r.left;
      let best = 0, bd = 1e9;
      DURAKLAR.forEach((d, i) => { const dd = Math.abs(yX(d.yil, g) - x); if (dd < bd) { bd = dd; best = i; } });
      if (bd < 40) sec_(best);
    });
    sec_(0);
    return { leave() { calan && calan.stop(); } };
  };
  G.hikaye = [{ click: "Chalumeau" }, { wait: 4200 }, { click: "Klarnet" }];

  /* ================= Fasıldan düğüne: iki dünya ================= */
  // ikisi de bu site için yazıldı
  const SARKI = [[9, 1], [17, 0.5], [22, 0.5], [31, 2], [40, 0.5], [31, 0.5], [22, 0.5], [17, 0.5], [22, 1], [17, 0.5], [9, 0.5], [0, 1], [9, 3]];
  const OYUN = [[9, 2], [14, 1], [26, 1], [31, 2], [26, 2], [31, 1], [40, 2], [31, 1], [26, 1], [14, 2], [26, 2], [14, 1],
    [26, 2], [31, 1], [40, 1], [48, 2], [40, 2], [31, 1], [26, 2], [14, 1], [26, 1], [14, 2], [9, 3]];
  Demos.ikidunya = (stage) => {
    const wrap = h("div.iki-dunya");
    stage.append(wrap);
    const yanlar = [
      { ad: "Şarkı ve fasıl", alt: "Uşşak · sofyan · def", usul: usul("sofyan"), saz: "def", tempo: 76, ezgi: SARKI, legato: true, vib: 0.18, tekrar: 2 },
      { ad: "Oyun havası", alt: "Hicaz · 9/8 · darbuka", usul: usul("aksak"), saz: "darbuka", tempo: 330, ezgi: OYUN, legato: false, vib: 0, tekrar: 1 },
    ];
    let calan = null, aktif = -1, ezgiCtl = null;
    const panel = yanlar.map((y, i) => {
      const cv = h("canvas", { role: "img", "aria-label": y.ad + " usul halkası" });
      const btn = h("button.btn", { type: "button", onclick: () => cal(i) }, "▶ " + y.ad);
      const p = h("div.iki-yan", h("div.iki-cv", cv), h("div.iki-alt", btn, h("span.mute", y.alt)));
      wrap.append(p);
      const st = canvas(cv, () => ciz(i));
      return { cv, st, btn };
    });
    function ciz(i) {
      const p = panel[i]; if (!p || !p.st.w) return;
      const { ctx, w, h: hh } = p.st;
      ctx.clearRect(0, 0, w, hh);
      const R = Math.min(w, hh) * 0.36;
      const adim = aktif === i && calan ? calan.adim() : -1;
      Cizim.usulHalka(ctx, w / 2, hh / 2, R, yanlar[i].usul, adim, { dar: w < 300 });
    }
    const lp = loop(() => { ciz(0); ciz(1); });
    function dur() { calan && calan.stop(); ezgiCtl && ezgiCtl.stop(); calan = null; ezgiCtl = null; panel.forEach((p, j) => (p.btn.textContent = "▶ " + yanlar[j].ad)); aktif = -1; }
    function cal(i) {
      const ayni = aktif === i;
      dur();
      if (ayni) return;
      Snd.unlock(); Klarnet.hazirla();
      const y = yanlar[i];
      aktif = i;
      calan = Usul.cal(y.usul, { tempo: y.tempo, saz: y.saz, ses: 0.8 });
      if (!calan.start()) { dur(); return; }
      const birim = y.usul.payda === 4 ? 1 : 1; // ezgi birimi usul birimiyle aynı
      let dizi = [];
      for (let r = 0; r < y.tekrar; r++) dizi = dizi.concat(y.ezgi);
      // usulün ilk ölçüsü boş geçer, ezgi ikinci ölçüde girer
      const olcu = (60 / y.tempo) * y.usul.uzunluk;
      ezgiCtl = Klarnet.ezgi(D.komaEzgi(dizi, y.tempo * birim, { legato: y.legato }), { gecikme: 0.06 + olcu, vibrato: y.vib, nefes: y.legato ? 0.7 : 0.8,
        onBitti: () => setTimeout(() => { if (aktif === i) dur(); }, olcu * 1000) });
      panel[i].btn.textContent = "■ Durdur";
    }
    return { enter() { lp.start(); }, leave() { lp.stop(); dur(); }, bosluk() { aktif >= 0 ? dur() : cal(0); } };
  };
  G["turk-muziginde"] = [{ click: "▶ Şarkı ve fasıl" }, { wait: 7000 }, { click: "▶ Oyun havası" }];

  /* ================= Ustalar ================= */
  const USTALAR = [
    { ad: "Şükrü Tunar", dogum: 1907, olum: 1962, yer: "Edremit ya da Edirne", tarih: "1907 – 15 Ağustos 1962", not: "Doğum yeri kaynaklarda farklı geçiyor.", wiki: "https://tr.wikipedia.org/wiki/%C5%9E%C3%BCkr%C3%BC_Tunar" },
    { ad: "Mustafa Kandıralı", dogum: 1930, olum: 2020, yer: "Kandıra", tarih: "10 Temmuz 1930 – 27 Aralık 2020", wiki: "https://tr.wikipedia.org/wiki/Mustafa_Kand%C4%B1ral%C4%B1" },
    { ad: "Barbaros Erköse", dogum: 1936, olum: null, yer: "Bursa", tarih: "1936", wiki: "https://tr.wikipedia.org/wiki/Barbaros_Erk%C3%B6se" },
    { ad: "Selim Sesler", dogum: 1957, olum: 2014, yer: "Keşan", tarih: "1957 – 9 Mayıs 2014", wiki: "https://tr.wikipedia.org/wiki/Selim_Sesler" },
    { ad: "Hüsnü Şenlendirici", dogum: 1976, olum: null, yer: "Bergama", tarih: "12 Temmuz 1976", wiki: "https://tr.wikipedia.org/wiki/H%C3%BCsn%C3%BC_%C5%9Eenlendirici" },
    { ad: "Serkan Çağrı", dogum: 1976, olum: null, yer: "Keşan", tarih: "2 Haziran 1976", not: "Sol Klarnet Eğitimi 1 (2006) adlı yöntem kitabının yazarı.", wiki: "https://tr.wikipedia.org/wiki/Serkan_%C3%87a%C4%9Fr%C4%B1" },
  ];
  Demos.ustalar = (stage) => {
    const raf = h("div.raf", { role: "list" });
    const { fill, cv } = D.tuval(stage, "Ustaların yaşam çizgileri");
    const bilgi = h("div.raf-bilgi", { "aria-live": "polite" });
    stage.prepend(raf);
    stage.append(bilgi);
    let sec = -1, st;
    USTALAR.forEach((u, i) => {
      const b = h("button.plak-etiket", { type: "button", role: "listitem", "aria-label": u.ad, onclick: () => secim(i) },
        h("span.pe-ad", u.ad), h("span.pe-yil", u.dogum + (u.olum ? "–" + u.olum : "")));
      raf.append(b);
    });
    function secim(i) {
      sec = i; draw();
      raf.querySelectorAll(".plak-etiket").forEach((b, j) => b.classList.toggle("on", j === i));
      const u = USTALAR[i];
      bilgi.innerHTML = "";
      bilgi.append(h("b", u.ad), h("span", u.tarih + " · " + u.yer), u.not ? h("span.mute", u.not) : null,
        h("a", { href: u.wiki, target: "_blank", rel: "noopener" }, "Vikipedi'de oku ↗"));
    }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = Math.min(150, w * 0.34), x1 = w - 22, yr0 = 1900, yr1 = 2030;
      const X = (y) => x0 + ((y - yr0) / (yr1 - yr0)) * (x1 - x0);
      const top = 16, bot = hh - 30, row = (bot - top) / USTALAR.length;
      for (let y = 1900; y <= 2020; y += 20) {
        ctx.strokeStyle = rgba(C.ink, 0.1); ctx.beginPath(); ctx.moveTo(X(y), top); ctx.lineTo(X(y), bot); ctx.stroke();
        text(ctx, String(y), X(y), hh - 10, { size: 11, align: "center", color: C.muted });
      }
      USTALAR.forEach((u, i) => {
        const y = top + row * (i + 0.5), on = i === sec;
        const xe = X(u.olum || 2026);
        ctx.strokeStyle = on ? C.durak : rgba(C.silver, sec < 0 ? 0.6 : 0.25); ctx.lineWidth = on ? 4 : 2.5; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(X(u.dogum), y); ctx.lineTo(xe, y); ctx.stroke();
        if (!u.olum) { ctx.fillStyle = on ? C.durak : rgba(C.silver, 0.6); ctx.beginPath(); ctx.moveTo(xe + 2, y - 5); ctx.lineTo(xe + 9, y); ctx.lineTo(xe + 2, y + 5); ctx.fill(); }
        ctx.strokeStyle = rgba(C.ink, 0.12); ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(x0 - 4, y); ctx.lineTo(X(u.dogum) - 6, y); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, u.ad, x0 - 10, y + 4, { size: w < 420 ? 11 : 12, align: "right", color: on ? C.ink : C.ink2, weight: on ? 700 : 500 });
      });
    }
    st = canvas(cv, draw);
    return {};
  };
  G.ustalar = [{ click: "css:.plak-etiket:nth-child(2)" }, { wait: 1200 }, { click: "css:.plak-etiket:nth-child(4)" }];
  window.GuideTargets = window.GuideTargets || {};
})();
