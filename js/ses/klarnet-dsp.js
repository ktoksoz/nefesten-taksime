/* Klarnet fiziksel modeli: dalga kılavuzu (waveguide) + doğrusal olmayan kamış.
   Hem AudioWorklet içinde hem Node'da (ölçüm ve testler için) çalışır; Web Audio kullanmaz.

   Yapı (McIntyre, Schumacher ve Woodhouse 1983; Smith'in "reed table" yaklaşımı; STK Clarinet sınıfı):
     - Silindirik boru: çift yönlü dalgayı tek bir gidiş-dönüş gecikme hattı temsil eder. Klarnet bir ucu
       kapalı (kamış), öbür ucu açık (çan) bir boru gibi davranır; açık uçtaki yansıma işaret değiştirir.
       Gidiş-dönüş iki kez yapılınca periyot tamamlanır, bu yüzden yalnızca tek harmonikler güçlü çıkar.
     - Çan: açık uçta düşük frekansları yansıtıp yüksekleri dışarı salan basit bir alçak geçiren filtre.
     - Kamış: ağızdaki basınçla borudaki basıncın farkına göre açılıp kapanan bir supap. Yansıma katsayısı
       basınç farkının doğrusal bir fonksiyonudur ve [-1, 1] arasına kırpılır.
   Delikler modellenmez: parmak pozisyonu boru boyunu, yani gecikme uzunluğunu seçer. */
(function (root) {
  class KlarnetDSP {
    constructor(sr) {
      this.sr = sr;
      this.N = 4096;
      this.buf = new Float32Array(this.N);
      this.w = 0;
      this.lp = 0;            // çan filtresinin belleği (bir önceki örnek)
      this.hp = 0; this.hpx = 0; // ışıma (yüksek geçiren) belleği
      this.noise = 12345;
      this.vibPh = 0;
      // anlık değerler (yumuşatılmış)
      this.f = 392; this.breath = 0; this.lip = 0.5; this.stiff = 0.5; this.bend = 0;
      this.vibDepth = 0; this.vibRate = 5.5; this.noiseAmt = 0.06;
      this.mode = 1;          // 1: temel; 3: "kaz sesi" (üçüncü kipe sıçrama)
      this.squeak = 0;
      this.delay = this.delayFor(392);
      this.dc = 0;
    }
    // hedef frekans için gecikme: periyot = 2·(D + 0,5) örnek (çan filtresi 0,5 örnek gecikir).
    // Kalan küçük sapma ölçülüp düzeltilir (tools/olcum.js): düzeltme cent cinsinden frekansa bağlı.
    delayFor(f) {
      const D = this.sr / (2 * f) - 0.5 - KlarnetDSP.DUZELTME_ORNEK;
      return Math.max(4, Math.min(this.N - 8, D));
    }
    rnd() { // hızlı sözde rastgele (-1..1)
      this.noise = (this.noise * 1664525 + 1013904223) >>> 0;
      return this.noise / 2147483648 - 1;
    }
    read(d) { // 3. derece Lagrange ara değerlemesi
      let rp = this.w - d;
      while (rp < 0) rp += this.N;
      const i = Math.floor(rp), fr = rp - i;
      const N = this.N, b = this.buf;
      const x0 = b[(i - 1 + N) % N], x1 = b[i % N], x2 = b[(i + 1) % N], x3 = b[(i + 2) % N];
      // Lagrange: noktalar -1, 0, 1, 2
      const c0 = -fr * (fr - 1) * (fr - 2) / 6, c1 = (fr + 1) * (fr - 1) * (fr - 2) / 2;
      const c2 = -(fr + 1) * fr * (fr - 2) / 2, c3 = (fr + 1) * fr * (fr - 1) / 6;
      return c0 * x0 + c1 * x1 + c2 * x2 + c3 * x3;
    }
    /* Bir örnek üret. p: { f, breath, lip, stiff, bend, vibDepth, vibRate } (o anki hedefler) */
    tick(p) {
      // parametreleri yumuşat (tıklama olmasın)
      const a = 0.0015;
      this.breath += (p.breath - this.breath) * 0.004;
      this.lip += (p.lip - this.lip) * a * 4;
      this.stiff += (p.stiff - this.stiff) * a;
      this.bend += (p.bend - this.bend) * 0.003;
      this.vibDepth += (p.vibDepth - this.vibDepth) * a;
      // dudak: gevşek dudak perdeyi düşürür, sıkı dudak hafifçe yükseltir (sent)
      const lipCent = this.lip < 0.5 ? (this.lip - 0.5) * 140 : (this.lip - 0.5) * 60;
      this.vibPh += (2 * Math.PI * p.vibRate) / this.sr;
      if (this.vibPh > 2 * Math.PI) this.vibPh -= 2 * Math.PI;
      const vib = Math.sin(this.vibPh) * this.vibDepth;
      // "kaz sesi": çok güçlü nefes ve çok sıkı dudakla kamış üst kipe sıçrar
      const sq = this.breath > 0.93 && this.lip > 0.84 ? 1 : 0;
      this.squeak += (sq - this.squeak) * 0.0008;
      const cent = this.bend + lipCent + vib * 25;
      const f = p.f * Math.pow(2, cent / 1200) * (this.squeak > 0.5 ? 3 : 1);
      const target = this.delayFor(f);
      // glissando: gecikmeyi hedefe doğru kaydır
      this.delay += (target - this.delay) * (p.glide || 0.02);

      // nefes basıncı: nefes + türbülans gürültüsü + vibrato (nefesle yapılan dalgalanma)
      const br = this.breath * (1 + this.noiseAmt * this.rnd() + vib * 0.02);
      // borudan dönen dalga, çanda işaret değiştirerek ve süzülerek yansır
      const back = this.read(this.delay);
      const low = 0.5 * (back + this.lp);   // tek sıfırlı alçak geçiren (çan): gecikmesi tam 0,5 örnek
      this.lp = back;
      const refl = -0.95 * low;
      // kamış: basınç farkına göre yansıma katsayısı
      const pd = refl - br;
      // dudak baskısı kamış açıklığını (ofset), kamış sertliği eğimi belirler
      const offset = 0.78 - 0.22 * this.lip;
      const slope = -0.44 + 0.26 * this.stiff;
      let r = offset + slope * pd;
      if (r > 1) r = 1; else if (r < -1) r = -1;
      const inp = br + pd * r;
      this.buf[this.w] = inp;
      this.w = (this.w + 1) % this.N;
      // ışıma: çandan dışarı çıkan ses yüksek frekansları daha çok taşır (birinci dereceden yüksek geçiren)
      // nefesin hava sesi: kamış titreşmese de duyulan hafif hışırtı
      const y = back + this.rnd() * 0.012 * this.breath;
      this.hp = 0.995 * (this.hp + y - this.hpx);
      this.hpx = y;
      return this.hp;
    }
  }
  // Ölçülen sabit sapma (örnek): tools/olcum.js ile belirlendi
  KlarnetDSP.DUZELTME_ORNEK = 0;

  root.KlarnetDSP = KlarnetDSP;
  if (typeof module !== "undefined" && module.exports) module.exports = KlarnetDSP;
})(typeof globalThis !== "undefined" ? globalThis : this);
