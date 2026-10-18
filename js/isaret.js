/* Arel–Ezgi–Uzdilek değiştirici işaretleri (SVG). Fontlarda bu işaretler ya yok ya da yanlış çiziliyor.
   Biçimler (Wikipedia "Turkish makam", SMuFL AEU tablosu):
     diyez: 1 koma = tek dikey + iki eğik çizgi, 4 bakiye = ♯, 5 küçük mücennep = tek dikey + üç çizgi,
            8 büyük mücennep = iki dikey + üç çizgi
     bemol: 1 koma = ters bemol, 4 bakiye = sapı tek çizgiyle kesilmiş bemol, 5 küçük mücennep = ♭,
            8 büyük mücennep = sapı iki çizgiyle kesilmiş bemol */
(function () {
  const ADLAR = { 1: "koma", 4: "bakiye", 5: "küçük mücennep", 8: "büyük mücennep" };
  // 10 × 24 birimlik kutuda çizim; y aşağı doğru, nota başı ortası y = 15
  function yol(k) {
    const a = Math.abs(k);
    if (k > 0) {
      const dik = a === 4 || a === 8 ? ["M3.5 1 V23", "M6.5 0 V22"] : ["M5 0.5 V23.5"];
      const cizgi = a === 5 || a === 8 ? ["M1 8 L9 5.6", "M1 13 L9 10.6", "M1 18 L9 15.6"] : ["M1 10 L9 7.4", "M1 16.4 L9 13.8"];
      return { ince: dik.join(" "), kalin: cizgi.join(" ") };
    }
    // bemol: sap + kıvrım; ters bemolde kıvrım sola bakar
    const ters = a === 1;
    const sap = ters ? "M7 0.5 V22.5" : "M3 0.5 V22.5";
    const govde = ters ? "M7 22.5 C2.5 19.5 1.5 16 3 14.2 C4.5 12.6 6.4 13.6 7 15.2" : "M3 22.5 C7.5 19.5 8.5 16 7 14.2 C5.5 12.6 3.6 13.6 3 15.2";
    const kes = a === 4 ? ["M0.5 7.5 L6 4.8"] : a === 8 ? ["M0.5 6 L6 3.3", "M0.5 10 L6 7.3"] : [];
    return { ince: sap, kalin: kes.join(" "), govde };
  }
  // işaret SVG'si (satır içi). k: koma sapması (+ diyez, − bemol), boy: piksel yüksekliği
  function svg(k, boy = 18, renk = "currentColor") {
    if (!k) return "";
    const y = yol(k);
    const w = (boy * 10) / 24;
    return `<svg class="isaret" viewBox="0 0 10 24" width="${w.toFixed(1)}" height="${boy}" aria-label="${ADLAR[Math.abs(k)] || ""} ${k > 0 ? "diyez" : "bemol"}" role="img">` +
      `<path d="${y.ince}" stroke="${renk}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
      (y.govde ? `<path d="${y.govde}" stroke="${renk}" stroke-width="1.6" fill="none"/>` : "") +
      (y.kalin ? `<path d="${y.kalin}" stroke="${renk}" stroke-width="${k > 0 ? 2.2 : 1.2}" fill="none" stroke-linecap="round"/>` : "") +
      `</svg>`;
  }
  // tuvale çiz: (x, y) nota başının ortası
  function tuval(ctx, k, x, y, boy = 18, renk = "#ece5da") {
    if (!k) return;
    const yl = yol(k), sc = boy / 24;
    ctx.save();
    ctx.translate(x - 5 * sc, y - 15 * sc);
    ctx.scale(sc, sc);
    ctx.strokeStyle = renk; ctx.lineCap = "round";
    ctx.lineWidth = 1.2; ctx.stroke(new Path2D(yl.ince));
    if (yl.govde) { ctx.lineWidth = 1.6; ctx.stroke(new Path2D(yl.govde)); }
    if (yl.kalin) { ctx.lineWidth = k > 0 ? 2.2 : 1.2; ctx.stroke(new Path2D(yl.kalin)); }
    ctx.restore();
  }
  // perde adının yanına yazım: "Si" + işaret (ör. Segâh → Si koma bemol)
  function yazim(p, boy = 16) {
    const harf = p.harf;
    return `${harf}${svg(p.isaret, boy)}`;
  }
  window.Isaret = { svg, tuval, yazim, ADLAR };
})();
