# Nefesten Taksime

**https://egitim.koraytoksoz.com/klarnet/**

Türk müziğinde Sol klarnet: ilk sesten parmak pozisyonlarına, koma perdelerinden makamlara ve usullere, oradan bir şarkıya ve taksime uzanan etkileşimli bir eğitim. Hazırlayan: **Koray Toksöz**.

*An interactive Turkish-language course on the G clarinet in Turkish music, with a physically modelled clarinet, a koma tuner, an usul metronome and a microphone-guided song lesson. Code: MIT · Content: CC BY 4.0 · Song data: CC BY-NC-SA 4.0.*

## İçerik

41 slayt, 12 bölüm. Her slaytta bir deney, sunucu notu (kaynaklarıyla) ve sesli anlatım var.

| Bölüm | Slaytlar ve deneyler |
|---|---|
| 0. Giriş | Kapak: 78'lik plak ve 53 komalık perde çemberi |
| 1. Klarnet ve Türk müziği | Zaman çizelgesi (chalumeau ve register); fasıl ve oyun havası; usta icracılar |
| 2. Klarnet nasıl ses çıkarır? | Kamış supabı ve canlı model dalgası; tek harmonikler; onikili; delikler ve etkin boru boyu |
| 3. Çalgıyı tanı | Parçalar ve takma sırası; Sol ve Si♭ klarnet; Albert ve Boehm; kamış sertliği |
| 4. İlk ses | Ağız yapısı; nefes × dudak haritası (modelden ölçülmüş); dil vuruşu; uzun ses (mikrofon) |
| 5. Parmaklar ve notalar | Alt register; üst register; **parmak tablosu**; yazılan ve duyulan (ahenk hesaplayıcı) |
| 6. Türk müziğinin perdeleri | Koma; perde ızgarası; koma perdeleri klarnette (dudak, yarım delik, alternatif); **koma akort aleti** |
| 7. Makamlar | Durak, güçlü, yeden; dörtlü ve beşliler; dokuz makam; Roman havalarında makam |
| 8. Usuller | Düm ve tek; **usul metronomu**; dokuz sekizlik; bir oyun havası |
| 9. Bir şarkı: Gamzedeyim | Eserin hikâyesi; **cümle cümle öğren (mikrofon dinler, doğru notada ilerler)**; birlikte çal (isabet şeridi) |
| 10. Süslemeler ve taksim | Çarpma, glissando, vibrato, tril; uşşak taksimi; taksim alanı |
| 11. Bakım ve pratik | Bakım; günlük pratik zamanlayıcısı; kapanış |

## Çalıştırma

Derleme yok. `index.html` doğrudan açılabilir, ama fiziksel model (AudioWorklet) ve mikrofon güvenli bağlam ister; yerel sunucu önerilir:

```
python3 tools/serve.py 8803
```

`file://` ile açılırsa klarnet yedek sentezle (tek harmonikli toplamsal sentez) çalar ve mikrofon kapalıdır.

## Kısayollar

| Tuş | İşlev |
|---|---|
| → / ← | İleri / geri |
| Boşluk | Usul çalan slaytta usulü başlat/durdur; diğerlerinde ileri |
| N | Sunucu notları |
| T | Metni gizle (sunum) |
| O | Bütün slaytlar |
| F | Tam ekran |
| A | Sesli anlatım |
| G | Deney gösterimlerini aç/kapa |
| M | Sesi kapat |

Klarnet çiziminde ağızlığı basılı tutmak klarneti üfler; deliğe uzun basmak ya da sağ tık deliği yarım kapatır.

## Yapı

```
index.html              slaytlar (metin, deney yeri, sunucu notları)
css/style.css           görsel sistem ("Abanoz ve taş plak")
css/demos.css           deney stilleri
js/klarnet.js           saf hesaplar: perde ↔ koma ↔ cent ↔ frekans, aktarım, ahenk
js/yin.js               YIN perde bulma
js/ses/klarnet-dsp.js   dalga kılavuzu + kamış modeli (Node ve AudioWorklet ortak)
js/ses/klarnet-worklet.js, klarnet-ses.js   AudioWorklet işlemcisi, yükleyici ve yedek sentez
js/klarnet-ciz.js       sitenin tek klarnet bileşeni (SVG)
js/perde.js             mikrofon (izin yalnız düğmeyle) ve perde algılama
js/usul.js              Web Audio saatiyle usul çalıcı, darbuka ve def sentezi
js/cizim.js, isaret.js  perde ızgarası, usul halkası, AEU değiştirici işaretleri
js/data/                parmaklar, makamlar, usuller, nefes haritası, şarkı verisi
js/demos/b0…b11         bölüm deneyleri
js/app.js, lib.js, audio.js, narrator.js, guide.js, glossary.js   slayt motoru (müzik eğitiminden uyarlandı)
tools/                  sunucu, yayın, ölçüm, ekran görüntüsü ve etkileşim araçları
test/klarnet.test.js    birim testleri
docs/                   araştırma notları (yayınlanmaz)
```

## Testler ve ölçümler

```
node test/klarnet.test.js                    # 165 test: koma/cent/frekans, makamlar, aktarım, usuller, YIN, model
node tools/olcum.js                          # modelin 40 pozisyondaki frekans sapması
NODE_PATH=<playwright-core> node tools/etkilesim.js 8803 <gamze.wav> <dugah.wav>
NODE_PATH=<playwright-core> node tools/rehber_kontrol.js 8803
NODE_PATH=<playwright-core> node tools/ekran.js 8803 <klasör> 1440x860,1180x820,390x844
```

`tools/wav_uret.js` sahte mikrofon testi için modelle çalınmış WAV dosyaları üretir.

## Yeniden üretme

- **Nefes haritası:** `node tools/harita.js` → `js/data/nefes-harita.js`
- **Şarkı verisi:** SymbTr deposundan `txt/ussak--sarki--sofyan--gamzedeyim_deva--tatyos_efendi.txt` dosyasını indirip `python3 tools/sarki_uret.py <dosya> > js/data/sarki-gamzedeyim.js` (ham dosyalar lisansları gereği bu depoda yok).
- **Anlatım sesleri:** metinler `tools/narration.json`; ElevenLabs, "İrem" sesi, `eleven_multilingual_v2`, Türkçe. Her dosya `audio/<slayt-id>.mp3`.

## Yayınlama

```
tools/deploy.sh
```

`?v=` sürüm etiketlerini yeniler ve `~/egitim.koraytoksoz.com/klarnet/` klasörüne rsync ile yükler (`--delete` yok; `tools`, `test`, `docs` yüklenmez).

## Doğrulama durumu

**Bu site bir klarnetçi tarafından denetlenmeden yayınlanmamalıdır.** Aşağıdakiler kaynaklarla doğrulanamadı ya da gerçek bir klarnetle denenmesi gerekiyor.

**Bir klarnetçinin denetlemesi gerekenler**

1. Bütün parmak pozisyonları (WFG Albert/Oehler tablosundan; Türk Sol klarnetlerinin klape düzeni modelden modele değişebilir). Özellikle Fa4 (yan 3. anahtar), Do6 ve altissimo pozisyonları.
2. Çeyrek ses pozisyonları ve segâh için önerilen alternatif (yalnız sağ yan 1. anahtar, Si4 −50 cent) — hepsi "doğrulanmalı".
3. Koma perdelerinde yarım deliğin kullanımı (burada yalnız fizik gösterimi).
4. Ağız yapısı tarifi ve "çok gevşek / çok sıkı" seslerin tarifi.
5. Takma sırası ve bakım adımları (köprü anahtarı, ağızlığın yıkanması).
6. Usuller: çiftetelli (düm-tek dizilimi yok, yalnız 3+3+2), aksak semâî (3+2+2+3 mü, 2+3+2+3 mü), Roman havası ve karşılamanın aksak düm-tek dizilimiyle çalınması.
7. Ahenkler: şah ve davud (ikincil kaynak), yıldız (listeden çıkarıldı).
8. Makam seyir cümleleri (bu site için yazıldı) makamın karakterini doğru veriyor mu.
9. Gamzedeyim'in basit sürümü (çarpmalar çıkarıldı) ve segâhın 16 koma (SymbTr) olarak hedeflenmesi.
10. Şükrü Tunar'ın doğum yeri (Edremit / Edirne).
11. "Ağlama" ve "gırtlak" gibi terimler için kaynaklı tanım bulunamadı; sitede yer almıyor.

**Gerçek bir klarnetle denenmesi gerekenler**

1. Akort aleti gerçek bir Sol klarnette doğru perdeyi buluyor mu (pes notalar, yazılı Mi3 ≈ 123 Hz; tiz notalar).
2. Gamzedeyim öğrenme akışı: ±30 cent tolerans ve 200 ms tutma süresi gerçek çalışta uygun mu; art arda aynı notada yeni atak algısı.
3. Birlikte çal: isabet şeridindeki gecikme (mikrofon gecikmesi) payı.
4. Uzun ses ölçüleri (kararlılık, vibrato hızı) gerçek bir vibratoyu doğru ölçüyor mu.
5. Telefonda (iOS Safari) mikrofon izni, AudioWorklet ve ses başlatma.
6. Taksim alanı rehberinin adım koşulları gerçek çalışta anlamlı mı.

## Kaynaklar ve ileri okuma

**Klarnet, akustik ve model**
- J. Wolfe, "Clarinet acoustics: an introduction", UNSW Music Acoustics. https://newt.phys.unsw.edu.au/jw/clarinetacoustics.html
- M. E. McIntyre, R. T. Schumacher, J. Woodhouse, "On the oscillations of musical instruments", *JASA* 74(5), 1983.
- J. O. Smith III, *Physical Audio Signal Processing*. https://ccrma.stanford.edu/~jos/pasp/
- P. Cook, G. Scavone, The Synthesis ToolKit (STK). https://ccrma.stanford.edu/software/stk/
- A. de Cheveigné, H. Kawahara, "YIN, a fundamental frequency estimator for speech and music", *JASA* 111(4), 2002.
- E. Hoeprich, *The Clarinet*, Yale University Press, 2008.
- Wikipedia: "Clarinet", "Chalumeau", "Johann Christoph Denner", "Albert system", "Boehm system (clarinet)", "Register key".
- The Woodwind Fingering Guide, Albert/Oehler ve Boehm klarnet tabloları. https://www.wfg.woodwind.org/clarinet/

**Türk müziğinde klarnet**
- Kılıç (2023), *Sanat ve Tasarım Dergisi* 13(2), 608–619. https://dergipark.org.tr/tr/download/article-file/3595532
- Üstündağ ve Kurtaslan (2024), *Korkut Ata Türkiyat Araştırmaları Dergisi* 15, 1362–1378. https://dergipark.org.tr/en/download/article-file/3803256
- Şahinoğlu (2022), *Yegah Müzikoloji Dergisi* 5(2), 296–316. https://dergipark.org.tr/en/download/article-file/2814075
- Taşır vd. (2019), *ASEAD* 6(6).
- Kılınçer ve Mustan Dönmez (2013), Malatya Roman müzisyenleri saha çalışması. https://dergipark.org.tr/tr/download/article-file/255448
- E. Estrin, "The Turkish Clarinet", D'Addario, 2021. https://www.dansr.com/resources/the-turkish-clarinet
- MEB Güzel Sanatlar Lisesi Klarnet Dersi Öğretim Programı. https://mufredat.meb.gov.tr/Dosyalar/201992691038263-%C3%A7alg%C4%B1%20e%C4%9Fitimi%20klarnet.pdf
- Sefa Yaşar (2021), yüksek lisans tezi, AMGSÜ (koma perdeleri; tam metnine erişilemedi).

**Perdeler, makamlar, usuller, ahenk**
- Can (2002), *GEFAD* 22(1).
- TDV İslâm Ansiklopedisi: "Makam", "Rast", "Uşşak", "Hüseynî", "Hicaz", "Nihâvend", "Kürdî", "Sabâ", "Karcığar", "Hicazkâr", "Usul", "Sofyan", "Aksak", "Âhenk", "Taksim", "Mızıka-i Hümâyun", "Tatyos Efendi". https://islamansiklopedisi.org.tr
- Wikipedia, "Turkish makam" (AEU değiştirici işaretleri ve perde tablosu); SMuFL, "Arel-Ezgi-Uzdilek (AEU) accidentals".
- O. Yarman, "RaDüSe". https://www.ozanyarman.com/RaDuSe1.html
- Hatipoğlu (2013), *İstem* 11(22), 131–144. https://dergipark.org.tr/tr/download/article-file/260938
- musiki.org, "Akort". http://www.musiki.org/akort.htm
- neyzenim.com usul tablosu; Aykent (2020), *Erdem* 79.
- M. K. Karaosmanoğlu (2012), SymbTr, ISMIR. https://github.com/MTG/SymbTr

**İleri okuma önerileri:** Wolfe'un UNSW sayfaları (klarnet akustiği); Smith'in *Physical Audio Signal Processing* kitabı (model); TDV makam maddeleri; Şahinoğlu (2022) ve Kılıç (2023) (Türk müziğinde klarnet tekniği); Serkan Çağrı, *Sol Klarnet Eğitimi 1* (2006).

Müzik teorisinin temelleri için aynı serinin eğitimi: [Titreşimden Şarkıya](https://egitim.koraytoksoz.com/muzik/).

## Lisans

| Ne | Lisans |
|---|---|
| Kod (`js/`, `css/`, `tools/`, `test/`, `index.html`) | MIT |
| İçerik (metinler, notlar, sözlük, anlatım metinleri ve sesleri) | CC BY 4.0 |
| `js/data/sarki-gamzedeyim.js` (SymbTr'den) | CC BY-NC-SA 4.0 |
| Fontlar (Gloock, Commissioner) | SIL OFL 1.1 (Google Fonts) |

Önerilen atıf: *Koray Toksöz, Nefesten Taksime, https://egitim.koraytoksoz.com/klarnet/*

Ayrıntılar için `LICENSE`.
