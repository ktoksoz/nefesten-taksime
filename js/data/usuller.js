/* Usul verisi. vuruslar: [vuruş adı, süre (birim)]; birim = usulün paydası (8 → sekizlik, 4 → dörtlük).
   Kaynaklar: neyzenim.com usul tablosu; TDV İslâm Ansiklopedisi "Aksak", "Sofyan", "Semâî" maddeleri;
   Aykent 2020 (Erdem 79): Roman havası ve karşılama da 2+2+2+3 iskeletini kullanır.
   gruplar: vurgu grupları (birim). dogrula: kaynaklarda düm-tek dizilimi bulunamadı ya da çelişkili. */
(function (root) {
  const USULLER = [
    { id: "sofyan", ad: "Sofyan", olcu: "4/4", payda: 4, gruplar: [2, 1, 1],
      vuruslar: [["düm", 2], ["te", 1], ["ke", 1]], tempo: 80, kaynak: "TDV; neyzenim.com",
      not: "Şarkı formunda çok kullanılır." },
    { id: "nimsofyan", ad: "Nim sofyan (sirto)", olcu: "2/4", payda: 4, gruplar: [1, 1],
      vuruslar: [["düm", 1], ["tek", 1]], tempo: 104, kaynak: "TDV",
      not: "TDV'ye göre sirto ve longalarda kullanılır." },
    { id: "aksak", ad: "Aksak", olcu: "9/8", payda: 8, gruplar: [2, 2, 2, 3],
      vuruslar: [["düm", 2], ["te", 1], ["ke", 1], ["düm", 2], ["tek", 2], ["tek", 1]], tempo: 260, kaynak: "TDV; neyzenim.com",
      not: "Roman havası ve karşılama da bu 2+2+2+3 iskeletini kullanır (Aykent 2020)." },
    { id: "romanhavasi", ad: "Roman havası", olcu: "9/8", payda: 8, gruplar: [2, 2, 2, 3],
      vuruslar: [["düm", 2], ["te", 1], ["ke", 1], ["düm", 2], ["tek", 2], ["tek", 1]], tempo: 300, kaynak: "Aykent 2020",
      not: "Aksak usulün iskeleti; burada aksak usulün düm-tek dizilimiyle çalınır. Darbukacılar bu iskeleti süsleyerek çalar." },
    { id: "karsilama", ad: "Karşılama", olcu: "9/8", payda: 8, gruplar: [2, 2, 2, 3],
      vuruslar: [["düm", 2], ["te", 1], ["ke", 1], ["düm", 2], ["tek", 2], ["tek", 1]], tempo: 240, kaynak: "Aykent 2020; Çolakoğlu 1984",
      not: "Karşılama bir oyun türüdür; ezgileri çoğunlukla 9/8'liktir." },
    { id: "devrihindi", ad: "Devr-i hindî", olcu: "7/8", payda: 8, gruplar: [3, 2, 2],
      vuruslar: [["düm", 1], ["tek", 1], ["tek", 1], ["düm", 2], ["tek", 2]], tempo: 220, kaynak: "neyzenim.com" },
    { id: "aksaksemai", ad: "Aksak semâî", olcu: "10/8", payda: 8, gruplar: [3, 2, 2, 3],
      vuruslar: [["düm", 2], ["te", 1], ["kâ", 2], ["düm", 2], ["tek", 2], ["tek", 1]], tempo: 220, kaynak: "TDV; neyzenim.com",
      not: "Aykent 2020 grupları 2+3+2+3 olarak veriyor; kaynaklar burada ayrışıyor." },
    { id: "ciftetelli", ad: "Çiftetelli", olcu: "8/8", payda: 8, gruplar: [3, 3, 2],
      vuruslar: null, tempo: 260, dogrula: true, kaynak: "",
      not: "Çiftetelli için güvenilir bir düm-tek dizilimi bulamadık; yalnızca 3+3+2 vurgu grupları çalınır. Bir ritim ustasının denetimi bekleniyor." },
  ];
  USULLER.forEach((u) => {
    u.uzunluk = u.gruplar.reduce((a, b) => a + b, 0);
    // olay listesi: [birim konumu, vuruş adı, süre]
    let t = 0;
    u.olaylar = u.vuruslar
      ? u.vuruslar.map(([ad, d]) => { const o = [t, ad, d]; t += d; return o; })
      : (() => { const o = []; let p = 0; u.gruplar.forEach((g, i) => { o.push([p, i === 0 ? "vurgu" : "tık", g]); p += g; }); return o; })();
  });
  const usul = (id) => USULLER.find((u) => u.id === id);
  const out = { USULLER, usul };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else Object.assign(root, out);
})(typeof window !== "undefined" ? window : globalThis);
