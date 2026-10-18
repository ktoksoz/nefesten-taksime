/* Sözlük (müzik eğitiminden uyarlandı): metindeki terimlerin üzerine gelince açılan tanım balonları.
   Her terim slayt başına yalnızca ilk geçtiği yerde işaretlenir. */
(function () {
  const trw = (q) => "https://tr.wikipedia.org/w/index.php?search=" + encodeURIComponent(q);
  const enw = (t) => "https://en.wikipedia.org/wiki/" + t;

  // k: aranacak kökler (küçük harf, Türkçe ekler otomatik kapsanır), t: başlık, d: tanım, u: bağlantı
  const TERMS = [
    { k: ["kamış"], t: "Kamış", d: "Ağızlığa bağlanan ince kamış yaprağı. Nefesle titreşip ağızlıkla arasındaki aralığı açıp kapatır; borudaki havayı bir supap gibi besler.", u: enw("Reed_(mouthpiece)") },
    { k: ["ağızlık", "bek"], t: "Ağızlık (bek)", d: "Kamışın bağlandığı, dudakların sardığı uç parça. Türk müziğinde çoğunlukla geniş açıklı bekler kullanılır.", u: enw("Mouthpiece_(woodwind)") },
    { k: ["barilet"], t: "Barilet", d: "Ağızlık ile üst gövde arasındaki kısa parça. Biraz çekilerek klarnetin akordu pesleştirilir.", u: enw("Clarinet#Construction_and_acoustics") },
    { k: ["kalak"], t: "Kalak", d: "Klarnetin alt ucundaki genişleyen çan. En pes notaların sesini dışarı yayar.", u: enw("Bell_(wind_instrument)") },
    { k: ["register anahtarı"], t: "Register anahtarı", d: "Arka yüzde, sol başparmakla basılan anahtar. Küçük bir delik açarak klarneti bir onikili yukarıdaki titreşime geçirir.", u: enw("Register_key") },
    { k: ["onikili"], t: "Onikili", d: "Bir oktav ile bir beşlinin toplamı (frekans oranı 3:1). Klarnetin register anahtarı sesi oktav değil onikili yükseltir.", u: enw("Twelfth") },
    { k: ["chalumeau"], t: "Chalumeau", d: "1) Klarnetin atası olan, register anahtarı olmayan tek kamışlı Barok çalgı. 2) Klarnetin en pes bölgesi (yazılı Mi3–Si♭4).", u: enw("Chalumeau") },
    { k: ["clarion"], t: "Clarion", d: "Klarnetin register anahtarıyla çalınan orta-üst bölgesi (yazılı Si4–Do6).", u: enw("Clarinet#Range") },
    { k: ["altissimo"], t: "Altissimo", d: "Klarnetin en tiz bölgesi (yazılı Do♯6 ve üstü). Özel parmak pozisyonları ve güçlü nefes desteği ister.", u: enw("Clarinet#Range") },
    { k: ["albert sistem", "albert"], t: "Albert sistemi", d: "Iwan Müller'in 13 anahtarlı klarnetine Adolphe Sax'ın halkalarının eklenmesiyle 19. yüzyıl ortasında oluşan anahtar düzeni. Türkiye'de sol klarnetlerin çoğu bu sistemdedir.", u: enw("Albert_system") },
    { k: ["boehm"], t: "Boehm sistemi", d: "Hyacinthe Klosé ile Louis-Auguste Buffet'nin 1839–1843'te geliştirdiği, flütçü Theobald Boehm'in halka fikrinden esinlenen anahtar düzeni. Bugün dünyada en yaygın klarnet sistemi.", u: enw("Boehm_system_(clarinet)") },
    { k: ["müller"], t: "Iwan Müller", d: "Klarnetçi ve çalgı yapımcısı (1786–1854). 1812 civarında, her yarım sesi çalabilen 13 anahtarlı klarneti geliştirdi.", u: enw("Iwan_M%C3%BCller") },
    { k: ["denner"], t: "Johann Christoph Denner", d: "Nürnbergli çalgı yapımcısı (1655–1707). Klarneti, chalumeau'ya register anahtarı ekleyerek 1700 civarında geliştirdiği kabul edilir.", u: enw("Johann_Christoph_Denner") },
    { k: ["aktarım", "transpoze"], t: "Aktarım (transpozisyon)", d: "Yazılan nota ile duyulan ses arasındaki sabit aralık. Sol klarnet yazılandan tam dörtlü, Si♭ klarnet büyük ikili pest duyulur.", u: enw("Transposing_instrument") },
    { k: ["ahenk"], t: "Ahenk", d: "Türk müziğinde akort yüksekliği: yazılı Rast perdesinin hangi sesle duyulduğu. Adlarını ney boylarından alır (bolahenk, kız, mansur…).", u: "https://islamansiklopedisi.org.tr/ahenk" },
    { k: ["bolahenk"], t: "Bolahenk", d: "En yaygın ahenk: portedeki La (dügâh) yaklaşık 330 Hz, yani yazılandan tam dörtlü pest duyulur.", u: "https://islamansiklopedisi.org.tr/ahenk" },
    { k: ["koma"], t: "Koma", d: "Türk müziği kuramında oktavın 53'te biri (Holdrian koması, yaklaşık 22,64 cent). Bir tam ses 9 koma sayılır.", u: enw("Holdrian_comma") },
    { k: ["cent"], t: "Cent", d: "Eşit tamperamanlı yarım sesin yüzde biri; oktav 1200 cent. Küçük perde farklarını ölçmek için kullanılır.", u: trw("Sent (müzik)") },
    { k: ["arel"], t: "Arel–Ezgi–Uzdilek sistemi", d: "Hüseyin Sadettin Arel, Suphi Ezgi ve Salih Murat Uzdilek'in kurduğu, oktavı 53 komaya bölen ve 24 perde kullanan kuram ve yazım sistemi. Türk müziği eğitiminde en yaygın olanı.", u: trw("Arel-Ezgi-Uzdilek ses sistemi") },
    { k: ["perde"], t: "Perde", d: "Türk müziğinde adı olan belirli bir ses yüksekliği: Rast, Dügâh, Segâh, Çârgâh… Klarnette aynı zamanda o sesi veren parmak pozisyonunu da akla getirir.", u: enw("Turkish_makam#Commas_and_accidentals") },
    { k: ["bakiye"], only: ["koma", "perdeler", "cinsler"], t: "Bakiye", d: "4 komalık küçük aralık (yaklaşık 90,6 cent). Kürdî dörtlüsünün ilk aralığı.", u: enw("Turkish_makam#Commas_and_accidentals") },
    { k: ["mücennep"], only: ["koma", "perdeler", "cinsler"], t: "Mücennep", d: "Küçük mücennep 5 koma (≈113 cent), büyük mücennep 8 koma (≈181 cent) olan aralıklar. Uşşak ve hicaz dörtlülerinde geçer.", u: enw("Turkish_makam#Commas_and_accidentals") },
    { k: ["tanini"], only: ["koma", "cinsler"], t: "Tanini", d: "9 komalık tam ses (≈204 cent).", u: enw("Turkish_makam#Commas_and_accidentals") },
    { k: ["artık ikili"], t: "Artık ikili", d: "12 ya da 13 komalık geniş aralık (≈272–294 cent). Hicaz dörtlüsünün ortasındaki imza aralık.", u: enw("Augmented_second") },
    { k: ["makam"], t: "Makam", d: "Dizi, durak, güçlü ve yeden perdeleri ile ezginin izlediği yolu (seyir) birlikte tanımlayan ezgi sistemi.", u: trw("Makam") },
    { k: ["durak"], only: ["makam-nedir", "cinsler", "makamlar", "roman-makamlari", "gamzedeyim", "taksim", "taksim-alani", "perdeler"], t: "Durak", d: "Makamın ezgisinin sonunda vardığı, karar verdiği perde.", u: enw("Turkish_makam") },
    { k: ["güçlü"], only: ["makam-nedir", "cinsler", "makamlar", "roman-makamlari", "gamzedeyim", "taksim", "taksim-alani", "perdeler"], t: "Güçlü", d: "Makamda duraktan sonra en önemli perde; ezgi yolda ona yaslanır ve yarım karar verir.", u: enw("Turkish_makam") },
    { k: ["yeden"], only: ["makam-nedir", "cinsler", "makamlar", "roman-makamlari", "gamzedeyim", "taksim", "taksim-alani", "perdeler"], t: "Yeden", d: "Durağın hemen altındaki, ezgiyi durağa çeken perde.", u: enw("Yeden_(Turkish_makam_theory)") },
    { k: ["seyir"], only: ["makam-nedir", "cinsler", "makamlar", "roman-makamlari", "gamzedeyim", "taksim", "taksim-alani", "perdeler"], t: "Seyir", d: "Ezginin bir makamda izlediği yol: hangi bölgeden başladığı, nerelere uğradığı ve durağa nasıl vardığı. Çıkıcı, inici ya da inici-çıkıcı olabilir.", u: enw("Turkish_makam") },
    { k: ["dörtlü", "beşli"], only: ["cinsler", "makamlar", "makam-nedir"], t: "Dörtlü ve beşli (cins)", d: "Makam dizilerinin yapı taşları: dört ya da beş perdelik dizi parçaları (rast, uşşak, hicaz, bûselik, kürdî…).", u: enw("Tetrachord") },
    { k: ["usul"], t: "Usul", d: "Türk müziğinde vuruşların ağırlıklı (düm) ve hafif (tek) seslerle kurulan, eser boyunca tekrarlanan ritim kalıbı.", u: trw("Usul (müzik)") },
    { k: ["düm"], only: ["usul-nedir", "metronom", "dokuz-sekiz", "roman-havasi", "gamzedeyim", "gamzedeyim-birlikte"], t: "Düm ve tek", d: "Usul vuruşlarının adları: düm pes ve ağır, tek tiz ve hafif vuruştur. Darbukada düm derinin ortasına, tek kenarına vurulur.", u: trw("Usul (müzik)") },
    { k: ["aksak"], t: "Aksak", d: "2+2+2+3 gibi eşit olmayan gruplardan oluşan ritim. 9/8'lik aksak usul Türk müziğinin en tanınan usullerinden biri.", u: enw("Aksak") },
    { k: ["darbuka"], t: "Darbuka", d: "Tek yüzü deriyle (ya da plastik zarla) kaplı, kadeh biçimli vurmalı çalgı.", u: trw("Darbuka") },
    { k: ["def"], only: ["gamzedeyim", "gamzedeyim-birlikte", "usul-nedir", "metronom"], t: "Def", d: "Kasnağa gerili tek deriden oluşan, elle çalınan vurmalı çalgı. Fasıl ve şarkı eşliğinde usulü tutar.", u: trw("Def") },
    { k: ["taksim"], t: "Taksim", d: "Bir çalgının usulsüz, serbest zamanlı olarak makamın seyrini doğaçlama gösterdiği bölüm.", u: trw("Taksim") },
    { k: ["çarpma"], t: "Çarpma", d: "Asıl notadan önce çok kısa çalınan yardımcı nota; parmakla yapılan bir süsleme.", u: enw("Acciaccatura") },
    { k: ["glissando"], t: "Glissando", d: "Bir perdeden ötekine kesintisiz kayarak geçmek. Klarnette dudak, parmakları deliklerden yavaşça kaydırmak ya da ikisi birlikte kullanılır.", u: trw("Glissando") },
    { k: ["vibrato"], t: "Vibrato", d: "Sesin perdesinin düzenli ve küçük dalgalanması. Klarnette çoğunlukla dudak ve çeneyle yapılır.", u: trw("Vibrato") },
    { k: ["legato"], t: "Legato", d: "Notaları dil vurmadan, birbirine bağlayarak çalmak.", u: trw("Legato") },
    { k: ["staccato"], t: "Staccato", d: "Notaları kısa ve birbirinden ayrı çalmak.", u: trw("Staccato") },
    { k: ["mızıka-i hümâyun"], t: "Mızıka-i Hümâyun", d: "Yeniçeri Ocağı'nın kaldırılmasından (1826) sonra kurulan, Batı tarzı saray bandosu. 1828'den başlayarak Giuseppe Donizetti yönetti.", u: "https://islamansiklopedisi.org.tr/mizika-i-humayun" },
    { k: ["hamparsum"], t: "Hamparsum notası", d: "Hamparsum Limonciyan'ın 19. yüzyıl başında Ermeni harflerinden geliştirdiği nota yazısı. Türk müziği eserlerinin önemli bir kısmı bu yazıyla korunmuştur.", u: trw("Hamparsum notası") },
    { k: ["harmonik"], t: "Harmonik", d: "Temel frekansın tam sayı katlarındaki titreşimler (2f, 3f, 4f…). Bir ucu kapalı silindirik boruda tek katlar (1, 3, 5…) ağır basar.", u: trw("Harmonik") },
    { k: ["temel frekans"], t: "Temel frekans", d: "Periyodik bir sesin en düşük frekanslı bileşeni. Duyduğumuz perdeyi çoğunlukla bu belirler.", u: enw("Fundamental_frequency") },
    { k: ["duran dalga"], t: "Duran dalga", d: "Borunun iki ucundan yansıyan dalgaların üst üste binmesiyle oluşan, yerinde titreşen dalga deseni. Borunun boyu hangi frekansların duran dalga kurabileceğini belirler.", u: trw("Duran dalga") },
    { k: ["dalga kılavuzu"], t: "Dalga kılavuzu modeli", d: "Bir borudaki ileri ve geri giden dalgaları gecikme hatlarıyla hesaplayan ses sentezi yöntemi. Julius O. Smith III'ün 1980'lerdeki çalışmalarıyla yaygınlaştı.", u: enw("Digital_waveguide_synthesis") },
    { k: ["yin"], t: "YIN algoritması", d: "Alain de Cheveigné ve Hideki Kawahara'nın 2002'de yayımladığı temel frekans bulma yöntemi. Sinyali kendi gecikmiş kopyasıyla karşılaştırır.", u: enw("Pitch_detection_algorithm") },
    { k: ["fasıl"], t: "Fasıl", d: "Aynı makamdaki eserlerin belli bir sırayla art arda seslendirildiği konser biçimi. Halk arasında meyhane ve gazino müziği için de kullanılır.", u: trw("Fasıl (müzik)") },
    { k: ["roman havası"], t: "Roman havası", d: "Trakya'dan yayılan, 9/8'lik (2+2+2+3) oyun havası. Adını Roman topluluklarının müzik geleneğinden alır.", u: trw("Roman havası") },
    { k: ["karşılama"], t: "Karşılama", d: "Trakya ve Rumeli'de iki kişinin karşı karşıya oynadığı halk oyunu ve ezgisi; çoğunlukla 9/8'liktir.", u: trw("Karşılama") },
    { k: ["sofyan"], t: "Sofyan", d: "4 zamanlı, düm-tek-ke yapısında kısa usul. Şarkı formunda sık kullanılır.", u: trw("Sofyan usulü") },
    { k: ["tatyos"], t: "Kemanî Tatyos Efendi", d: "Ortaköy'de doğan Ermeni asıllı keman virtüözü ve besteci (1858–1913). Şarkıları ve saz eserleriyle tanınır.", u: "https://islamansiklopedisi.org.tr/tatyos-efendi" },
    { k: ["uşşak"], t: "Uşşak", d: "Durağı Dügâh, güçlüsü Nevâ olan, uşşak dörtlüsü ile bûselik beşlisinden kurulan makam.", u: trw("Uşşak makamı") },
    { k: ["hicaz"], t: "Hicaz", d: "Durağı Dügâh olan; dörtlüsünün ortasındaki geniş artık ikili aralıkla tanınan makam.", u: trw("Hicaz makamı") },
    { k: ["segâh"], t: "Segâh", d: "Rast'tan 17 koma tizdeki perde (yazılı Si koma bemol). Eşit tamperamanlı Si'den biraz pesttir; kaç koma pest çalındığı makama göre değişir.", u: enw("Turkish_makam") },
  ];


  // her kök için: kelime başında başlayan, ardından Türkçe ekler gelebilen düzenli ifade
  const L_ = "a-zçğıöşüâîûA-ZÇĞİÖŞÜÂÎÛ";
  // karşılaştırma için: Türkçe küçük harf + ı/i ayrımını kaldır (MYCIN → mycin, ama uzunluk değişmez)
  const lower = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i");
  TERMS.forEach((term) => {
    term.re = term.k.map((k) => new RegExp(`(^|[^${L_}])(${lower(k).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[${L_}'’]*)`));
  });
  const SKIP = "h1, h2, h3, .chapter-tag, .num, summary, a, .term, .try, button, .license, .cover-meta";

  function markSlide(root) {
    const sid = root.closest(".slide").id;
    // yalnızca belirli slaytlarda anlamlı olan terimleri (ör. "sıcaklık") diğerlerinde atla
    const done = new Set(TERMS.map((t, i) => (t.only && !t.only.includes(sid) ? i : -1)).filter((i) => i >= 0));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(SKIP) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let text = node.nodeValue;
      let parts = null;
      // düğümde geçen ilk uygun terimi bul, böl, tekrarla
      for (;;) {
        let best = null;
        const low = lower(text);
        TERMS.forEach((term, ti) => {
          if (done.has(ti)) return;
          term.re.forEach((re) => {
            const m = re.exec(low);
            if (m && (!best || m.index + m[1].length < best.i)) best = { i: m.index + m[1].length, len: m[2].length, ti };
          });
        });
        if (!best) break;
        done.add(best.ti);
        parts = parts || [];
        parts.push(text.slice(0, best.i));
        const span = document.createElement("span");
        span.className = "term"; span.tabIndex = 0; span.dataset.ti = best.ti;
        span.textContent = text.slice(best.i, best.i + best.len);
        parts.push(span);
        text = text.slice(best.i + best.len);
      }
      if (parts) { parts.push(text); node.replaceWith(...parts); }
    });
  }
  document.querySelectorAll(".slide .text").forEach(markSlide);

  /* --- balon --- */
  const pop = document.createElement("div");
  pop.id = "gloss"; pop.setAttribute("role", "tooltip");
  document.body.append(pop);
  let cur = null, hideT = 0;
  function show(el) {
    clearTimeout(hideT);
    if (cur === el && pop.classList.contains("open")) return;
    cur = el;
    const t = TERMS[+el.dataset.ti];
    pop.innerHTML = "";
    const h4 = document.createElement("h4"); h4.textContent = t.t;
    const p = document.createElement("p"); p.textContent = t.d;
    const a = document.createElement("a");
    a.href = t.u; a.target = "_blank"; a.rel = "noopener";
    a.textContent = t.u.includes("tr.wikipedia") ? "Vikipedi'de oku ↗" : "Wikipedia'da oku (İngilizce) ↗";
    pop.append(h4, p, a);
    pop.classList.add("open");
    const r = el.getBoundingClientRect();
    const pw = pop.offsetWidth, ph = pop.offsetHeight;
    let x = Math.min(Math.max(12, r.left + r.width / 2 - pw / 2), window.innerWidth - pw - 12);
    let y = r.top - ph - 10;
    pop.classList.toggle("below", y < 8);
    if (y < 8) y = r.bottom + 10;
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  function hide(delay = 180) {
    clearTimeout(hideT);
    hideT = setTimeout(() => { pop.classList.remove("open"); cur = null; }, delay);
  }
  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest && e.target.closest(".term");
    if (el) show(el);
    else if (e.target.closest && e.target.closest("#gloss")) clearTimeout(hideT);
    else if (cur) hide();
  });
  document.addEventListener("focusin", (e) => { if (e.target.classList && e.target.classList.contains("term")) show(e.target); });
  document.addEventListener("focusout", (e) => { if (e.target.classList && e.target.classList.contains("term")) hide(250); });
  // dokunmatik: dokununca aç/kapa
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".term");
    if (el) { e.preventDefault(); cur === el && pop.classList.contains("open") ? hide(0) : show(el); }
    else if (!e.target.closest("#gloss")) hide(0);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(0); });
  document.getElementById("deck").addEventListener("scroll", () => hide(0), true);
})();
