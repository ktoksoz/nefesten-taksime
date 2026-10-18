/* Makam verisi. Perdeler Rast = 0 komadan sayılır (bkz. js/klarnet.js).
   Durak, güçlü, yeden, seyir ve dizi yapısı: TDV İslâm Ansiklopedisi makam maddeleri (Rast, Uşşak, Hüseynî, Hicaz,
   Nihâvend, Kürdî, Sabâ, Karcığar, Hicazkâr) ve AEU aralık değerleri. Koma dizileri bu kaynaklardan türetilmiştir.
   cumle: bu site için yazılmış kısa seyir cümleleri [koma, vuruş]. Geleneksel bir eserden alıntı değildir. */
(function (root) {
  const MAKAMLAR = [
    {
      id: "rast", ad: "Rast", durak: "Rast", guclu: "Nevâ", yeden: "Irak", seyir: "çıkıcı",
      cinsler: "Rast'ta rast beşlisi + Nevâ'da rast dörtlüsü",
      araliklar: [9, 8, 5, 9, 9, 8, 5], durakKoma: 0,
      not: "İnişte Eviç yerine çoğunlukla Acem kullanılır.",
      cumle: [[0, 1], [9, 1], [17, 1], [22, 1], [31, 2], [40, 1], [31, 1], [22, 1], [17, 1], [9, 1], [17, 1], [9, 1], [-5, 1], [0, 3]],
    },
    {
      id: "ussak", ad: "Uşşak", durak: "Dügâh", guclu: "Nevâ", yeden: "Rast", seyir: "çıkıcı",
      cinsler: "Dügâh'ta uşşak dörtlüsü + Nevâ'da bûselik beşlisi",
      araliklar: [8, 5, 9, 9, 4, 9, 9], durakKoma: 9,
      cumle: [[9, 1], [17, 1], [22, 1], [31, 2], [22, 1], [31, 1], [40, 1], [31, 1], [22, 1], [17, 1], [22, 1], [17, 1], [9, 1], [0, 1], [9, 3]],
    },
    {
      id: "huseyni", ad: "Hüseynî", durak: "Dügâh", guclu: "Hüseynî", yeden: "Rast", seyir: "inici-çıkıcı",
      cinsler: "Dügâh'ta hüseynî beşlisi + Hüseynî'de uşşak dörtlüsü",
      araliklar: [8, 5, 9, 9, 8, 5, 9], durakKoma: 9,
      not: "Çıkışta Eviç, inişte çoğunlukla Acem kullanılır.",
      cumle: [[40, 2], [48, 1], [53, 1], [48, 1], [40, 1], [31, 2], [40, 1], [31, 1], [22, 1], [17, 1], [22, 1], [17, 1], [9, 1], [0, 1], [9, 3]],
    },
    {
      id: "hicaz", ad: "Hicaz", durak: "Dügâh", guclu: "Nevâ", yeden: "Rast", seyir: "inici-çıkıcı",
      cinsler: "Dügâh'ta hicaz dörtlüsü + Nevâ'da rast beşlisi",
      araliklar: [5, 12, 5, 9, 8, 5, 9], durakKoma: 9,
      not: "Dik kürdî ile Nîm hicaz arasındaki 12 komalık artık ikili makamın imzasıdır.",
      cumle: [[9, 1], [14, 1], [26, 1], [31, 2], [40, 1], [31, 1], [26, 1], [14, 1], [26, 1], [31, 1], [26, 1], [14, 1], [9, 3]],
    },
    {
      id: "nihavend", ad: "Nihâvend", durak: "Rast", guclu: "Nevâ", yeden: "Irak", seyir: "inici-çıkıcı",
      cinsler: "Rast'ta bûselik beşlisi + Nevâ'da kürdî ya da hicaz dörtlüsü",
      araliklar: [9, 4, 9, 9, 4, 9, 9], durakKoma: 0,
      cumle: [[31, 2], [35, 1], [31, 1], [22, 1], [13, 1], [22, 1], [31, 1], [22, 1], [13, 1], [9, 1], [13, 1], [9, 1], [-5, 1], [0, 3]],
    },
    {
      id: "kurdi", ad: "Kürdî", durak: "Dügâh", guclu: "Nevâ", yeden: "Rast", seyir: "çıkıcı",
      cinsler: "Dügâh'ta kürdî dörtlüsü + Nevâ'da bûselik beşlisi",
      araliklar: [4, 9, 9, 9, 4, 9, 9], durakKoma: 9,
      cumle: [[9, 1], [13, 1], [22, 1], [31, 2], [40, 1], [31, 1], [22, 1], [13, 1], [22, 1], [13, 1], [9, 1], [0, 1], [9, 3]],
    },
    {
      id: "saba", ad: "Sabâ", durak: "Dügâh", guclu: "Çârgâh", yeden: "Rast", seyir: "çıkıcı",
      cinsler: "Dügâh'ta sabâ dörtlüsü (8 + 5 + 5) + Çârgâh'ta zirgüleli hicaz",
      araliklar: [8, 5, 5, 12, 5, 9, 5], durakKoma: 9,
      not: "Dizi oktavda kapanmaz: Dügâh'ın oktavı (Muhayyer) yerine Şehnaz gelir.",
      cumle: [[9, 1], [17, 1], [22, 2], [27, 1], [22, 1], [17, 1], [22, 1], [27, 1], [39, 1], [27, 1], [22, 1], [17, 1], [9, 1], [0, 1], [9, 3]],
    },
    {
      id: "karcigar", ad: "Karcığar", durak: "Dügâh", guclu: "Nevâ", yeden: "Rast", seyir: "inici-çıkıcı",
      cinsler: "Dügâh'ta uşşak dörtlüsü + Nevâ'da hicaz beşlisi",
      araliklar: [8, 5, 9, 5, 12, 5, 9], durakKoma: 9,
      cumle: [[31, 1], [36, 1], [48, 1], [36, 1], [31, 2], [22, 1], [17, 1], [22, 1], [31, 1], [22, 1], [17, 1], [9, 1], [0, 1], [9, 3]],
    },
    {
      id: "hicazkar", ad: "Hicazkâr", durak: "Rast", guclu: "Gerdâniye", yeden: "Irak", seyir: "inici",
      cinsler: "Rast'ta zirgüleli hicaz beşlisi + Nevâ'da hicaz dörtlüsü",
      araliklar: [5, 12, 5, 9, 5, 12, 5], durakKoma: 0,
      cumle: [[53, 2], [48, 1], [36, 1], [31, 1], [36, 1], [31, 1], [22, 1], [17, 1], [5, 1], [17, 1], [5, 1], [-5, 1], [0, 3]],
    },
  ];
  MAKAMLAR.forEach((m) => {
    m.dizi = [m.durakKoma];
    m.araliklar.forEach((a) => m.dizi.push(m.dizi[m.dizi.length - 1] + a));
  });
  const makam = (id) => MAKAMLAR.find((m) => m.id === id);
  const out = { MAKAMLAR, makam };
  if (typeof module !== "undefined" && module.exports) module.exports = out;
  else Object.assign(root, out);
})(typeof window !== "undefined" ? window : globalThis);
