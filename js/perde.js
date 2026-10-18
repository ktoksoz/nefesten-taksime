/* Mikrofon ve perde algılama.
   - İzin yalnızca kullanıcı bir düğmeye bastığında istenir (Mikrofon.ac).
   - Ses tarayıcıda işlenir; hiçbir yere gönderilmez, kaydedilmez.
   - Mikrofon yoksa, izin verilmezse ya da sayfa file:// ile açıldıysa anlaşılır bir mesaj döner.
   Perde: YIN (js/yin.js), her ekran karesinde 2048 örneklik pencere. */
(function () {
  const { h } = L;
  let stream = null, src = null, an = null, buf = null, raf = 0;
  const dinleyiciler = new Set();
  let son = [];

  function destekHatasi() {
    if (location.protocol === "file:") return "Sayfa dosyadan (file://) açıldı. Mikrofon için siteyi https üzerinden açın.";
    if (!window.isSecureContext) return "Mikrofon yalnızca güvenli (https) bağlantıda kullanılabilir.";
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return "Bu tarayıcı mikrofona erişimi desteklemiyor.";
    return "";
  }

  async function ac() {
    if (stream) return { ok: true };
    const e0 = destekHatasi();
    if (e0) return { ok: false, hata: e0 };
    Snd.unlock();
    const c = Snd.ctx;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      stream = null;
      const ad = e && e.name;
      if (ad === "NotAllowedError" || ad === "SecurityError") return { ok: false, hata: "Mikrofon izni verilmedi. Adres çubuğundaki kilit simgesinden izni açıp yeniden deneyin." };
      if (ad === "NotFoundError" || ad === "OverconstrainedError") return { ok: false, hata: "Bir mikrofon bulunamadı." };
      if (ad === "NotReadableError") return { ok: false, hata: "Mikrofon başka bir uygulama tarafından kullanılıyor olabilir." };
      return { ok: false, hata: "Mikrofon açılamadı: " + (e && e.message || ad || "bilinmeyen hata") };
    }
    if (c.state !== "running") { try { await c.resume(); } catch (e) {} }
    src = c.createMediaStreamSource(stream);
    an = c.createAnalyser();
    an.fftSize = 2048;
    src.connect(an); // hoparlöre bağlanmaz
    buf = new Float32Array(an.fftSize);
    dongu();
    document.dispatchEvent(new CustomEvent("mikrofon", { detail: { acik: true } }));
    return { ok: true };
  }

  function kapat() {
    cancelAnimationFrame(raf); raf = 0;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    try { src && src.disconnect(); } catch (e) {}
    stream = null; src = null; an = null;
    son = [];
    document.dispatchEvent(new CustomEvent("mikrofon", { detail: { acik: false } }));
  }

  function dongu() {
    raf = requestAnimationFrame(dongu);
    if (!an || !dinleyiciler.size) return;
    an.getFloatTimeDomainData(buf);
    const r = YIN.rms(buf);
    let olcum = { f: 0, olasilik: 0, rms: r, t: performance.now() };
    if (r > 0.008) {
      const y = YIN.yin(buf, Snd.ctx.sampleRate, { fmin: 100, fmax: 2000, esik: 0.15 });
      if (y && y.olasilik > 0.75) {
        son.push(y.f); if (son.length > 3) son.shift();
        const s = [...son].sort((a, b) => a - b);
        olcum = { f: s[s.length >> 1], ham: y.f, olasilik: y.olasilik, rms: r, t: olcum.t };
      } else son = [];
    } else son = [];
    dinleyiciler.forEach((fn) => fn(olcum));
  }

  function dinle(fn) { dinleyiciler.add(fn); return () => dinleyiciler.delete(fn); }

  /* Mikrofon düğmesi + durum + gizlilik notu. onAcik(true/false) */
  function dugme({ onAcik, kucuk = false } = {}) {
    const btn = h("button.btn.mik-btn", { type: "button" });
    const durum = h("span.mik-durum", { role: "status" });
    const not = h("span.mik-not", "Ses yalnızca tarayıcınızda işlenir, hiçbir yere gönderilmez.");
    const wrap = h("div.mik" + (kucuk ? ".kucuk" : ""), btn, durum, not);
    function ciz() {
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        (stream ? "Mikrofonu kapat" : "Mikrofonu aç");
      btn.classList.toggle("on", !!stream);
    }
    btn.addEventListener("click", async () => {
      if (stream) { kapat(); durum.textContent = ""; }
      else {
        durum.textContent = "İzin bekleniyor…";
        const r = await ac();
        durum.textContent = r.ok ? "Dinliyor" : r.hata;
        durum.classList.toggle("hata", !r.ok);
      }
      ciz(); onAcik && onAcik(!!stream);
    });
    document.addEventListener("mikrofon", () => { ciz(); if (!stream) durum.textContent = ""; else if (!durum.classList.contains("hata")) durum.textContent = "Dinliyor"; });
    ciz();
    return wrap;
  }

  // başka slayta geçince dinleyiciler sıfırlanmaz (her demo kendi aboneliğini bırakır); mikrofon açık kalır
  window.Mikrofon = { ac, kapat, dinle, dugme, get acik() { return !!stream; }, destekHatasi };
})();
