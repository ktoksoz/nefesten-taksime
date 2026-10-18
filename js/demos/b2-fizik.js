/* 2. bölüm: Klarnet nasıl ses çıkarır? — kamış, tek harmonikler, onikili, delikler */
(function () {
  const { h, C, rgba, canvas, loop, text, FONT, fmtNum, fmtHz, slider, seg, clamp } = L;
  const G = window.GuideScenarios;

  // klarnet sesi + çözümleyici (canlı dalga ve spektrum için)
  function sesliAnaliz() {
    let v = null, an = null, buf = null, fbuf = null;
    return {
      ac(opts) {
        if (v) return v;
        Snd.unlock(); Klarnet.hazirla();
        v = Klarnet.ses(opts); if (!v) return null;
        Snd.own(v);
        an = Snd.ctx.createAnalyser(); an.fftSize = 4096; an.smoothingTimeConstant = 0.5;
        v.out.connect(an);
        buf = new Float32Array(an.fftSize); fbuf = new Float32Array(an.frequencyBinCount);
        return v;
      },
      kapat() { if (v) { v.stop(); v = null; an = null; } },
      get v() { return v && !v.durdu ? v : null; },
      dalga() { if (!an) return null; an.getFloatTimeDomainData(buf); return buf; },
      spektrum() { if (!an) return null; an.getFloatFrequencyData(fbuf); return { db: fbuf, hz: Snd.ctx.sampleRate / an.fftSize }; },
    };
  }

  /* ================= Kamış bir supap ================= */
  Demos.kamis = (stage) => {
    const { cv } = D.tuval(stage, "Ağızlık ve kamış kesiti; borudaki basınç dalgası");
    const ctl = h("div.controls");
    stage.append(ctl);
    const sa = sesliAnaliz();
    let nefes = 0.0, st, faz = 0, duzey = 0;
    const ufle = h("button.btn.primary", { type: "button" }, "Üfle");
    const sl = slider({ label: "Nefes basıncı", min: 0, max: 1.15, step: 0.01, value: 0, fmt: (v) => fmtNum(v * 100) + "%", oninput: (v) => { nefes = v; if (!sa.v && v > 0) baslat(); sa.v && sa.v.set("nefes", v, 0.03); } });
    ctl.append(ufle, sl, h("span.spacer"), h("span.readout.km-durum"));
    const durum = ctl.querySelector(".km-durum");
    function baslat() { const v = sa.ac({ frekans: K.yaziliFrekans(67, "sol") }); if (v) { v.set("nefes", nefes, 0.03); ufle.textContent = "Durdur"; } }
    ufle.addEventListener("click", () => {
      if (sa.v) { sa.kapat(); ufle.textContent = "Üfle"; return; }
      if (nefes < 0.05) { nefes = 0.75; sl.set(0.75); }
      baslat();
    });
    function draw(dt = 0.016) {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const d = sa.dalga();
      let rms = 0;
      if (d) { for (let i = 0; i < d.length; i += 4) rms += d[i] * d[i]; rms = Math.sqrt(rms / (d.length / 4)); }
      duzey += (rms - duzey) * 0.2;
      const titre = duzey > 0.02;
      durum.innerHTML = !sa.v ? "" : titre ? "<b>Kamış titreşiyor</b>" : nefes > 0.05 ? "Yalnızca hava sesi" : "";
      // kesit: ağızlık (koyu kama), kamış (açık şerit), boru
      const y0 = hh * 0.42, x0 = w * 0.08, xm = w * 0.36;
      const ac = (1 - clamp(nefes / 1.1, 0, 1) * 0.65); // nefes arttıkça aralık daralır
      faz += dt * 60;
      const salinim = titre ? Math.sin(faz) * Math.min(1, duzey * 3) : 0;
      const aralik = Math.max(1, (14 * ac) * (1 + 0.8 * salinim));
      // ağızlık
      ctx.fillStyle = "#0d090b"; ctx.strokeStyle = rgba(C.silver, 0.4); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y0 - 30); ctx.lineTo(xm, y0 - 34); ctx.lineTo(w * 0.93, y0 - 34); ctx.lineTo(w * 0.93, y0 - 6); ctx.lineTo(xm, y0 - 6); ctx.lineTo(x0 + 10, y0 - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      // boru (alt duvar)
      ctx.beginPath(); ctx.moveTo(xm, y0 + 26); ctx.lineTo(w * 0.93, y0 + 26); ctx.lineTo(w * 0.93, y0 + 40); ctx.lineTo(xm, y0 + 40); ctx.closePath(); ctx.fill(); ctx.stroke();
      // kamış: kalak tarafından sabit, uçta açılıp kapanır
      ctx.strokeStyle = "#cbb88f"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x0 + 6, y0 - 6 + aralik); ctx.quadraticCurveTo(xm * 0.75, y0 + 6, xm, y0 + 24); ctx.lineTo(w * 0.6, y0 + 24); ctx.stroke();
      // nefes okları
      if (nefes > 0.02) {
        const n = 3, a = clamp(nefes, 0, 1);
        for (let i = 0; i < n; i++) {
          const yy = y0 - 6 + aralik / 2 + (i - 1) * 3, xx = x0 - 40 + ((faz * 1.6 + i * 13) % 40);
          ctx.strokeStyle = rgba(C.ink, 0.25 + a * 0.5); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(xx - 14, yy); ctx.lineTo(xx, yy); ctx.stroke();
        }
      }
      text(ctx, "ağızlık", xm + 8, y0 - 40, { size: 11, color: C.muted });
      text(ctx, "kamış", x0 + 10, y0 + 30, { size: 11, color: "#cbb88f" });
      text(ctx, "aralık", x0 - 6, y0 - 12, { size: 11, color: C.muted, align: "right" });
      // borudaki basınç dalgası (gerçek model çıktısı)
      const wy = hh * 0.78, ww = w * 0.84, wx = w * 0.08;
      ctx.strokeStyle = rgba(C.ink, 0.12); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + ww, wy); ctx.stroke();
      if (d) {
        const n = 1200;
        ctx.strokeStyle = titre ? C.guclu : rgba(C.ink, 0.4); ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < n; i++) { const x = wx + (i / n) * ww, y = wy - d[i] * hh * 0.18; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      text(ctx, "Borudaki basınç (modelin çıktısı)", wx, wy - hh * 0.16, { size: 11, color: C.muted });
    }
    const lp = loop((dt) => draw(dt));
    st = canvas(cv, () => draw());
    return { enter() { lp.start(); }, leave() { lp.stop(); sa.kapat(); ufle.textContent = "Üfle"; } };
  };
  G.kamis = [{ click: "=Üfle" }, { slide: "label:Nefes basıncı", to: 0.3 }, { wait: 900 }, { slide: "label:Nefes basıncı", to: 0.8 }, { wait: 1200 }, { click: "=Durdur" }];

  /* ================= Tek harmonikler ================= */
  // modelin ölçülen harmonik düzeyleri (dB, temel = 0): tools/olcum.js, nefes 0,75
  const KLARNET_DB = [0, -55, -10, -55, -14, -56, -17, -56, -20, -56];
  Demos.harmonik = (stage) => {
    const { cv } = D.tuval(stage, "Harmonik çubukları");
    const ctl = h("div.controls");
    const btnRow = h("div.hm-satir");
    stage.append(btnRow, ctl);
    let amps = KLARNET_DB.map((d) => Math.pow(10, d / 20));
    const acik = amps.map(() => true);
    let dr = null, st;
    const f0 = K.yaziliFrekans(60, "sol"); // yazılı Do4 → Sol3
    const kutular = amps.map((_, i) => {
      const b = h("button.hm-btn", { type: "button", "aria-pressed": "true", onclick: () => { acik[i] = !acik[i]; b.classList.toggle("off", !acik[i]); b.setAttribute("aria-pressed", acik[i]); guncelle(); } }, String(i + 1));
      btnRow.append(b); return b;
    });
    const hazir = seg([["klarnet", "Klarnet: tek harmonikler"], ["flut", "Hepsi (flüte benzer)"]], "klarnet", (k) => {
      amps = k === "klarnet" ? KLARNET_DB.map((d) => Math.pow(10, d / 20)) : amps.map((_, i) => 1 / (i + 1));
      acik.fill(true); kutular.forEach((b) => { b.classList.remove("off"); b.setAttribute("aria-pressed", "true"); }); guncelle();
    }, "Hazır ayar");
    const calBtn = h("button.btn.primary", { type: "button", onclick: () => { if (dr) { dr.stop(); dr = null; calBtn.textContent = "▶ Dinle"; } else { Snd.unlock(); dr = Snd.own(Snd.drone({ freq: f0, amps: etkin(), gain: 0.22 })); if (dr) calBtn.textContent = "■ Durdur"; } } }, "▶ Dinle");
    const ciftKapa = h("button.btn", { type: "button", onclick: () => { acik.forEach((_, i) => (acik[i] = i % 2 === 0)); kutular.forEach((b, i) => { b.classList.toggle("off", !acik[i]); b.setAttribute("aria-pressed", acik[i]); }); guncelle(); } }, "Çiftleri kapat");
    const tekKapa = h("button.btn", { type: "button", onclick: () => { acik.forEach((_, i) => (acik[i] = i === 0 || i % 2 === 1)); kutular.forEach((b, i) => { b.classList.toggle("off", !acik[i]); b.setAttribute("aria-pressed", acik[i]); }); guncelle(); } }, "Tekleri kapat (temel kalsın)");
    ctl.append(calBtn, hazir, ciftKapa, tekKapa);
    const etkin = () => amps.map((a, i) => (acik[i] ? a : 0));
    function guncelle() { if (dr) dr.setAmps(etkin()); draw(); }
    function draw() {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const x0 = 50, x1 = w - 20, y0 = 30, y1 = hh - 40;
      const dbOf = (a) => (a <= 0 ? -70 : Math.max(-70, 20 * Math.log10(a)));
      const yOf = (db) => y0 + ((0 - db) / 70) * (y1 - y0);
      for (let db = 0; db >= -60; db -= 20) { ctx.strokeStyle = rgba(C.ink, 0.08); ctx.beginPath(); ctx.moveTo(x0, yOf(db)); ctx.lineTo(x1, yOf(db)); ctx.stroke(); text(ctx, db + " dB", x0 - 8, yOf(db) + 4, { size: 10, align: "right", color: C.muted }); }
      const bw = (x1 - x0) / amps.length;
      amps.forEach((a, i) => {
        const on = acik[i], db = on ? dbOf(a) : -70;
        const x = x0 + bw * i + bw * 0.2, ww = bw * 0.6;
        ctx.fillStyle = on ? (i % 2 === 0 ? C.guclu : rgba(C.ink, 0.7)) : rgba(C.ink, 0.08);
        ctx.fillRect(x, yOf(db), ww, y1 - yOf(db));
        text(ctx, `${i + 1}f`, x + ww / 2, y1 + 16, { size: 11, align: "center", color: i % 2 === 0 ? C.guclu : C.ink2, weight: 600 });
        text(ctx, fmtHz(f0 * (i + 1)), x + ww / 2, y1 + 30, { size: 9, align: "center", color: C.muted });
      });
      text(ctx, "tek harmonikler yeşil", x1, y0 - 12, { size: 11, align: "right", color: C.guclu });
    }
    st = canvas(cv, draw);
    return { leave() { if (dr) { dr.stop(); dr = null; calBtn.textContent = "▶ Dinle"; } } };
  };
  G["tek-harmonikler"] = [{ click: "▶ Dinle" }, { wait: 1200 }, { click: "Tekleri kapat" }, { wait: 1600 }, { click: "Klarnet" }, { wait: 800 }, { click: "■ Durdur" }];

  /* ================= Onikili ================= */
  Demos.onikili = (stage) => {
    const { cv } = D.tuval(stage, "Boruda duran dalga: birinci ve üçüncü kip");
    const ctl = h("div.controls");
    stage.append(ctl);
    let reg = false, st, t = 0, v = null;
    const regBtn = h("button.btn", { type: "button", "aria-pressed": "false", onclick: () => { reg = !reg; regBtn.classList.toggle("on", reg); regBtn.setAttribute("aria-pressed", reg); regBtn.textContent = reg ? "Register anahtarı: açık" : "Register anahtarı: kapalı"; if (v) v.set("frekans", frek(), 0.01); } }, "Register anahtarı: kapalı");
    const calBtn = h("button.btn.primary", { type: "button", onclick: () => { if (v) { v.stop(); v = null; calBtn.textContent = "▶ Üfle"; } else { Snd.unlock(); Klarnet.hazirla(); v = Klarnet.ses({ frekans: frek() }); if (v) { Snd.own(v); v.ufle(0.74); calBtn.textContent = "■ Durdur"; } } } }, "▶ Üfle");
    const oku = h("span.readout");
    ctl.append(calBtn, regBtn, h("span.spacer"), oku);
    const frek = () => K.yaziliFrekans(reg ? 71 : 52, "sol");
    function draw(dt = 0.016) {
      if (!st || !st.w) return;
      const { ctx, w, h: hh } = st;
      t += dt;
      ctx.clearRect(0, 0, w, hh);
      const x0 = w * 0.08, x1 = w * 0.92, yc = hh * 0.46, R = Math.min(34, hh * 0.09);
      // boru
      ctx.fillStyle = "#120c0f"; ctx.strokeStyle = rgba(C.silver, 0.4);
      ctx.beginPath(); ctx.rect(x0, yc - R, x1 - x0, 2 * R); ctx.fill(); ctx.stroke();
      // kamış ucu kapalı
      ctx.strokeStyle = C.silver; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, yc - R); ctx.lineTo(x0, yc + R); ctx.stroke();
      text(ctx, "kamış (kapalı uç)", x0, yc + R + 20, { size: 11, color: C.muted });
      text(ctx, "kalak (açık uç)", x1, yc + R + 20, { size: 11, color: C.muted, align: "right" });
      // register deliği: borunun üst kısmında
      const xr = x0 + (x1 - x0) * 0.16;
      ctx.fillStyle = reg ? C.bg : C.silver; ctx.strokeStyle = C.silver; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(xr, yc - R, 5, 0, 7); ctx.fill(); ctx.stroke();
      text(ctx, "register deliği", xr, yc - R - 12, { size: 11, color: reg ? C.durak : C.muted, align: "center" });
      // basınç duran dalgası: kapalı uçta karın, açık uçta düğüm. kip n (1 ya da 3): cos(n·π/2·x)
      const n = reg ? 3 : 1, sw = Math.sin(t * (reg ? 7.5 : 2.5));
      ctx.lineWidth = 2.5;
      [1, -1].forEach((s, j) => {
        ctx.strokeStyle = j ? rgba(C.guclu, 0.35) : C.guclu;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) {
          const u = i / 200, x = x0 + u * (x1 - x0), y = yc - s * sw * Math.cos((n * Math.PI * u) / 2) * R * 0.85;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
      // düğümler
      for (let k = 0; k < n; k++) {
        const u = (2 * k + 1) / n;
        if (u > 1) break;
        const x = x0 + u * (x1 - x0);
        ctx.fillStyle = C.yeden; ctx.beginPath(); ctx.arc(x, yc, 3.5, 0, 7); ctx.fill();
      }
      text(ctx, reg ? "3. kip: boruya ¾ dalga boyu sığar → frekans 3 katı" : "1. kip: boruya ¼ dalga boyu sığar", w / 2, hh * 0.86, { size: 13, align: "center", color: C.ink, weight: 600 });
      const f = frek();
      oku.innerHTML = `Yazılı <b>${K.notaAdi(reg ? 71 : 52)}</b> · duyulan ${fmtHz(f)}${reg ? ` = 3 × ${fmtHz(f / 3)}` : ""}`;
    }
    const lp = loop((dt) => draw(dt));
    st = canvas(cv, () => draw(0));
    return { enter() { lp.start(); }, leave() { lp.stop(); if (v) { v.stop(); v = null; calBtn.textContent = "▶ Üfle"; } } };
  };
  G.onikili = [{ click: "▶ Üfle" }, { wait: 1000 }, { click: "Register anahtarı" }, { wait: 1300 }, { click: "Register anahtarı" }, { wait: 900 }, { click: "■ Durdur" }];

  /* ================= Delikler boruyu kısaltır ================= */
  Demos.delikler = (stage) => {
    const ikili = h("div.ikili");
    const kcYer = h("div.kc-yer");
    const { fill, cv } = (() => { const f = h("div.fill"); const c = h("canvas", { role: "img", "aria-label": "Etkin boru boyu ve duran dalga" }); f.append(c); return { fill: f, cv: c }; })();
    ikili.append(kcYer, fill);
    stage.append(ikili);
    let st, t = 0, son = null;
    const kc = KlarnetCiz(kcYer, { yon: "dikey", onDegis: (k, th) => { son = th; } });
    kc.goster("T L1 L2 L3", { sessiz: false });
    son = kc.tahmin;
    const E3 = K.yaziliFrekans(52, "sol");
    function draw(dt = 0.016) {
      if (!st || !st.w) return;
      t += dt;
      const { ctx, w, h: hh } = st;
      ctx.clearRect(0, 0, w, hh);
      const th = son || kc.tahmin;
      const f = K.yaziliFrekans(th.midi, "sol") * Math.pow(2, th.cent / 1200);
      const reg = !!kc.kapali.R;
      const ftemel = reg ? f / 3 : f;
      const oran = clamp(E3 / ftemel, 0.2, 1.05);
      const x0 = 30, xMax = w - 30, yc = hh * 0.44, R = Math.min(26, hh * 0.07);
      const xe = x0 + (xMax - x0) * oran;
      // tam boru (soluk) ve etkin boru
      ctx.fillStyle = rgba(C.ink, 0.04); ctx.fillRect(x0, yc - R, xMax - x0, 2 * R);
      ctx.fillStyle = "#120c0f"; ctx.strokeStyle = rgba(C.silver, 0.5); ctx.lineWidth = 1;
      ctx.fillRect(x0, yc - R, xe - x0, 2 * R); ctx.strokeRect(x0, yc - R, xe - x0, 2 * R);
      ctx.strokeStyle = C.silver; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, yc - R); ctx.lineTo(x0, yc + R); ctx.stroke();
      // etkin uç
      ctx.strokeStyle = C.durak; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(xe, yc - R - 16); ctx.lineTo(xe, yc + R + 16); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "etkin uç (ilk açık delik)", xe, yc - R - 22, { size: 11, color: C.durak, align: xe > w * 0.7 ? "right" : "center" });
      // duran dalga
      const n = reg ? 3 : 1, sw = Math.sin(t * 3);
      ctx.strokeStyle = C.guclu; ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= 160; i++) { const u = i / 160, x = x0 + u * (xe - x0), y = yc - sw * Math.cos((n * Math.PI * u) / 2) * R * 0.8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // okuma
      const ad = K.notaAdi(th.midi) + (Math.abs(th.cent) >= 1 ? ` ${th.cent > 0 ? "+" : "−"}${fmtNum(Math.abs(th.cent))} c` : "");
      text(ctx, ad, w / 2, hh * 0.74, { size: 26, align: "center", color: C.ink, font: FONT.display, weight: 400 });
      text(ctx, `duyulan ${fmtHz(f)} · etkin boy tam boyun %${fmtNum(oran * 100)}'i${reg ? " · 3. kip" : ""}`, w / 2, hh * 0.74 + 24, { size: 12, align: "center", color: C.ink2 });
      if (th.kaynak === "tahmin") text(ctx, "tabloda olmayan birleşim: ses yaklaşık", w / 2, hh * 0.74 + 42, { size: 11, align: "center", color: C.muted });
    }
    const lp = loop((dt) => draw(dt));
    st = canvas(cv, () => draw(0));
    return { enter() { lp.start(); }, leave() { lp.stop(); kc.ufle(false); } };
  };
  G.delikler = [{ click: "aria:Sol el 3. delik" }, { wait: 500 }, { click: "aria:Sol el 2. delik" }, { wait: 500 }, { click: "aria:Sol el 2. delik" }, { wait: 400 }, { click: "aria:Sol el 3. delik" }];
  window.GuideTargets = Object.assign(window.GuideTargets || {}, { delikler: "aria:Sol el 3. delik" });
})();
