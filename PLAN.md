# Klarnet sitesi: plan (onay için)

**Önerilen ad:** *Nefesten Taksime*. Alt başlık: "Türk müziğinde Sol klarnet". Diğer eğitimlerin adlandırmasını izliyor ("Titreşimden Şarkıya", "Elektrondan Bilgisayara").
**Adres:** https://egitim.koraytoksoz.com/klarnet/ · **Klasör:** `yz/klarnet` · **Yerel port:** 8803
Kaynak notları: `docs/arastirma.md`.

Ağırlık: **A** = ağır (özel motor ya da simülasyon), **O** = orta, **H** = hafif.

---

## 1. Tasarım planı: "Abanoz ve taş plak"

### Bilinçli seçim
Brief'teki altı esin kaynağından dördünü seçtim:

1. **Grenadil gövde ve nikel-gümüş klapeler:** sitenin malzemesi. Zemin koyu ve hafif mor-kahve bir ağaç tonunda. Bütün çizgi işi soğuk gümüş renginde, ince ve hassas, bir klape mekanizması gibi. Ağaç dokusu kullanılmıyor, yalnızca renk ve parlaklık var.
2. **Taş plak etiketi:** tipografi ve dairesel düzen buradan geliyor.
   - Kapak bir 78'lik plak gibi: ortada etiket, çevrede oluklar.
   - Oluklar aynı zamanda 53 komalık perde çemberi.
   - Usul halkası da aynı plak dilini kullanıyor.
3. **Düğün mendili ve oya:** makam rolü renkleri kök boya tonlarından seçildi. Süs olarak kullanılmıyorlar; yalnızca anlam taşıyan yerlerde görünüyorlar.
4. **Perde ve makam diyagramlarının dairesel yapısı:** perde çemberi ve usul halkası.

İki kaynağı dışarıda bıraktım:
- **Meyhane ışığı:** loş amber parıltı klişeye kayıyor.
- **Hamparsum notası:** doğru çizmek çok iş, yanlış çizmek ayıp olur. Yalnızca nota yazımı slaytında küçük bir tarihî not olarak geçecek.

### Renk (zemin)
| Ad | Hex | Görev |
|---|---|---|
| Grenadil | `#231A1E` | ana zemin |
| Derin grenadil | `#2D2227` | sahne ve panel |
| Oluk | `#4A3B41` | ince çizgi, ızgara |
| Kemik | `#ECE5DA` | metin |
| Kül gülü | `#A99BA1` | ikincil metin |
| Nikel gümüş | `#C9CED6` | klapeler, çizgi işi, arayüz vurgusu, odak halkası |

Arayüz vurgusu sıcak bir renk değil, gümüş. Böylece müzik eğitiminin pirincinden ve felsefenin lacivertinden ayrışıyor.

### Sabit anlam renkleri (bütün sitede değişmez)
Müzik eğitimindeki makam seyri slaytıyla aynı roller ve yakın tonlar:

| Rol | Pigment | Hex | Müzik eğitimi |
|---|---|---|---|
| Durak | cehri sarısı | `#EBB84C` | tonic `#f2be4b` |
| Güçlü | yaprak yeşili | `#5DB8A0` | wave `#5db8a3` |
| Yeden | kök boya kırmızısı | `#D9505F` | tension `#d8465e` |
| Koma sapması (12 sesten sapan perde) | çivit lavantası | `#A497EC` | comma `#9f8fe6` |

Parmak tablosunun görünümü de sabit:
- **Kapalı delik:** dolu gümüş disk.
- **Açık delik:** gümüş çizgili boş halka.
- **Yarım delik:** yarısı dolu disk, kesim çizgisi çapraz.
- **Basılı klape:** gümüş dolgu. **Basılmamış klape:** yalnızca kontur.

Renk körleri için durak, güçlü ve yeden ayrıca biçimle de ayrılıyor: durak çift halka, güçlü elmas, yeden üçgen.

### Tipografi (Google Fonts; Türkçe karakter desteği denetlendi)
- **Başlık: Gloock.** Yüksek kontrastlı, 1930'ların plak etiketlerini andıran bir serif.
- **Metin ve arayüz: Commissioner.** Değişken kalınlıklı. Koma ve sent değerleri `font-variant-numeric: tabular-nums` ile tablo rakamlarıyla yazılacak.
- **Türk müziği değiştirme işaretleri:** koma bemolü, bakiye bemolü, küçük ve büyük mücennep bemolü ve diyezleri SVG olarak çizilecek (`js/isaret.js`). Fontlarda bu işaretler doğru görünmüyor.

### Düzen
```
┌─────────────────────────────────────────────────────────────────┐
│ METİN SÜTUNU (≤ 64 karakter)   │  SAHNE (deney)                   │
│ bölüm no + ad                  │  ince gümüş çerçeve              │
│ Başlık (Gloock)                │  ┌──────┐                        │
│ Açıklama                       │  │klarnet│  perde ızgarası /      │
│ Dene: …   [Göster]             │  │bileşeni│ makam / usul halkası  │
│                                │  └──────┘                        │
├─────────────────────────────────────────────────────────────────┤
│ ○─○─○─●─○─○═╪═○─○─○─○═╪═○─○─○ …   ← ilerleme çubuğu bir klarnet    │
│   gövdesi: her slayt bir delik, bölümler bilezikle ayrılır,       │
│   geçilen delikler kapanır.                                       │
└─────────────────────────────────────────────────────────────────┘
```
- Metin sola hizalı.
- Mobilde tek sütun: sahne üstte, metin altta.
- Bölüm numaraları gerçekten bir sıra olduğu için kullanılıyor.

### İmza bileşeni: tek klarnet (`js/klarnet-ciz.js`)
- **Çizim:** Albert sistem Sol klarnetin stilize SVG çizimi, gövde oranları ölçülü.
  - Ön yüzde sol el ve sağ el delikleri, yan klapeler ve serçe klapeleri.
  - Arka yüzdeki başparmak deliği ile register anahtarı gövdenin yanında küçük bir "arka yüz" şeridinde gösterilir.
- **Etkileşim:** deliğe ya da klapeye tıklayınca kapanır ya da açılır ve o pozisyonun sesi çalar. Uzun basınca ya da sağ tıklayınca delik yarım kapanır.
- **Ters yön:** bir nota ya da perde seçilince parmaklar 180 ms'lik bir geçişle o pozisyona oturur.
- **Yerleşim:** telefonda dikey. Geniş ekranda dikey ya da yatay olabilir (`yon: "dikey" | "yatay"`).
- **Doğrulama işareti:** "doğrulanmalı" pozisyonlar küçük bir işaretle görünür.

### Plana karşı öz eleştiri
Planı genel kalıplarla karşılaştırdım ve iki şeyi değiştirdim:
- **Kapak:** ilk taslağımda "koyu zemin + tek sıcak vurgu + büyük serif başlık" vardı. Bu, her müzik sitesinde varılacak sonuç. Vurguyu gümüşe çevirdim ve kapağın odağını başlıktan çalan plak ve klarnet çizimine taşıdım.
- **Ustalar slaytı:** kart ızgarası yerine plak arşivi rafı gibi dizilmiş etiketler olacak. Brief'teki "her şeyin kart olduğu SaaS görünümü" yasağına bu yüzden uyuyor.

Cesaret tek yerde: plak/perde çemberi ve klarnet. Geri kalan her şey sakin.

---

## 2. Altyapı

| Parça | Kaynak | Not |
|---|---|---|
| `js/app.js` slayt motoru | music_theory'den | Boşluk tuşu usul metronomunu başlatıp durdurur. İleri gitmek ok tuşlarıyla. |
| `js/lib.js` | music_theory'den | `canvas()` mikro görev ertelemesi korunacak |
| `js/audio.js` | music_theory'den | Demo veriyolu ve anlatım sırasında ses kısma. localStorage anahtarı `klarnet.` |
| `js/narrator.js`, `js/guide.js`, `js/glossary.js` | music_theory/felsefe'den | SKIP: `.license, .cover-meta` |
| **`js/ses/klarnet-worklet.js`** | yeni | Fiziksel model (aşağıda) |
| **`js/ses/klarnet-ses.js`** | yeni | Worklet yükleyici. Yüklenemezse toplamsal yedek (tek harmonikler) |
| **`js/klarnet.js`** | yeni | Saf hesaplar. Node testleri buna yazılacak |
| `js/data/parmaklar.js`, `js/data/makamlar.js`, `js/data/usuller.js`, `js/data/sarki-gamzedeyim.js` | yeni | Veri dosyaları |
| **`js/perde.js`** | yeni | YIN perde algılama ve mikrofon yönetimi |
| **`js/usul.js`** | yeni | Web Audio saatiyle planlanan metronom, darbuka ve def sentezi |
| `tools/serve.py`, `tools/deploy.sh`, `.htaccess` | uyarlanacak | Hedef `~/egitim.koraytoksoz.com/klarnet/`, `--delete` yok |
| `tools/ekran.js`, `tools/rehber_kontrol.js`, `tools/olcum.js` | felsefe'den + yeni | Ekran görüntüsü, hayalet el hedefleri, model frekans ölçümü |

### Fiziksel model
- **Yapı:** dalga kılavuzu modeli; çift yönlü gecikme hattı silindirik boruyu temsil ediyor.
  - Kamış: basınç farkına bağlı doğrusal olmayan yansıma tablosu (McIntyre–Schumacher–Woodhouse, Smith'in "reed table" yaklaşımı).
  - Çan: ucunda alçak geçiren yansıma filtresi.
- **Parametreler:** nefes basıncı, dudak baskısı (kamış açıklığı ve sertliği), gecikme uzunluğu (perde) ve perde kaydırma. Hepsi a-rate AudioParam, gerçek zamanlı değiştirilebilir.
- **Delikler:** model delik geometrisini değil etkin boru boyunu taklit ediyor. Parmak pozisyonu → hedef frekans → gecikme boyu dönüşümü yapılıyor; register anahtarı 3. harmoniği seçiyor. Yarım delik ve dudak sürekli bir perde sapması olarak uygulanıyor. Bunu sunucu notlarında açıkça yazacağım.
- **Ölçüm ve ayar:** her parmak pozisyonunun ürettiği frekans `OfflineAudioContext` + YIN ile ölçülecek. Gecikme hattı ve döngü filtresinin faz gecikmesinden doğan sapma bir düzeltme tablosuyla kapatılacak; hedef ±5 sent.
- **Yedek yol:** `file://` ya da AudioWorklet yoksa toplamsal sentez kullanılacak. Tek harmonikler ağırlıklı (1, 3, 5, 7…, çift harmonikler çok zayıf), normal Web Audio düğümleriyle. Nefes ve dudak bu yolda parlaklık ve gürültü olarak yaklaşık taklit edilecek.

### Birim testleri (`node test/klarnet.test.js`)
- Perdelerin koma, sent ve frekans değerleri müzik eğitimindeki `ratios.js` değerleriyle aynı olmalı (Rast 0 9 17 22 31 40 48 53 vb.).
- Dokuz makamın koma dizileri tablodakiyle aynı olmalı ve her dizinin toplamı 53 tutmalı.
- Sol klarnette yazılı Do5 → Sol4 duyulmalı (392,0 Hz); Si♭ klarnette yazılı Do5 → Si♭4.
- Bolahenkte yazılı La4 → 329,6 Hz (Mi4) çıkmalı.
- YIN, sentezlenmiş klarnet sinyalinde frekansı ±1 sent içinde bulmalı.
- Model çıktısı hedef frekansa ±5 sent yakın olmalı (ölçüm aracıyla, tarayıcıda).
- Usul olaylarının zaman damgaları vuruş yapısıyla eşleşmeli.

---

## 3. İçerik akışı: 42 slayt, 12 bölüm

`→ muzik` = müzik eğitimine bağlantı. Şu an yayındaki adres https://muzik.koraytoksoz.com/ (egitim.koraytoksoz.com/muzik/ 404 veriyor; bkz. Sorular).

### 0. Giriş
| # | id | Slayt | Deney | Ağırlık |
|---|---|---|---|---|
| 0 | `kapak` | Nefesten Taksime | 78'lik plak, çevresi 53 komalık perde çemberi. Kendi yazdığım kısa bir Uşşak ezgisi sentezlenmiş klarnetle çalar; klarnet çiziminde parmaklar değişir, çemberde çalan perde ışır. Düğmeler: "Sesli anlatımla başla" / "Kendi hızımda gez"; GitHub, CC ve "← Bütün eğitimler" bağlantıları. | A |

### 1. Klarnet ve Türk müziği
| 1 | `hikaye` | Chalumeau'dan Sol klarnete | Zaman çizelgesi: Denner ~1700 → Müller → Albert → 1826 Mızıka-i Hümâyun → radyo ve plak dönemi → bugün. Durağa tıklayınca o dönemin çalgısı çalar: chalumeau tek register, klarnet register anahtarıyla. | O |
| 2 | `turk-muziginde` | Fasıldan düğüne | Harita: İstanbul fasıl ve radyo, Trakya/Keşan, Ege/Bergama. Bölgeye dokununca kendi yazdığım kısa bir motif bölgenin tipik usulüyle çalar. Üslup farkları için akademik karşılaştırma bulunamadı; metin bunu söyleyecek, iddiasız kalacak. | O |
| 3 | `ustalar` | Usta icracılar | Plak arşivi rafı: Şükrü Tunar, Mustafa Kandıralı, Barbaros Erköse, Selim Sesler, Hüsnü Şenlendirici, Serkan Çağrı. Her biri için bir etiket: yaşam tarihleri, bir cümle, kaynaklı tek bir üslup özelliği, Vikipedi bağlantısı. Kayıt gömülmeyecek. Yaşam çizgileri aynı zaman ekseninde. | O |

### 2. Klarnet nasıl ses çıkarır?
| 4 | `kamis` | Kamış bir supap | Ağızlık kesiti animasyonu: basınç arttıkça kamış kapanır ve açılır, boruya darbeler girer. Basınç kaydırıcısı fiziksel modeli sürer. | O |
| 5 | `tek-harmonikler` | Kapalı borunun şarkısı | Spektrum çubukları: klarnet (tek harmonikler) ile flüt (hepsi) karşılaştırması. Harmonikleri tek tek açıp kapatma. `→ muzik #tini` | O |
| 6 | `onikili` | Oktav değil, onikili | Boruda duran dalga: register anahtarı açılınca 3. kip; yazılı Mi3 → Si4. | O |
| 7 | `delikler` | Delikler boruyu kısaltır | Delikleri aç ve kapa: etkin boy, duran dalga ve ses birlikte değişir. Klarnet bileşeninin ilk kullanımı. | A |

### 3. Çalgıyı tanı
| 8 | `parcalar` | Beş parça, bir çalgı | Parçalara tıklanan çizim: ağızlık, kamış, bilezik, barilet, üst gövde, alt gövde, kalak. "Tak" düğmesiyle takma sırası animasyonu ve dikkat edilecekler. | O |
| 9 | `sol-ve-sib` | Sol klarnet ve Si♭ klarnet | Boy karşılaştırması (Alman tipi sol klarnet 75–78 cm). Aynı yazılı nota iki klarnette çalar: Sol bir tam dörtlü, Si♭ bir büyük ikili pest. | O |
| 10 | `albert-boehm` | Albert ve Boehm | İki mekanizma yan yana; farklı pozisyonlar vurgulu (RH1 = Si/Fa♯, F#4 yalnız başparmak, tek taraflı serçe klapeleri). Tercih nedenleri kaynaklı ve dengeli: "Boehm ile de çalınır" görüşü de yer alacak. | O |
| 11 | `kamis-secimi` | Kamış seçimi ve bakımı | Sertlik kaydırıcısı (1,5–4) modeldeki kamış sertliğini değiştirir: ne kadar nefes gerektiği ve ses rengi duyulur. Açık bek + yumuşak kamış notu. Islatma, döndürme, saklama. | O |

### 4. İlk ses
| 12 | `agiz-yapisi` | Ağız yapısı | Stilize kesit; üç yanlış ve bir doğru seçenek, her biri modelde farklı ses verir: çok gevşek → hava sesi, çok sıkı → cıyaklama. | O |
| 13 | `nefes` | **Nefes ve kamış simülatörü** (ana deney) | Nefes × dudak haritası (2B). Ziyaretçi haritada gezer ya da kaydırıcıları kullanır: sessiz bölge, güzel ses bölgesi, "kaz sesi" bölgesi. Harita modelin gerçek davranışından önceden ölçülerek çizilir. | A |
| 14 | `dil` | Dil vuruşu | "Tu" ve "du" heceleri; legato ve staccato zarfları; aynı ezgi dört biçimde. | H |
| 15 | `uzun-ses` | Uzun ses çalışması | Mikrofonla perde kararlılığı grafiği: ortalama sapma, kararlılık (sent std), vibrato genişliği ve hızı. Mikrofon yoksa sentezlenmiş bir "öğrenci" sesiyle gösterim. | A |

### 5. Parmaklar ve notalar
| 16 | `chalumeau` | Alt register | İlk notalar: G4 (rast, boş pozisyon) → F#4 → E4 → D4 → C4 → … → E3. Klarnet bileşenine dokunarak çal. | O |
| 17 | `clarion` | Üst register | Register anahtarıyla aynı parmaklar onikili yukarıda; çift ses (E3/B4) karşılaştırması. | O |
| 18 | `parmak-tablosu` | **Parmak tablosu** (çalışma aracı) | Bütün aralık E3–G6. Batı adıyla ve Türk perde adıyla aranır. Alternatif pozisyonlar, kaynak ve güven düzeyi ("doğrulanmalı" görünür). Model bağımlı klapeler için "klarnetimde şu klapeler var" seçeneği. | A |
| 19 | `aktarim` | Yazılan ve duyulan | Hesaplayıcı: "Bu notayı bu ahenkte bu klarnetle çalarsam ne duyulur?" Ahenkler: bolahenk, kız, mansur, süpürde (kaynaklı); şah, davud, yıldız "doğrulanmalı" etiketiyle. Kısa Hamparsum notu. | O |

### 6. Türk müziğinin perdeleri
| 20 | `koma` | Koma nedir? | Kısa tekrar: 53'e bölünmüş oktav; 1, 4, 5, 8, 9 komalık aralıkları dinleme. `→ muzik #turk-muzigi` | H |
| 21 | `perdeler` | Perdeler ve adları | Yegâh'tan Tiz Nevâ'ya dikey ızgara; Batı'nın 12 sesiyle yan yana; sapan perdeler çivit renginde. Perdeye dokununca klarnetteki pozisyonu ve dudak yönü gösterilir. | O |
| 22 | `koma-klarnette` | **Koma perdeleri klarnette** (ana deney) | Üç yol: (1) dudak kaydırıcısı, perdeyi komalarla düşürür ya da yükseltir (kaynaklara göre ana yöntem); (2) yarım delik kaydırıcısı, fizik olarak gösterim; (3) alternatif ve çatal pozisyon, WFG çeyrek ses tablosundan, "doğrulanmalı". Izgarada canlı iz. Segâh örneği: Rast'ta ve Uşşak'ta farklı yükseklik (Şahinoğlu). "Tek doğru yol yok" açıkça yazılacak. | A |
| 23 | `akort` | **Koma akort aleti** (çalışma aracı) | Mikrofon → en yakın perde, koma ve sent sapması, iğne ve ızgara. Ahenk ve klarnet türü seçilir. "Ses hiçbir yere gönderilmez." | A |

### 7. Makamlar
| 24 | `makam-nedir` | Dizi, durak, güçlü, yeden, seyir | Tek bir dizi üzerinde rolleri açıp kapatma. `→ muzik #makam-seyri` | H |
| 25 | `cinsler` | Dörtlüler ve beşliler | Yapboz: dörtlü ve beşli parçalarını sürükleyip birleştir; ortaya çıkan makam adı ve sesi. | A |
| 26 | `makamlar` | **Makam kartları** (ana deney) | Rast, Uşşak, Hicaz, Hüseynî, Nihâvend, Kürdî, Sabâ, Karcığar, Hicazkâr. Her kartta dizi parmak tablosunda, renkli durak/güçlü/yeden, seyir yönü ve kendi yazdığım kısa bir seyir cümlesi. Önce site çalar, sonra ziyaretçi; mikrofon varsa dinler. | A |
| 27 | `roman-makamlari` | Roman havalarında makam | Kaynak tek bir saha çalışması (Malatya): hicaz, nikriz, uşşak. Metin genellemeyecek. **Nikriz** burada kısa bir ek kart olarak (dizi doğrulanacak). | O |

### 8. Usuller
| 28 | `usul-nedir` | Düm ve tek | Usul halkası (plak dili): Sofyan ve Nim sofyan; düm ve tek sesleri. | O |
| 29 | `metronom` | **Usul metronomu** (çalışma aracı) | Usuller: Roman havası 9/8, Karşılama 9/8, Aksak 9/8, Devr-i hindi 7/8, Aksak semai 10/8, Sofyan 4/4, Nim sofyan/sirto 2/4, Çiftetelli (doğrulanmalı). Hız, vurgu ve "üstüne makam dizisi çal" seçeneği. Boşluk tuşu başlatır ve durdurur. | A |
| 30 | `dokuz-sekiz` | Üç dokuz sekizlik | Roman havası, karşılama ve aksak aynı 2+2+2+3 iskeleti; farkları tempoda, vurguda ve oyunda (Aykent). Raks aksağı (2+3+2+2) karşıtlığı. | O |
| 31 | `roman-havasi` | **Roman havası** (ana deney) | Kendi yazdığım kısa bir Hicaz oyun havası cümlesi; sentezlenmiş klarnet ve darbuka. Hız, darbuka açık/kapalı; ziyaretçi usulün üstüne çalar. | A |

### 9. Bir şarkı: Gamzedeyim Devâ Bulmam (yeni bölüm, isteğiniz üzerine)
| 32 | `gamzedeyim` | Eserin hikâyesi | Tatyos Efendi (1858–1913); uşşak, sofyan. Telif durumu, sözler, eserin yapısı. Uşşak dizisi ve sofyan usulü ile şarkının bağı. Şarkı sentezlenmiş klarnet ve def ile baştan sona dinlenir; nota satırı ve perde ızgarası birlikte akar. | O |
| 33 | `gamzedeyim-ogren` | **Cümle cümle öğren** (ana deney) | Sıradaki notanın parmak pozisyonu klarnet bileşeninde yanar. Mikrofon izni varsa dinlenir: doğru perde (ayarlanabilir tolerans, varsayılan ±30 sent) ~200 ms tutulunca sonraki notaya geçilir. Aynı nota tekrarlanınca yeni bir atak beklenir. Mikrofon yoksa klarnet çizimine dokunarak ilerlenir. Önce site cümleyi çalar, sonra ziyaretçi. Koma perdelerinde (segâh) "Si parmağı + dudakla pestleştir" ipucu. Basitleştirilmiş (süslemesiz) ve tam (çarpmalı) sürüm. | A |
| 34 | `gamzedeyim-birlikte` | Birlikte çal | Usul ve hız ayarıyla eşlik: def sofyan çalar, site ezgiyi çalar ya da susar ("eksi bir"). Mikrofonla nota nota isabet çizelgesi. İlerleme localStorage'da. | A |

### 10. Süslemeler ve taksim
| 35 | `susleme` | Süslemeler | Çarpma, mordan, glissando (dudak, parmak ya da ikisi), vibrato, trill. Her biri süslemeli ve süslemesiz; perde ızgarasında çizgi olarak. **"Ağlama" ve "gırtlak" için kaynaklı tanım bulunamadı**: öneriniz bunları klarnetçi kontrolüne bırakmak (bkz. Sorular). | O |
| 36 | `taksim` | Taksim | Usulsüz, seyre bağlı doğaçlama: kendi yazdığım kısa bir Uşşak taksimi; ızgarada seyir izi, durak/güçlü işaretli. | O |
| 37 | `taksim-alani` | Taksim alanı | Makam seç, klarnet bileşenine dokunarak (ya da mikrofonla) çal. Seyir yönlendirmesi: "Şimdi güçlüye çık", "Durakta karar ver". Makam dışı bir perde nazikçe gösterilir. | A |

### 11. Bakım ve pratik
| 38 | `bakim` | Bakım | Sürgü bezi, ahşap gövdede ısınma ve çatlama riski (soğuk çalgıya sıcak nefes), mantarlar, kamış kutusu. Etkileşim: "çalgıdan sonra" adım sırası. | H |
| 39 | `pratik` | Günlük pratik planı | 15, 30 ve 60 dakikalık planlar; zamanlayıcı; çalışılan makamlar ve usuller localStorage'da (`klarnet.`). | O |
| 40 | `kapanis` | Kapanış | Bütün araçlara hızlı erişim (parmak tablosu, akort, metronom, şarkı) ve diğer eğitimler. CC, GitHub, telif satırı. | H |

(Toplam: 0–40 = 41 slayt. Nikriz ayrı slayt olursa 42.)

---

## 4. Doğrulamakta zorlandığım konular
1. **Koma perdelerinin parmak pozisyonları:** erişilebilir bir kaynak yok. Asıl kaynak Sefa Yaşar'ın 2021 tezi (AMGSÜ); YÖK girişi istiyor. WFG çeyrek ses tablosu ancak bir başlangıç noktası, hepsi "doğrulanmalı" olacak. Tezi edinebilirseniz tabloyu ona dayandırırım.
2. **Türk Sol klarnetlerinin tipik klape düzeni:** üreticiye göre değişiyor. Bileşen klasik Albert'i (13 anahtar, 2 halka) çizecek; ek klapeler seçmeli olacak.
3. **Ahenkler:** Şah, Davud ve Yıldız'ın Batı karşılıkları doğrulanamadı ya da kaynaklar çelişiyor.
4. **Usuller:** Çiftetelli için düm-tek dizilimini veren güvenilir yazılı kaynak bulunamadı. Roman havasının darbuka kalıbı akademik olmayan bir kaynaktan. Aksak semai 3+2+2+3 mi, 2+3+2+3 mü, kaynaklar çelişiyor (TDV ve neyzenim'i esas alıyorum). Brief "2/4 çiftetelli" diyor, kaynaklar 8/4 ya da 4/4 diyor.
5. **"Ağlama" ve "gırtlak":** klarnet için kaynaklı tanım bulunamadı.
6. **Bölgesel üslup farkları:** akademik karşılaştırma yok; metin genel kalacak.
7. **Şükrü Tunar'ın doğum yeri:** Edremit mi Edirne mi, kaynaklar çelişiyor.
8. **Fiziksel modelin gerçekçiliği:** tarayıcıda gerçekçi bir klarnet sesi mümkün, ama "gerçek klarnet" düzeyini vaat etmiyorum. Ölçerek ince ayar yapacağım.
9. **ElevenLabs kredisi:** önceki projede MCP anahtarının `user_read` izni yoktu, `check_subscription` çalışmayabilir. Toplam karakter sayısını yine de bildireceğim.

---

## 5. Sorular (onayla birlikte)
1. **Şarkının notası:** makine okunur tek kaynak SymbTr, lisansı CC BY-NC-SA 4.0 (ticari kullanım yok, aynı lisansla paylaşım). Beste kamu malı, ama SymbTr'nin kodlaması onların emeği.
   - **(a) Önerim:** SymbTr'deki ezgiyi temel al, o veri dosyasını (`js/data/sarki-gamzedeyim.js`) LICENSE'ta ayrıca "CC BY-NC-SA 4.0, SymbTr (Karaosmanoğlu 2012)" olarak işaretle. Sitenin geri kalanı CC BY olarak kalır.
   - **(b)** Ezgiyi bağımsız olarak kendim yeniden yazayım: süslemesiz, öğretime yönelik bir düzenleme. Ama doğruluğunu bir klarnetçinin kulağıyla kontrol etmek gerekir.
2. **Bağlantılar:** müzik eğitimi şu an `muzik.koraytoksoz.com` adresinde. `egitim.koraytoksoz.com/muzik/` adresine taşınacaksa ona mı bağlayayım, yoksa yayındaki adrese mi?
3. **Site adı:** "Nefesten Taksime" uygun mu?
4. **Ağlama ve gırtlak:** bunları siteden çıkarayım mı, yoksa "klarnetçi kontrolü bekliyor" diye işaretleyip boş mu bırakayım?
