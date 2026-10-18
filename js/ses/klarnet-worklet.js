/* AudioWorklet işlemcisi: klarnet-dsp.js'teki fiziksel modeli gerçek zamanlı çalıştırır.
   Önce klarnet-dsp.js, sonra bu dosya addModule ile yüklenir (ikisi aynı küresel alanı paylaşır).
   Bütün parametreler a-rate: nefes, dudak ve perde örnek örnek değiştirilebilir. */
class KlarnetIslemci extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: "frekans", defaultValue: 392, minValue: 40, maxValue: 4000, automationRate: "a-rate" },
      { name: "nefes", defaultValue: 0, minValue: 0, maxValue: 1.3, automationRate: "a-rate" },
      { name: "dudak", defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: "a-rate" },
      { name: "sertlik", defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "sent", defaultValue: 0, minValue: -1200, maxValue: 1200, automationRate: "a-rate" },
      { name: "vibrato", defaultValue: 0, minValue: 0, maxValue: 1, automationRate: "k-rate" },
      { name: "vibratoHiz", defaultValue: 5.5, minValue: 0.5, maxValue: 12, automationRate: "k-rate" },
      { name: "kayma", defaultValue: 0.02, minValue: 0.0005, maxValue: 1, automationRate: "k-rate" },
    ];
  }
  constructor() {
    super();
    this.dsp = new globalThis.KlarnetDSP(sampleRate);
    this.p = { f: 392, breath: 0, lip: 0.5, stiff: 0.5, bend: 0, vibDepth: 0, vibRate: 5.5, glide: 0.02 };
    this.alive = true;
    this.port.onmessage = (e) => { if (e.data === "bitir") this.alive = false; };
  }
  process(inputs, outputs, P) {
    const out = outputs[0][0];
    if (!out) return this.alive;
    const p = this.p, d = this.dsp;
    const v = (arr, i) => (arr.length > 1 ? arr[i] : arr[0]);
    p.stiff = P.sertlik[0]; p.vibDepth = P.vibrato[0]; p.vibRate = P.vibratoHiz[0]; p.glide = P.kayma[0];
    for (let i = 0; i < out.length; i++) {
      p.f = v(P.frekans, i); p.breath = v(P.nefes, i); p.lip = v(P.dudak, i); p.bend = v(P.sent, i);
      out[i] = d.tick(p);
    }
    for (let c = 1; c < outputs[0].length; c++) outputs[0][c].set(out);
    return this.alive;
  }
}
registerProcessor("klarnet", KlarnetIslemci);
