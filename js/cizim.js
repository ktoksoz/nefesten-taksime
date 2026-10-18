/* Ortak tuval çizimleri: perde ızgarası (müzik eğitimindeki 53 komalık merdivenle aynı görsel dil),
   rol biçimleri (durak çift halka, güçlü elmas, yeden üçgen, sapan perde kare) ve plak biçimli usul halkası. */
(function () {
  const { C, rgba, text, FONT } = L;

  // rol biçimi: renk körü kullanıcılar için renge ek olarak biçim de rolü söyler
  function rol(ctx, x, y, r, tur, { dolu = true, isik = false } = {}) {
    const col = tur === "durak" ? C.durak : tur === "guclu" ? C.guclu : tur === "yeden" ? C.yeden : tur === "koma" ? C.koma : C.ink;
    ctx.save();
    if (isik) { ctx.shadowColor = col; ctx.shadowBlur = 16; }
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, r * 0.32);
    ctx.beginPath();
    if (tur === "durak") {
      ctx.arc(x, y, r, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.fill();
    } else if (tur === "guclu") {
      ctx.moveTo(x, y - r * 1.15); ctx.lineTo(x + r * 1.15, y); ctx.lineTo(x, y + r * 1.15); ctx.lineTo(x - r * 1.15, y); ctx.closePath();
      dolu ? ctx.fill() : ctx.stroke();
    } else if (tur === "yeden") {
      ctx.moveTo(x, y - r * 1.15); ctx.lineTo(x + r * 1.1, y + r * 0.85); ctx.lineTo(x - r * 1.1, y + r * 0.85); ctx.closePath();
      dolu ? ctx.fill() : ctx.stroke();
    } else if (tur === "koma") {
      ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7);
      dolu ? ctx.fill() : ctx.stroke();
    } else {
      ctx.arc(x, y, r * 0.8, 0, 7);
      dolu ? ctx.fill() : ctx.stroke();
    }
    ctx.restore();
    return col;
  }
  const rolRenk = (tur) => (tur === "durak" ? C.durak : tur === "guclu" ? C.guclu : tur === "yeden" ? C.yeden : tur === "koma" ? C.koma : C.ink);

  /* Dikey perde ızgarası. Döndürür: { yOf(k), kOf(y) }.
     o: { x, y0 (üst), y1 (alt), kAlt, kUst, perdeler: [{koma, ad, rol, isik, soluk}], bati: bool, sag: genişlik (ızgara çizgileri),
          dar: bool, isimler: bool } */
  function izgara(ctx, o) {
    const { x, y0, y1, kAlt, kUst } = o;
    const yOf = (k) => y1 - ((k - kAlt) / (kUst - kAlt)) * (y1 - y0);
    const kOf = (y) => kAlt + ((y1 - y) / (y1 - y0)) * (kUst - kAlt);
    // koma çentikleri: her 9 komada (tam ses) uzun
    ctx.strokeStyle = rgba(C.ink, 0.14); ctx.lineWidth = 1;
    ctx.beginPath();
    const step = (y1 - y0) / (kUst - kAlt) < 2.2 ? 3 : 1;
    for (let k = Math.ceil(kAlt); k <= kUst; k += 1) {
      if (k % step && k % 9) continue;
      const y = Math.round(yOf(k)) + 0.5;
      const len = ((k % 53) + 53) % 53 % 9 === 0 ? 7 : 3.5;
      ctx.moveTo(x - len, y); ctx.lineTo(x + 3, y);
    }
    ctx.stroke();
    ctx.strokeStyle = rgba(C.ink, 0.35);
    ctx.beginPath(); ctx.moveTo(x + 0.5, yOf(kAlt)); ctx.lineTo(x + 0.5, yOf(kUst)); ctx.stroke();
    const gor = (o.perdeler || []).filter((p) => p.koma >= kAlt - 0.01 && p.koma <= kUst + 0.01).sort((a, b) => b.koma - a.koma);
    // etiket yerleri: yukarıdan aşağı, en az "ara" piksel boşluk (yakın perdelerde etiketler kayar, ince çizgiyle bağlanır)
    const ara = o.dar ? 12 : 14;
    const ly = gor.map((p) => yOf(p.koma));
    for (let i = 1; i < ly.length; i++) if (ly[i] - ly[i - 1] < ara) ly[i] = ly[i - 1] + ara;
    for (let i = ly.length - 2; i >= 0; i--) if (ly[i + 1] - ly[i] < ara) ly[i] = ly[i + 1] - ara;
    gor.forEach((p, i) => {
      const y = yOf(p.koma), yl = ly[i];
      const col = rolRenk(p.rol);
      if (o.sag) {
        ctx.strokeStyle = rgba(col, p.rol ? 0.22 : 0.07); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + o.sag, y); ctx.stroke();
      }
      const r = p.isik ? 7 : p.rol ? 5.5 : 4;
      if (p.soluk) ctx.globalAlpha = 0.4;
      rol(ctx, x, y, r, p.rol || (p.sapan ? "koma" : null), { isik: p.isik });
      ctx.globalAlpha = 1;
      if (Math.abs(yl - y) > 1) {
        ctx.strokeStyle = rgba(C.ink, 0.25); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 11, yl); ctx.moveTo(x + 6, y); ctx.lineTo(x + 11, yl); ctx.stroke();
      }
      if (o.isimler !== false && p.ad) {
        text(ctx, p.ad, x - 13, yl + 4, { size: o.dar ? 11 : 13, align: "right", weight: p.rol || p.isik ? 700 : 500, color: p.isik ? C.ink : p.rol ? col : p.soluk ? C.muted : C.ink2 });
      }
      if (o.bati && p.bati) {
        const sp = p.sapma == null ? "" : Math.abs(p.sapma) < 0.5 ? "  ±0" : `  ${p.sapma > 0 ? "+" : "−"}${L.fmtNum(Math.abs(p.sapma), 0)}`;
        text(ctx, p.bati, x + 13, yl + 4, { size: o.dar ? 10 : 11, color: C.ink2, weight: 600 });
        if (sp) { ctx.font = `600 ${o.dar ? 10 : 11}px ${FONT.body}`; const tw = ctx.measureText(p.bati).width; text(ctx, sp + " c", x + 13 + tw, yl + 4, { size: 10, color: Math.abs(p.sapma) > 10 ? C.koma : C.muted }); }
      }
    });
    return { yOf, kOf };
  }

  /* Plak biçimli usul halkası: her birim bir dilim; düm dolgun, tek ince; çalan dilim parlar.
     u: usul, adim: çalan birim (-1 yok), o: { dar } */
  function usulHalka(ctx, cx, cy, R, u, adim, o = {}) {
    const n = u.uzunluk;
    const a0 = -Math.PI / 2;
    const aOf = (i) => a0 + (i / n) * Math.PI * 2;
    // plak olukları
    ctx.save();
    for (let r = R * 0.42; r < R * 1.02; r += 3.2) {
      ctx.strokeStyle = rgba(C.ink, 0.035 + ((r * 7) % 3) * 0.006);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    }
    // birim dilimleri
    for (let i = 0; i < n; i++) {
      const on = i === adim;
      ctx.strokeStyle = rgba(C.silver, on ? 0.9 : 0.22); ctx.lineWidth = 1;
      const a = aOf(i);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.62, cy + Math.sin(a) * R * 0.62); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
    }
    // grup sınırları (vurgu grupları)
    let p = 0;
    u.gruplar.forEach((g) => {
      const a = aOf(p);
      ctx.strokeStyle = rgba(C.silver, 0.7); ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.5, cy + Math.sin(a) * R * 0.5); ctx.lineTo(cx + Math.cos(a) * R * 1.06, cy + Math.sin(a) * R * 1.06); ctx.stroke();
      p += g;
    });
    // vuruşlar
    u.olaylar.forEach(([pos, ad, d]) => {
      const dum = ad === "düm" || ad === "vurgu";
      const hafif = ad === "te" || ad === "ke" || ad === "kâ" || ad === "tık";
      const aS = aOf(pos) + 0.04, aE = aOf(pos + d) - 0.04;
      const rr = dum ? R * 0.84 : R * 0.84;
      const on = adim >= pos && adim < pos + d;
      ctx.strokeStyle = dum ? (on ? C.durak : rgba(C.durak, 0.55)) : on ? C.silverHi : rgba(C.silver, hafif ? 0.35 : 0.55);
      ctx.lineWidth = dum ? R * 0.2 : hafif ? R * 0.07 : R * 0.11;
      ctx.lineCap = "butt";
      if (on) { ctx.shadowColor = dum ? C.durak : C.silverHi; ctx.shadowBlur = 18; }
      ctx.beginPath(); ctx.arc(cx, cy, rr, aS, aE); ctx.stroke();
      ctx.shadowBlur = 0;
      // hece
      const am = aOf(pos) + (Math.PI * 2 * Math.min(d, 1)) / n / 2;
      const tr = R * 1.18;
      text(ctx, ad === "vurgu" ? "●" : ad === "tık" ? "·" : ad, cx + Math.cos(am) * tr, cy + Math.sin(am) * tr + 4, { size: o.dar ? 11 : 13, align: "center", weight: dum ? 700 : 500, color: on ? C.ink : dum ? C.durak : C.ink2 });
    });
    // etiket
    ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, 7); ctx.fill();
    ctx.strokeStyle = rgba(C.silver, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R * 0.4, 0, 7); ctx.stroke();
    text(ctx, u.ad, cx, cy - 2, { size: Math.max(12, R * 0.11), align: "center", color: C.ink, font: FONT.display, weight: 400 });
    text(ctx, u.olcu, cx, cy + R * 0.14, { size: Math.max(11, R * 0.085), align: "center", color: C.muted });
    ctx.fillStyle = C.silver; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 7); ctx.fill();
    // ibre: çalan birim
    if (adim >= 0) {
      const a = aOf(adim + 0.5);
      ctx.strokeStyle = rgba(C.ink, 0.5); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.42, cy + Math.sin(a) * R * 0.42); ctx.lineTo(cx + Math.cos(a) * R * 0.6, cy + Math.sin(a) * R * 0.6); ctx.stroke();
    }
    ctx.restore();
  }

  // perde listesi: koma aralığındaki perdeler, ızgara için {koma, ad, bati, sapma, sapan}
  function perdeListesi(kAlt, kUst, { ana = true } = {}) {
    return K.PERDELER.filter((p) => p.koma >= kAlt && p.koma <= kUst && (!ana || K.anaMi(p))).map((p) => {
      const y = K.perdeYazili(p.koma);
      return { koma: p.koma, ad: p.ad, bati: K.notaAdi(y.midi), sapma: y.sapma, sapan: Math.abs(y.sapma) > 10 };
    });
  }

  window.Cizim = { rol, rolRenk, izgara, usulHalka, perdeListesi };
})();
