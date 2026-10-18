/* Klarnet hesapları: perde ↔ koma ↔ cent ↔ frekans, yazılı nota ↔ duyulan ses (aktarım), ahenk.
   Saf hesap modülü: DOM kullanmaz; tarayıcıda window.K, Node'da require("./klarnet.js").

   Kurallar (kaynaklar docs/arastirma.md ve sunucu notlarında):
   - Arel–Ezgi–Uzdilek (AEU) sistemi: oktav 53 eşit koma; 1 koma = 1200/53 ≈ 22,64 cent.
   - AEU yazımında doğal notalar Pisagor aralıklarıyla dizilir: Rast (yazılı Sol4) = 0, Dügâh (La) 9,
     Bûselik (Si) 18, Çârgâh (Do) 22, Nevâ (Re) 31, Hüseynî (Mi) 40, Acem (Fa) 44, Gerdâniye (Sol) 53.
     Değiştirici işaretler bu doğallardan 1, 4, 5 ya da 8 koma sapmadır.
   - Sol klarnet yazılandan tam dörtlü (5 yarım ses) pest duyulur; Si♭ klarnet büyük ikili (2 yarım ses) pest.
   - Ahenk: yazılı Rast perdesinin hangi sesle duyulduğu. Bolahenkte Rast = Re (dügâh ≈ 330 Hz). */
(function (root) {
  const KOMA_CENT = 1200 / 53;
  const A4 = 440;

  /* ---- Temel dönüşümler ---- */
  const mtof = (m, a4 = A4) => a4 * Math.pow(2, (m - 69) / 12);
  const ftom = (f, a4 = A4) => 69 + 12 * Math.log2(f / a4);
  const cents = (f1, f2) => 1200 * Math.log2(f2 / f1);
  const komaToCent = (k) => k * KOMA_CENT;
  const centToKoma = (c) => c / KOMA_CENT;

  /* ---- Nota adları (yazılı, Batı) ---- */
  const HARF = ["Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "Si♭", "Si"];
  const HARF_LAT = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
  const notaAdi = (m) => HARF[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  const notaLat = (m) => HARF_LAT[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
  // "E3", "F#4", "Bb5", "Sol4", "Si♭4" → MIDI
  function notaNo(s) {
    const lat = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const sol = { Do: 0, Re: 2, Mi: 4, Fa: 5, Sol: 7, La: 9, Si: 11 };
    let m = /^([A-G])([#♯b♭]?)(-?\d)$/.exec(s), base, acc, oct;
    if (m) { base = lat[m[1]]; acc = m[2]; oct = +m[3]; }
    else {
      m = /^(Do|Re|Mi|Fa|Sol|La|Si)([#♯b♭]?)(-?\d)$/.exec(s);
      if (!m) throw new Error("Nota adı anlaşılamadı: " + s);
      base = sol[m[1]]; acc = m[2]; oct = +m[3];
    }
    return (oct + 1) * 12 + base + (acc === "#" || acc === "♯" ? 1 : acc === "b" || acc === "♭" ? -1 : 0);
  }

  /* ---- AEU perdeleri ----
     koma: Rast = 0'dan uzaklık (Rast, yazılı Sol4).
     harf: AEU yazımındaki doğal nota (yazılı MIDI), isaret: o doğaldan koma sapması.
     Orta oktav (Yegâh–Tiz nevâ) adları Can 2002 ve TDV tablolarından; çok pes ve çok tiz bölgede
     "Kaba" ve "Tiz" önekleri bir oktav farkı anlatır (MEB GSL klarnet programı: yazılı Mi3 = kaba hüseynî aşîrân). */
  // doğallar: Rast'tan koma (Pisagor), yazılı Sol4 = MIDI 67
  const DOGAL = [ // [harf adı, MIDI farkı (Sol4'ten), koma]
    ["Sol", 0, 0], ["La", 2, 9], ["Si", 4, 18], ["Do", 5, 22], ["Re", 7, 31], ["Mi", 9, 40], ["Fa", 10, 44],
  ];
  // Orta bölge: Yegâh (−22) … Gerdâniye (53) arası 24 perde (+ Rast'ın altı)
  const ORTA = [
    ["Yegâh", -22], ["Kaba nîm hisar", -18], ["Kaba hisar", -17], ["Kaba dik hisar", -14],
    ["Hüseynî aşîrân", -13], ["Acem aşîrân", -9], ["Dik acem aşîrân", -8], ["Irak", -5], ["Geveşt", -4], ["Dik geveşt", -1],
    ["Rast", 0], ["Nîm zirgüle", 4], ["Zirgüle", 5], ["Dik zirgüle", 8],
    ["Dügâh", 9], ["Kürdî", 13], ["Dik kürdî", 14], ["Segâh", 17],
    ["Bûselik", 18], ["Çârgâh", 22], ["Nîm hicaz", 26], ["Hicaz", 27], ["Dik hicaz", 30],
    ["Nevâ", 31], ["Nîm hisar", 35], ["Hisar", 36], ["Dik hisar", 39],
    ["Hüseynî", 40], ["Acem", 44], ["Dik acem", 45], ["Eviç", 48], ["Mâhur", 49], ["Dik mâhur", 52],
    ["Gerdâniye", 53], ["Nîm şehnaz", 57], ["Şehnaz", 58], ["Dik şehnaz", 61],
    ["Muhayyer", 62], ["Sünbüle", 66], ["Dik sünbüle", 67], ["Tiz segâh", 70],
    ["Tiz bûselik", 71], ["Tiz çârgâh", 75], ["Tiz nîm hicaz", 79], ["Tiz hicaz", 80], ["Tiz dik hicaz", 83],
    ["Tiz nevâ", 84],
  ];
  // Rast'ın altındaki oktav (yazılı Mi3–Do4): "Kaba" + bir oktav tizdeki perdenin adı
  const KABA_KAYNAK = ["Hüseynî aşîrân", "Acem aşîrân", "Dik acem aşîrân", "Irak", "Geveşt", "Dik geveşt",
    "Rast", "Nîm zirgüle", "Zirgüle", "Dik zirgüle", "Dügâh", "Kürdî", "Dik kürdî", "Segâh", "Bûselik",
    "Çârgâh", "Nîm hicaz", "Hicaz", "Dik hicaz"];
  // Tiz nevâ'nın üstü: "Tiz" + bir oktav pesteki perdenin adı
  const TIZ_KAYNAK = ["Nîm hisar", "Hisar", "Dik hisar", "Hüseynî", "Acem", "Dik acem", "Eviç", "Mâhur", "Dik mâhur", "Gerdâniye"];

  // yazılı doğal nota ve koma işareti: koma → {ad, midi, isaret}
  // AEU tablolarındaki yazım: doğaldan 0 ya da 1 koma sapan perde o doğalla yazılır (Segâh = Si koma bemol);
  // iki doğalın arasında 4 ve 5 komalık iki yazım varsa bakiyeli (4) olan seçilir (Zirgüle = La bakiye bemol,
  // Nîm hicaz = Do bakiye diyez, Eviç = Fa bakiye diyez). Kürdî ise Si küçük mücennep bemolüyle (♭) yazılır.
  function yazim(k) {
    const okt = Math.floor(k / 53);
    const r = k - okt * 53;
    const cands = DOGAL.concat([["Sol", 12, 53]]).map(([ad, dm, dk]) => ({ ad, midi: 67 + dm + okt * 12, isaret: r - dk }));
    cands.sort((a, b) => Math.abs(a.isaret) - Math.abs(b.isaret));
    const [a, b] = cands;
    if (Math.abs(a.isaret) <= 1) return a;
    if (r === 13) return cands.find((c) => c.isaret === -5);
    const four = [a, b].find((c) => Math.abs(c.isaret) === 4);
    return four || a;
  }
  // AEU'da kullanılan işaretler: 1 koma, 4 bakiye, 5 küçük mücennep, 8 büyük mücennep.
  // Yukarıdaki en yakın doğal seçimi 8'lik sapma yerine komşu doğaldan 1'lik sapma verir (ör. Segâh = Si koma bemol).
  const ISARET_ADI = { 1: "koma", 4: "bakiye", 5: "küçük mücennep", 8: "büyük mücennep", 9: "tanini" };

  const PERDELER = [];
  function ekle(ad, k) {
    const y = yazim(k);
    PERDELER.push({ ad, koma: k, harf: y.ad, harfMidi: y.midi, isaret: y.isaret, cent: komaToCent(k) });
  }
  KABA_KAYNAK.forEach((ad) => { const p = ORTA.find((x) => x[0] === ad); ekle("Kaba " + lower1(ad), p[1] - 53); });
  ORTA.forEach(([ad, k]) => { if (!PERDELER.some((p) => p.koma === k)) ekle(ad, k); });
  TIZ_KAYNAK.forEach((ad) => { const p = ORTA.find((x) => x[0] === ad); ekle("Tiz " + lower1(ad), p[1] + 53); });
  PERDELER.sort((a, b) => a.koma - b.koma);
  function lower1(s) { return s[0].toLocaleLowerCase("tr-TR") + s.slice(1); }

  const perde = (ad) => PERDELER.find((p) => p.ad === ad) || null;
  const perdeKoma = (k) => PERDELER.find((p) => p.koma === k) || null;
  // AEU'daki 24'lük ana perde kümesi: "Nîm" ve "Dik" önekleri koma-altı ayrıntılar; günlük kullanım için
  // yalnızca doğallar ve makamlarda geçen başlıca perdeler (ızgarada vurgulu çizilir).
  const ANA = new Set(["Yegâh", "Hüseynî aşîrân", "Acem aşîrân", "Irak", "Rast", "Zirgüle", "Dügâh", "Kürdî", "Dik kürdî", "Segâh",
    "Bûselik", "Çârgâh", "Nîm hicaz", "Hicaz", "Nevâ", "Hisar", "Hüseynî", "Acem", "Eviç", "Mâhur", "Gerdâniye",
    "Şehnaz", "Muhayyer", "Sünbüle", "Tiz segâh", "Tiz bûselik", "Tiz çârgâh", "Tiz nevâ"]);
  const anaMi = (p) => ANA.has(p.ad) || /^Kaba (hüseynî aşîrân|acem aşîrân|ırak|rast|zirgüle|dügâh|kürdî|segâh|bûselik|çârgâh)$/.test(p.ad) ||
    /^Tiz (hisar|hüseynî|acem|eviç|mâhur|gerdâniye)$/.test(p.ad);

  /* ---- Perde ↔ 12 ses ----
     Perdenin yazılı 12 sesli karşılığı: en yakın yarım ses ve sapma (cent). Klarnet eşit tamperamanlı
     yapılmıştır; Rast'ı (yazılı Sol4) eşit tamperamanlı Sol'e eşitleriz. */
  function perdeYazili(k) {
    const c = komaToCent(k);
    const yarim = Math.round(c / 100);
    return { midi: 67 + yarim, sapma: c - yarim * 100 };
  }
  // perdenin dizideki "sapan" olup olmadığı: 12 sesten ±10 cent'ten fazla uzaksa koma rengiyle çizilir
  const sapanMi = (k) => Math.abs(perdeYazili(k).sapma) > 10;

  /* ---- Klarnet türleri ve aktarım ---- */
  const KLARNETLER = {
    sol: { ad: "Sol klarnet", kisa: "Sol", aktarim: -5 },
    sib: { ad: "Si♭ klarnet", kisa: "Si♭", aktarim: -2 },
    do: { ad: "Do klarnet", kisa: "Do", aktarim: 0 },
  };
  // yazılı MIDI → duyulan MIDI
  const duyulan = (yaziliMidi, tur = "sol") => yaziliMidi + KLARNETLER[tur].aktarim;
  const yazilan = (duyulanMidi, tur = "sol") => duyulanMidi - KLARNETLER[tur].aktarim;
  const yaziliFrekans = (yaziliMidi, tur = "sol", a4 = A4) => mtof(duyulan(yaziliMidi, tur), a4);

  /* ---- Ahenkler ----
     rast: yazılı Rast'ın (Sol4) duyulduğu ses (MIDI). Kaynaklılar: bolahenk Re4, mansur Sol3, kız La3, süpürde Do4.
     Davud ve şah için kaynaklar yalnızca arama özetinde; yıldız için kaynaklar çelişiyor → dogrula: true. */
  const AHENKLER = {
    bolahenk: { ad: "Bolahenk", rast: 62, kaynak: "musiki.org; Hatipoğlu 2013" },
    supurde: { ad: "Süpürde", rast: 60, kaynak: "Yarman, RaDüSe; Hatipoğlu 2013" },
    kiz: { ad: "Kız", rast: 57, kaynak: "Yarman, RaDüSe" },
    mansur: { ad: "Mansur", rast: 55, kaynak: "Yarman, RaDüSe; Hatipoğlu 2013" },
    sah: { ad: "Şah", rast: 53, dogrula: true },
    davud: { ad: "Davud", rast: 52, dogrula: true },
  };
  // ahenkte bir perdenin duyulan frekansı: Rast'ın eşit tamperamanlı frekansı × 2^(koma/53)
  const perdeFrekans = (k, ahenk = "bolahenk", a4 = A4) => mtof(AHENKLER[ahenk].rast, a4) * Math.pow(2, k / 53);
  // bir klarnet yazıldığı gibi çalındığında hangi ahenge düşer? (Rast'ın duyulduğu sesin perde sınıfı)
  function klarnetAhengi(tur) {
    const r = duyulan(67, tur);
    const pc = ((r % 12) + 12) % 12;
    const ad = Object.keys(AHENKLER).find((a) => ((AHENKLER[a].rast % 12) + 12) % 12 === pc);
    return ad ? { ahenk: ad, oktav: Math.round((r - AHENKLER[ad].rast) / 12) } : null;
  }

  /* ---- Frekans → en yakın perde (akort aleti) ----
     f: ölçülen frekans; ahenk; perde kümesi (varsayılan: hepsi). Dönüş: perde, koma ve cent sapması. */
  function enYakinPerde(f, { ahenk = "bolahenk", a4 = A4, kume = null } = {}) {
    const k = 53 * Math.log2(f / mtof(AHENKLER[ahenk].rast, a4));
    const liste = kume || PERDELER;
    let best = null;
    for (const p of liste) {
      const d = k - p.koma;
      if (!best || Math.abs(d) < Math.abs(best.komaSapma)) best = { perde: p, komaSapma: d };
    }
    if (!best) return null;
    best.centSapma = best.komaSapma * KOMA_CENT;
    best.koma = k;
    return best;
  }
  // frekans → en yakın yazılı nota (12 ses) ve cent sapması, klarnet türüne göre
  function enYakinNota(f, tur = "sol", a4 = A4) {
    const d = ftom(f, a4);
    const r = Math.round(d);
    return { duyulan: r, yazili: yazilan(r, tur), cent: (d - r) * 100 };
  }

  /* ---- Makam yardımcıları ---- */
  // aralık dizisinden (koma) perde dizisi
  function dizi(durakKoma, araliklar) {
    const out = [durakKoma];
    araliklar.forEach((a) => out.push(out[out.length - 1] + a));
    return out;
  }
  const ARALIK_ADI = { 1: "koma", 4: "bakiye", 5: "küçük mücennep", 8: "büyük mücennep", 9: "tanini", 12: "artık ikili", 13: "artık ikili" };
  const ARALIK_KISA = { 4: "B", 5: "S", 8: "K", 9: "T", 12: "A", 13: "A" };

  const K = {
    KOMA_CENT, A4, mtof, ftom, cents, komaToCent, centToKoma,
    HARF, HARF_LAT, notaAdi, notaLat, notaNo,
    PERDELER, perde, perdeKoma, anaMi, yazim, ISARET_ADI, perdeYazili, sapanMi,
    KLARNETLER, duyulan, yazilan, yaziliFrekans,
    AHENKLER, perdeFrekans, klarnetAhengi, enYakinPerde, enYakinNota,
    dizi, ARALIK_ADI, ARALIK_KISA,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = K;
  else root.K = K;
})(typeof window !== "undefined" ? window : globalThis);
