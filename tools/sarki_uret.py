"""SymbTr dosyasından js/data/sarki-gamzedeyim.js üretir.
Kaynak: SymbTr (Karaosmanoğlu 2012), ussak--sarki--sofyan--gamzedeyim_deva--tatyos_efendi.txt, CC BY-NC-SA 4.0.
Kullanım: python3 tools/sarki_uret.py docs/ham/gamzedeyim/<dosya>.txt > js/data/sarki-gamzedeyim.js
Yalnızca eserin ilk geçişi (satır 2–272) alınır; ikinci geçiş aynı ezginin tekrarıdır (son dizesinde hece hatası var).
Koma: Rast (yazılı Sol4, SymbTr Koma53 = 296) = 0."""
import sys, csv, json
rows = list(csv.DictReader(open(sys.argv[1], encoding="utf-8"), delimiter="\t"))
RAST = 296
notes = []
for r in rows:
    sira = int(r["Sira"])
    if sira < 2 or sira > 272: continue
    kod = r["Kod"]
    if kod not in ("8", "9", "10"): continue
    k = int(r["Koma53"])
    pay, payda = int(r["Pay"]), int(r["Payda"])
    on6 = 0 if payda == 0 else round(16 * pay / payda)   # süre: on altılık
    soz = r["Soz1"].strip()
    if soz in (".",): soz = ""
    notes.append({"s": sira, "k": None if k < 0 else k - RAST, "d": on6, "c": kod == "8", "soz": soz, "o": float(r["Offset"]), "ad": r["Nota53"]})
# bölümler (birlik = birlik nota; Offset bitiş zamanı)
def kes(a, b, ad):
    out = []
    for n in notes:
        bas = n["o"] - n["d"] / 16
        if n["c"]:
            bas = n["o"]
        if bas >= a - 1e-6 and bas < b - 1e-6:
            out.append(n)
    return {"ad": ad, "notalar": [[n["k"], n["d"], n["soz"], 1 if n["c"] else 0] for n in out]}
bol = [
    kes(0, 8, "Aranağme"),
    kes(8, 11.5, "Hey hey"),
    kes(11.5, 14.25, "Saz"),
    kes(14.25, 16.25, "Gamzedeyim devâ bulmam"),
    kes(16.25, 18.25, "Garibim bir yuva bulmam"),
    kes(22.25, 24.25, "Kaderimdir hep çektiren"),
    kes(24.25, 26.25, "İnlerim hiç rehâ bulmam"),
]
# ilk nota ön vuruşla başlıyorsa bölüm sınırları SymbTr'deki ölçüleri izler
print("""/* Gamzedeyim Devâ Bulmam: Kemanî Tatyos Efendi (1858–1913), uşşak makamı, sofyan usulü.
   Beste kamu malıdır (FSEK md. 27: ölümünün üzerinden 70 yıl geçti).
   NOTA VERİSİ: SymbTr derlemesinden dönüştürüldü (M. K. Karaosmanoğlu, "A Turkish Makam Music Symbolic Database
   for Music Information Retrieval: SymbTr", ISMIR 2012; https://github.com/MTG/SymbTr).
   Bu dosyanın lisansı sitenin geri kalanından farklıdır: CC BY-NC-SA 4.0 (Atıf-GayriTicari-AynıLisanslaPaylaş).
   Üreten araç: tools/sarki_uret.py. Yalnızca eserin ilk geçişi alındı.
   Biçim: [koma (Rast = 0; null = es), süre (on altılık), hece, çarpma (1 = süresiz süsleme notası)]
   Not: SymbTr uşşaktaki segâhı çoğu yerde Rast'tan 16 koma (AEU segâhından 1 koma pest) yazar. */
(function (root) {
  const GAMZEDEYIM = """ + json.dumps({"ad": "Gamzedeyim Devâ Bulmam", "besteci": "Kemanî Tatyos Efendi", "makam": "uşşak", "usul": "sofyan", "tempo": 80, "bolumler": bol}, ensure_ascii=False) + """;
  if (typeof module !== "undefined" && module.exports) module.exports = GAMZEDEYIM;
  else root.GAMZEDEYIM = GAMZEDEYIM;
})(typeof window !== "undefined" ? window : globalThis);""")
