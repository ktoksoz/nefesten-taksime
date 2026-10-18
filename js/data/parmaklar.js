/* Albert sistem klarnet parmak pozisyonları (yazılı notalar).
   Kaynak: The Woodwind Fingering Guide, "Basic / Alternate / Quarter Tone Fingering Chart for Oehler- and
   Albert-System Clarinet" (Eoin McAuley, Arnold Wendl; T. Reichard), https://www.wfg.woodwind.org/clarinet/
   Anahtar adları WFG'nin cl_fing.html şemasından; düzen MIMEd 18313 ve 15985 kayıtlarıyla karşılaştırıldı.

   Anahtar kimlikleri:
     R  register anahtarı (arka, sol başparmak)     T  başparmak deliği (arka)
     A  üst La anahtarı                              Gs yan Sol♯ anahtarı (sol işaret parmağı)
     L1 L2 L3  sol el delikleri                      LEb sol el Mi♭ çatal kolu (2 ile 3 arası)
     LCs LE LFs  sol serçe: Do♯/Sol♯, Mi/Si, Fa♯/Do♯
     S1 S3 S4  sağ el yan anahtarları (Albert'te 1, 3, 4)
     R1 R2 R3  sağ el delikleri                      RBb sağ el Si♭ çatal kolu (2 ile 3 arası)
     Ra alternatif anahtar (R2 ya da R3 basılınca kendiliğinden kapanır)
     RGs RF  sağ serçe: Sol♯/Re♯, Fa/Do
   "L1/2" gibi yazım deliğin yarım kapatıldığını gösterir.
   guven: "kaynak" = WFG temel tablosu; "model" = WFG'de belirli modeller için verilmiş;
          "dogrula" = çeyrek ses ya da koma pozisyonu, bir klarnetçinin denetimi bekleniyor. */
(function (root) {
  const ANAHTARLAR = {
    R: { ad: "Register anahtarı", yer: "arka" }, T: { ad: "Başparmak deliği", yer: "arka", delik: true },
    A: { ad: "La anahtarı", yer: "sol" }, Gs: { ad: "Yan Sol♯ anahtarı", yer: "sol" },
    L1: { ad: "Sol el 1. delik", yer: "sol", delik: true }, L2: { ad: "Sol el 2. delik", yer: "sol", delik: true },
    LEb: { ad: "Sol el Mi♭ kolu", yer: "sol" }, L3: { ad: "Sol el 3. delik", yer: "sol", delik: true },
    LCs: { ad: "Sol serçe Do♯ anahtarı", yer: "sol" }, LE: { ad: "Sol serçe Mi anahtarı", yer: "sol" }, LFs: { ad: "Sol serçe Fa♯ anahtarı", yer: "sol" },
    S1: { ad: "Sağ yan 1. anahtar", yer: "sag" }, S3: { ad: "Sağ yan 3. anahtar", yer: "sag" }, S4: { ad: "Sağ yan 4. anahtar (Mi♭)", yer: "sag" },
    R1: { ad: "Sağ el 1. delik", yer: "sag", delik: true }, Ra: { ad: "Alternatif anahtar", yer: "sag" },
    R2: { ad: "Sağ el 2. delik", yer: "sag", delik: true }, RBb: { ad: "Sağ el Si♭ kolu", yer: "sag" },
    R3: { ad: "Sağ el 3. delik", yer: "sag", delik: true },
    RGs: { ad: "Sağ serçe Sol♯ anahtarı", yer: "sag" }, RF: { ad: "Sağ serçe Fa anahtarı", yer: "sag" },
  };

  // [yazılı nota, ana pozisyon, [alternatifler: [pozisyon, not, güven]]]
  const TEMEL = [
    // Alt register (chalumeau): Mi3 – Si♭4
    ["E3", "T L1 L2 L3 LE R1 R2 R3 RF", [], "Pes Mi düzeltme anahtarı olan modellerde sağ başparmak anahtarı da basılır."],
    ["F3", "T L1 L2 L3 R1 R2 R3 RF"],
    ["F#3", "T L1 L2 L3 LFs R1 R2 R3 RF", [["T L1 L2 L3 LE R1 R2 R3", "", "kaynak"]]],
    ["G3", "T L1 L2 L3 R1 R2 R3"],
    ["G#3", "T L1 L2 L3 R1 R2 R3 RGs"],
    ["A3", "T L1 L2 L3 R1 R2"],
    ["A#3", "T L1 L2 L3 R1 R2 RBb", [["T L1 L2 L3 R1 R3", "çatal", "kaynak"]]],
    ["B3", "T L1 L2 L3 R1"],
    ["C4", "T L1 L2 L3"],
    ["C#4", "T L1 L2 L3 LCs"],
    ["D4", "T L1 L2"],
    ["D#4", "T L1 L2 LEb", [["T L1 L2 S4", "yan anahtarla", "kaynak"]]],
    ["E4", "T L1"],
    ["F4", "T L1 S3"],
    ["F#4", "T"],
    ["G4", "", [["R1 R2 R3", "sağ el kapalı (ses rengi için)", "kaynak"]]],
    ["G#4", "Gs", [["Gs R1 R3 RF", "sağ el kapalı", "kaynak"]]],
    ["A4", "A", [["A L3 R1 R3 RF", "sağ el kapalı", "kaynak"]]],
    ["A#4", "R A", [["R A L3 LE R1 RF", "sağ el kapalı", "kaynak"]]],
    // Üst register (clarion): Si4 – Do6 — alt registerin onikili üstü, register anahtarıyla
    ["B4", "R T L1 L2 L3 LE R1 R2 R3 RF"],
    ["C5", "R T L1 L2 L3 R1 R2 R3 RF"],
    ["C#5", "R T L1 L2 L3 LFs R1 R2 R3 RF", [["R T L1 L2 L3 LE R1 R2 R3", "", "kaynak"]]],
    ["D5", "R T L1 L2 L3 R1 R2 R3"],
    ["D#5", "R T L1 L2 L3 R1 R2 R3 RGs"],
    ["E5", "R T L1 L2 L3 R1 R2"],
    ["F5", "R T L1 L2 L3 R1 R2 RBb", [["R T L1 L2 L3 R1 R3", "çatal", "kaynak"]]],
    ["F#5", "R T L1 L2 L3 R1"],
    ["G5", "R T L1 L2 L3"],
    ["G#5", "R T L1 L2 L3 LCs"],
    ["A5", "R T L1 L2"],
    ["A#5", "R T L1 L2 LEb", [["R T L1 L2 S4", "yan anahtarla", "kaynak"], ["R T L1 L3", "çatal", "kaynak"]]],
    ["B5", "R T L1"],
    ["C6", "R T L2", [["R T L1 S3", "yan anahtarla", "kaynak"]]],
    // Yüksek register (altissimo): Do♯6 – Sol6
    ["C#6", "R T L2 L3 R1 R2 R3 RGs"],
    ["D6", "R T L2 L3 R1 R3 RGs"],
    ["D#6", "R T L2 L3 R1 RGs"],
    ["E6", "R T L2 L3 RGs"],
    ["F6", "R T L2 L3 LCs RGs"],
    ["F#6", "R T L2 RGs"],
    ["G6", "R T L2 S4 RGs"],
  ];

  // Çeyrek ses pozisyonları (WFG Albert/Oehler çeyrek ses tablosu, A. Wendl). cent: yazılı notadan sapma.
  // Bu pozisyonlar Türk müziği perdeleri için değil, çeyrek sesler için verilmiştir; koma perdelerinde
  // başlangıç noktası olarak gösterilir. Hepsi "doğrulanmalı".
  const CEYREK = [
    ["G#3", 50, "T L1 L2 L3 LE R1 R2 RF"],
    ["A3", 50, "T L1 L2 L3 R1 R2/2 R3", "sağ el 2. delik yarım"],
    ["A#3", 50, "T L1 L2 L3 R1 Ra RBb"],
    ["B3", 50, "T L1 L2 L3 R2 RF"],
    ["C4", 50, "T L1 L2 L3 LCs R1"],
    ["C#4", 50, "T L1 L2 R1 R2"],
    ["D4", 50, "T L1 L2 L3 LCs S4"],
    ["D#4", 50, "T L1 L3 R2"],
    ["E4", 50, "T L1 S4"],
    ["F4", 50, "T L2", "Avusturya modellerinde değil"],
    ["F#4", 50, "T S3"],
    ["G4", 50, "T Gs"],
    ["G#4", 50, "T A"],
    ["A4", 50, "R T A L1"],
    ["A#4", 50, "S1"],
    ["B4", 50, "R A S1"],
    ["C5", 50, "R T L1 L2 L3 LE LFs R1 R2 R3 RF"],
    ["D5", 50, "R T L1 L2 L3 LE R1 R2 R3 RGs RF"],
    ["D#5", 50, "R T L1 L2 L3 R1 R2 RF"],
    ["E5", 50, "R T L1 L2 L3 LFs R1 R2 RGs"],
    ["F5", 50, "R T L1 L2 L3 R1 Ra"],
    ["F#5", 50, "R T L1 L2 L3 R3"],
    ["G5", 50, "R T L1 L2 L3 LCs R1"],
    ["G#5", 50, "R T L1 L2 LE R1 R2 R3 RF"],
    ["A5", 50, "R T L1 L2 R1 R2 R3 RF"],
    ["A#5", 50, "R T L1 L2 L3 LFs S4 R1 R2 R3 RF"],
    ["B5", 50, "R T L1 L3 R1 R2 R3"],
  ];

  const parse = (s) => {
    const o = {};
    s.split(/\s+/).filter(Boolean).forEach((t) => {
      const [k, half] = t.split("/");
      o[k] = half ? 0.5 : 1;
    });
    // alternatif anahtar R2 ya da R3 basılınca kapanır
    if ((o.R2 || o.R3) && !o.Ra) o.Ra = Math.max(o.R2 || 0, o.R3 || 0) >= 1 ? 1 : 0;
    return o;
  };

  const NOTA = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const midi = (s) => { const m = /^([A-G])(#?)(\d)$/.exec(s); return (+m[3] + 1) * 12 + NOTA[m[1]] + (m[2] ? 1 : 0); };

  const PARMAKLAR = TEMEL.map(([n, f, alt = [], not = ""]) => ({
    yazili: n, midi: midi(n), ana: f, kapali: parse(f), not,
    alt: alt.map(([p, nt, g]) => ({ f: p, kapali: parse(p), not: nt, guven: g })),
    guven: "kaynak",
  }));
  const CEYREK_SESLER = CEYREK.map(([n, c, f, not = ""]) => ({ yazili: n, midi: midi(n), cent: c, ana: f, kapali: parse(f), not, guven: "dogrula" }));

  const parmak = (m) => PARMAKLAR.find((p) => p.midi === m) || null;
  // kapalı anahtar kümesinden pozisyonu tanı: tam eşleşme (yarım delikler hariç)
  function tani(kapali) {
    const key = (o) => Object.keys(o).filter((k) => o[k] >= 1 && k !== "Ra").sort().join(" ");
    const hedef = key(kapali);
    for (const p of PARMAKLAR) {
      if (key(p.kapali) === hedef) return { parmak: p, alt: null };
      for (const a of p.alt) if (key(a.kapali) === hedef) return { parmak: p, alt: a };
    }
    for (const q of CEYREK_SESLER) if (key(q.kapali) === hedef) return { ceyrek: q };
    return null;
  }

  /* Tabloda olmayan bir anahtar birleşiminin yaklaşık sesi (yazılı MIDI + sent).
     Kaba bir kural: ilk açık delik boru boyunu belirler; altındaki kapalı delikler (çatal) perdeyi biraz
     düşürür; yarım delik bir sonraki basamağa doğru kaydırır; register anahtarı onikili çıkarır.
     Gerçek klarnette bu birleşimlerin sesi modele göre değişir; ekranda "yaklaşık" diye gösterilir. */
  const ZINCIR = ["T", "L1", "L2", "L3", "R1", "R2", "R3"];
  const ZINCIR_SES = [67, 66, 64, 62, 60, 59, 57, 55]; // ilk açık delik i iken (7 = hepsi kapalı)
  function tahmin(k) {
    const t = tani(k);
    if (t && t.ceyrek) return { midi: t.ceyrek.midi, cent: t.ceyrek.cent, kaynak: "ceyrek", bilgi: t.ceyrek };
    if (t) return { midi: t.parmak.midi, cent: 0, kaynak: t.alt ? "alt" : "tablo", bilgi: t.parmak, alt: t.alt };
    const c = (id) => k[id] || 0;
    let i = ZINCIR.findIndex((id) => c(id) < 1);
    if (i < 0) i = 7;
    let m = ZINCIR_SES[i], cent = 0;
    const reg = c("R") >= 1;
    if (i <= 1 && c("A") >= 1) { m = reg ? 70 : 69; return { midi: m, cent: 0, kaynak: "tahmin" }; }
    if (i <= 1 && c("Gs") >= 1) m = 68;
    if (i === 7) {
      if (c("RF") >= 1) m = c("LE") >= 1 ? 52 : c("LFs") >= 1 ? 54 : 53;
      else if (c("LE") >= 1) m = 54;
      else if (c("RGs") >= 1) m = 56;
    }
    if (i === 4 && c("LCs") >= 1) m += 1;
    if (i === 3 && (c("LEb") >= 1 || c("S4") >= 1)) m += 1;
    if (i === 2 && c("S3") >= 1) m += 1;
    if (i === 6 && c("RBb") >= 1) m += 1;
    // yarım kapalı ilk açık delik: bir sonraki basamağa doğru
    if (i < 7 && c(ZINCIR[i]) === 0.5) cent -= (ZINCIR_SES[i] - ZINCIR_SES[i + 1]) * 100 * 0.45;
    // çatal: ilk açık deliğin altındaki kapalı delikler perdeyi düşürür
    let kapaliAlt = 0;
    for (let j = i + 1; j < 7; j++) if (c(ZINCIR[j]) >= 1) kapaliAlt++;
    if (kapaliAlt) cent -= Math.min(90, 35 + 20 * (kapaliAlt - 1));
    if (reg) m += 19;
    // sent ±50'yi aşarsa yarım sese yuvarla
    while (cent <= -50) { m -= 1; cent += 100; }
    return { midi: m, cent, kaynak: "tahmin" };
  }

  const out = { ANAHTARLAR, PARMAKLAR, CEYREK_SESLER, parmak, tani, tahmin, parseParmak: parse };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else Object.assign(root, out);
})(typeof window !== "undefined" ? window : globalThis);
