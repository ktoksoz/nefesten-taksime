/* 11. bölüm: Bakım, günlük pratik, kapanış */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, seg } = L;
  const G = window.GuideScenarios;

  /* ================= Bakım: çaldıktan sonra ================= */
  const BAKIM = [
    { id: "kamis", ad: "Kamışı ağızlıktan çıkarın", not: "Silip kamış kutusunda kurumaya bırakın." },
    { id: "surgu", ad: "Gövdenin içini sürgü beziyle kurulayın", not: "Bezi gövdeden birkaç kez geçirin; nem ahşabın düşmanıdır." },
    { id: "agiz", ad: "Ağızlığı silin", not: "Ağızlığı ılık suyla arada bir yıkayabilirsiniz; ahşap gövdeyi yıkamayın." },
    { id: "sok", ad: "Parçaları dikkatle sökün", not: "Anahtarlardan değil gövdeden tutun; köprü anahtarına dikkat." },
    { id: "kutu", ad: "Kutusuna yerleştirin", not: "Güneşten, kaloriferden ve ani sıcaklık değişiminden uzak tutun." },
  ];
  Demos.bakim = (stage) => {
    const yer = h("div.bk-yer");
    const ctl = h("div.controls");
    stage.append(yer, ctl);
    let tamam = new Set();
    const durum = h("span.readout");
    function ciz() {
      yer.innerHTML = "";
      BAKIM.forEach((b, i) => {
        const on = tamam.has(b.id);
        const el = h("button.bk-adim" + (on ? ".ok" : ""), { type: "button", "aria-pressed": on, onclick: () => { on ? tamam.delete(b.id) : tamam.add(b.id); ciz(); } },
          h("span.bk-no", String(i + 1)), h("span.bk-metin", h("b", b.ad), h("small", b.not)));
        yer.append(el);
      });
      durum.innerHTML = tamam.size === BAKIM.length ? '<b class="c-guclu">Klarnetiniz bir sonraki çalışmaya hazır.</b>' : `${tamam.size}/${BAKIM.length} adım`;
    }
    ctl.append(h("button.btn", { type: "button", onclick: () => { tamam.clear(); ciz(); } }, "Sıfırla"), durum, h("span.mute", "Sıra öğretmenden öğretmene biraz değişebilir"));
    ciz();
    return {};
  };
  G.bakim = [{ click: "css:.bk-adim:nth-child(1)" }, { wait: 400 }, { click: "css:.bk-adim:nth-child(2)" }];

  /* ================= Günlük pratik ================= */
  const PLANLAR = {
    15: [["Uzun sesler", 4, "uzun-ses"], ["Bir makam dizisi, usulle", 4, "metronom"], ["Şarkıdan bir dize", 5, "gamzedeyim-ogren"], ["Serbest taksim", 2, "taksim-alani"]],
    30: [["Uzun sesler ve akort", 6, "akort"], ["Dil vuruşu: tu, du, legato", 4, "dil"], ["İki makam dizisi, usulle", 6, "metronom"], ["Makam cümleleri", 5, "makamlar"], ["Şarkı: birlikte çal", 6, "gamzedeyim-birlikte"], ["Taksim", 3, "taksim-alani"]],
    60: [["Uzun sesler, vibratosuz ve vibratolu", 10, "uzun-ses"], ["Koma perdeleri: segâh, eviç", 8, "koma-klarnette"], ["Dil vuruşu ve staccato", 6, "dil"], ["Üç makam dizisi, usulle", 10, "metronom"], ["Makam cümleleri", 8, "makamlar"], ["Şarkı: dize dize, sonra birlikte", 12, "gamzedeyim-ogren"], ["Taksim", 6, "taksim-alani"]],
  };
  Demos.pratik = (stage) => {
    const ust = h("div.controls.top");
    const yer = h("div.pr-yer");
    const liste = h("ol.pr-liste");
    const saatCv = h("canvas", { role: "img", "aria-label": "Zamanlayıcı" });
    const saatYer = h("div.pr-saat", saatCv);
    const gecmis = h("div.pr-gecmis");
    yer.append(saatYer, h("div.pr-sag", liste, gecmis));
    const ctl = h("div.controls");
    stage.append(ust, yer, ctl);
    let plan = L.store.get("pratik.plan", 15), adim = 0, kalan = 0, calisiyor = false, son = 0, st;
    const adimlar = () => PLANLAR[plan];
    function kur() { adim = 0; kalan = adimlar()[0][1] * 60; calisiyor = false; basBtn.textContent = "▶ Başlat"; ciz(); }
    function ciz() {
      liste.innerHTML = "";
      adimlar().forEach(([ad, dk, slayt], i) => {
        liste.append(h("li" + (i < adim ? ".ok" : i === adim ? ".simdi" : ""), h("span", ad), h("span.mute", dk + " dk"), h("a", { href: "#" + slayt, onclick: (e) => { e.preventDefault(); Deck.goId(slayt); } }, "Araca git")));
      });
      const g = L.store.get("pratik.gecmis", []);
      const bugun = new Date();
      const gunler = [...Array(14)].map((_, i) => { const d = new Date(bugun); d.setDate(d.getDate() - (13 - i)); return d.toISOString().slice(0, 10); });
      gecmis.innerHTML = '<span class="mute">Son 14 gün</span>' + gunler.map((d) => `<i class="${g.includes(d) ? "on" : ""}" title="${d}"></i>`).join("");
    }
    const basBtn = h("button.btn.primary", { type: "button", onclick: () => { calisiyor = !calisiyor; son = performance.now(); basBtn.textContent = calisiyor ? "❚❚ Duraklat" : "▶ Devam"; } }, "▶ Başlat");
    ust.append(seg([[15, "15 dakika"], [30, "30 dakika"], [60, "60 dakika"]], plan, (p) => { plan = p; L.store.set("pratik.plan", p); kur(); }, "Plan"));
    ctl.append(basBtn, h("button.btn", { type: "button", onclick: () => ileri() }, "Sonraki adım"),
      h("button.btn", { type: "button", onclick: () => { try { Object.keys(localStorage).filter((k) => k.startsWith("klarnet.")).forEach((k) => localStorage.removeItem(k)); } catch (e) {} kur(); } }, "Kayıtları sil"));
    function ileri() {
      adim++;
      if (adim >= adimlar().length) {
        calisiyor = false; basBtn.textContent = "▶ Başlat";
        const g = L.store.get("pratik.gecmis", []); const d = new Date().toISOString().slice(0, 10);
        if (!g.includes(d)) { g.push(d); L.store.set("pratik.gecmis", g.slice(-60)); }
        Snd.unlock(); Usul.vurus(Snd.ctx, "düm", Snd.now() + 0.02, "def");
        adim = adimlar().length; kalan = 0;
      } else { kalan = adimlar()[adim][1] * 60; Snd.unlock(); Usul.vurus(Snd.ctx, "tek", Snd.now() + 0.02, "def"); }
      ciz();
    }
    function draw() {
      if (calisiyor) { const n = performance.now(); kalan -= (n - son) / 1000; son = n; if (kalan <= 0) ileri(); }
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const cx = w / 2, cy = hh / 2, R = Math.min(w, hh) * 0.38;
      const A = adimlar(), top = A[adim] ? A[adim][1] * 60 : 1;
      ctx.strokeStyle = rgba(C.ink, 0.12); ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = C.durak; ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - Math.max(0, kalan) / top)); ctx.stroke();
      const dk = Math.floor(Math.max(0, kalan) / 60), sn = Math.floor(Math.max(0, kalan) % 60);
      text(ctx, A[adim] ? `${dk}:${String(sn).padStart(2, "0")}` : "Bitti", cx, cy + 10, { size: Math.min(48, R * 0.45), align: "center", color: C.ink, font: FONT.display, weight: 400 });
      if (A[adim]) text(ctx, A[adim][0], cx, cy + R * 0.42, { size: 12, align: "center", color: C.ink2 });
    }
    const lp = loop(draw);
    st = canvas(saatCv, draw);
    kur();
    return { enter() { lp.start(); }, leave() { lp.stop(); calisiyor = false; basBtn.textContent = "▶ Devam"; } };
  };
  G.pratik = [{ click: "=15 dakika" }, { click: "▶ Başlat" }];

  /* ================= Kapanış: çalışma araçları ================= */
  const ARACLAR = [
    ["parmak-tablosu", "Parmak tablosu"], ["akort", "Koma akort aleti"], ["metronom", "Usul metronomu"],
    ["makamlar", "Dokuz makam"], ["gamzedeyim-ogren", "Gamzedeyim"], ["taksim-alani", "Taksim alanı"],
  ];
  Demos.kapanis = (stage) => {
    const raf = h("div.raf.kp-raf");
    ARACLAR.forEach(([id, ad]) => raf.append(h("button.plak-etiket", { type: "button", onclick: () => Deck.goId(id) }, h("span.pe-ad", ad), h("span.pe-yil", "aç"))));
    const diger = h("div.kp-diger", h("span.mute", "Bir sonraki adım"),
      h("a", { href: "https://egitim.koraytoksoz.com/muzik/" }, "Titreşimden Şarkıya: müzik teorisi"),
      h("a", { href: "https://egitim.koraytoksoz.com/" }, "Bütün eğitimler"));
    stage.append(raf, diger);
    stage.classList.add("kp-stage");
    return {};
  };
})();
