// CEVONS logo loader engine. Canvas, no dependencies.
//
// Copied unchanged from the HSE Cevons Nexus app (lib/ui/system/cevons-loader.ts),
// which took it as supplied in cevons-motion-v2.zip. Do not edit its colours,
// sizes or timings; the React side is CevonsLoader.tsx.
//
//
// The logo is the spinner. The red ring with its white arrows travels round its own ellipse
// (the mark is a cycle), easing into the exact logo pose once per revolution, where the C disc
// catches a gloss and a light scan runs round the rings. Around it, on larger sizes, a thin orbital
// layer: a comet in the logo's red → yellow → green that grows and shrinks as it circles, and a
// tick dial with a chasing highlight. In progress mode the comet becomes a progress arc that runs
// red → yellow → green as it fills.
//
// Sizes: < 40px "mini" (logo only), 40–95px "compact" (logo + comet), ≥ 96px "full".
// Reduced motion: no rotation; the rings breathe and the gloss passes, so activity is still visible.

export type LoaderTone = 'light' | 'dark';
export type LoaderLayers = { red: string; yellow: string; green: string };
export type LoaderOptions = {
  size: number;
  tone?: LoaderTone;
  /** 0..1 for progress mode; leave undefined for a spinning (indeterminate) loader. */
  progress?: number;
  layers: LoaderLayers;
  maxDpr?: number;
};

type Img = HTMLImageElement;
type RGB = [number, number, number];
const TAU = Math.PI * 2;
const RED: RGB = [210, 9, 17], YEL: RGB = [255, 214, 0], GRN: RGB = [59, 169, 54], WHITE: RGB = [255, 255, 255];
const PERIOD = 1.5;
// Layer geometry in box units (square canvas; measured from the master artwork)
const E = { cx: 0.5004, cy: 0.4996, rx: 0.4941, ry: 0.3829 };
const CONTENT_W = 0.991;

const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v);
const mod = (a: number, n: number): number => ((a % n) + n) % n;
const easeIO = (x: number): number => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
const sine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a: number): string => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a)})`;
const brandAt = (f: number): RGB => (f < 0.5 ? mix(RED, YEL, f / 0.5) : mix(YEL, GRN, (f - 0.5) / 0.5));

const cache = new Map<string, Promise<Img>>();
function load(src: string): Promise<Img> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
    cache.set(src, p);
  }
  return p;
}

export class CevonsLoader {
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; opts: LoaderOptions;
  imgs: { red: Img; yellow: Img; green: Img } | null = null;
  off: HTMLCanvasElement; ox: CanvasRenderingContext2D;
  raf = 0; t0 = 0; running = false; reduced: boolean; dpr = 1; shown = 0; progShown = 0;
  onVis: () => void;

  constructor(canvas: HTMLCanvasElement, opts: LoaderOptions) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d')!;
    this.opts = Object.assign({ tone: 'light', maxDpr: 2 }, opts);
    this.off = document.createElement('canvas'); this.ox = this.off.getContext('2d')!;
    this.reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.frame = this.frame.bind(this);
    this.onVis = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', this.onVis);
    this.resize();
    const L = this.opts.layers;
    Promise.all([load(L.red), load(L.yellow), load(L.green)]).then(([red, yellow, green]) => { this.imgs = { red, yellow, green }; }).catch(() => {});
    this.t0 = performance.now();
    this.start();
  }

  set(opts: Partial<LoaderOptions>) {
    const sized = opts.size !== undefined && opts.size !== this.opts.size;
    Object.assign(this.opts, opts);
    if (sized) this.resize();
  }

  resize() {
    const s = this.opts.size;
    this.dpr = Math.min(this.opts.maxDpr ?? 2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(s * this.dpr); this.canvas.height = Math.round(s * this.dpr);
    this.canvas.style.width = s + 'px'; this.canvas.style.height = s + 'px';
    this.off.width = this.canvas.width; this.off.height = this.canvas.height;
  }

  start() { if (this.running) return; this.running = true; this.raf = requestAnimationFrame(this.frame); }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
  destroy() { this.stop(); document.removeEventListener('visibilitychange', this.onVis); }

  private tier(): 'mini' | 'compact' | 'full' { const s = this.opts.size; return s < 40 ? 'mini' : s < 96 ? 'compact' : 'full'; }

  frame(now: number) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    this.draw((now - this.t0) / 1000);
  }

  draw(t: number) {
    const ctx = this.ctx, s = this.opts.size, tier = this.tier(), dark = this.opts.tone === 'dark';
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);
    if (!this.imgs) return;
    this.shown = Math.min(1, this.shown + 1 / 14);
    const appear = sine(this.shown);
    const M = s * (tier === 'full' ? 0.62 : tier === 'compact' ? 0.8 : 1);
    const cx = s / 2, cy = s / 2;
    const rx = E.rx * M, ry = E.ry * M;
    const progress = this.opts.progress;
    const det = typeof progress === 'number';
    if (det) this.progShown += (clamp(progress!) - this.progShown) * 0.12;

    // time within the revolution; the rings rest in the exact logo pose at the cycle boundary
    const u = mod(t, PERIOD) / PERIOD;
    const turn = this.reduced ? 0 : easeIO(u);
    const rest = this.reduced ? 1 : Math.max(1 - clamp(u / 0.12), clamp((u - 0.88) / 0.12));
    const pulse = this.reduced ? 0.5 + 0.5 * Math.cos((t / 2.4) * TAU) : Math.pow(rest, 3);

    // halo
    if (tier !== 'mini') {
      const hg = ctx.createRadialGradient(cx, cy, rx * 0.4, cx, cy, rx * (tier === 'full' ? 1.55 : 1.3));
      const hc: RGB = dark ? [120, 170, 255] : [255, 255, 255];
      hg.addColorStop(0, rgba(hc, (dark ? 0.1 : 0.9) * appear * (0.6 + 0.4 * pulse))); hg.addColorStop(1, rgba(hc, 0));
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, cy, rx * 1.6, 0, TAU); ctx.fill();
    }

    // orbital layer
    const track: RGB = dark ? [210, 225, 250] : [11, 35, 71];
    if (tier !== 'mini') {
      const k1 = tier === 'full' ? 1.16 : 1.13;
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(track, (dark ? 0.14 : 0.1) * appear); ctx.lineWidth = Math.max(1, s * 0.012);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx * k1, ry * k1, 0, 0, TAU); ctx.stroke();
      if (det) this.progressArc(cx, cy, rx * k1, ry * k1, this.progShown, s, appear);
      else if (!this.reduced) this.comet(cx, cy, rx * k1, ry * k1, t, s, appear);
      if (tier === 'full') this.dial(cx, cy, rx * 1.3, ry * 1.3, t, s, appear, track, dark);
    }

    // the logo: yellow (still), disc (still), red + white arrows travelling round their ellipse
    const I = this.imgs;
    const breathe = 1 + 0.018 * pulse;
    ctx.save(); ctx.globalAlpha = appear; ctx.translate(cx, cy); ctx.scale(breathe * (0.94 + 0.06 * appear), breathe * (0.94 + 0.06 * appear)); ctx.translate(-cx, -cy);
    const drawLayer = (img: Img, c: CanvasRenderingContext2D, rot = 0) => {
      c.save();
      const ox = cx + (E.cx - 0.5) * M, oy = cy + (E.cy - 0.5) * M;
      c.translate(ox, oy);
      if (rot) { c.scale(1, ry / rx); c.rotate(rot); c.scale(1, rx / ry); }
      c.imageSmoothingQuality = 'high';
      c.drawImage(img, -M / 2 - (E.cx - 0.5) * M, -M / 2 - (E.cy - 0.5) * M, M, M);
      c.restore();
    };
    const rot = turn * TAU;
    drawLayer(I.yellow, ctx);
    drawLayer(I.green, ctx);
    drawLayer(I.red, ctx, rot);
    ctx.restore();

    // light scan round the rings, and a gloss across the C as the rings come to rest
    if (tier !== 'mini' || s >= 28) {
      const o = this.ox;
      o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, this.off.width, this.off.height); o.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      o.save(); o.translate(cx, cy); o.scale(breathe, breathe); o.translate(-cx, -cy);
      drawLayer(I.yellow, o); drawLayer(I.red, o, rot);
      o.restore();
      o.globalCompositeOperation = 'source-in';
      if (!this.reduced && 'createConicGradient' in o) {
        const g = (o as CanvasRenderingContext2D).createConicGradient(-Math.PI / 2 - rot * 0.6 - TAU * u * 0.4, cx, cy);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.045, 'rgba(255,255,255,0.38)'); g.addColorStop(0.075, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        o.fillStyle = g; o.fillRect(0, 0, s, s);
      } else { o.fillStyle = 'rgba(255,255,255,0)'; o.fillRect(0, 0, s, s); }
      o.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = appear; ctx.drawImage(this.off, 0, 0); ctx.restore();

      // gloss runs from u = 0.84 through the rest pose to u = 0.14 (wraps the cycle boundary)
      const gp = this.reduced ? mod(t / 2.4, 1) : mod(u - 0.84, 1) / 0.3;
      if (gp > 0 && gp < 1) {
        o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, this.off.width, this.off.height); o.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        o.save(); o.translate(cx, cy); o.scale(breathe, breathe); o.translate(-cx, -cy); drawLayer(I.green, o); o.restore();
        o.globalCompositeOperation = 'source-in';
        const x = cx - M * 0.55 + M * 1.1 * sine(gp);
        const lg = o.createLinearGradient(x - M * 0.14, cy - M * 0.25, x + M * 0.14, cy + M * 0.25);
        lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.5)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
        o.fillStyle = lg; o.fillRect(0, 0, s, s);
        o.globalCompositeOperation = 'source-over';
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = appear * Math.sin(gp * Math.PI); ctx.drawImage(this.off, 0, 0); ctx.restore();
      }
    }
  }

  /** Brand comet that grows and shrinks as it circles (the modern indeterminate rhythm). */
  private comet(cx: number, cy: number, rx: number, ry: number, t: number, s: number, appear: number) {
    const ctx = this.ctx, P = PERIOD * 2;
    const v = mod(t, P) / P;
    const head = -Math.PI / 2 + TAU * (t / P) * 1.25 + TAU * 0.35 * easeIO(v);
    const len = 0.35 + 2.1 * Math.sin(Math.PI * v) * Math.sin(Math.PI * v);
    const n = 30, lw = Math.max(1.6, s * 0.026);
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n;
      const a0 = head - len * (1 - f0), a1 = head - len * (1 - f1);
      ctx.strokeStyle = rgba(brandAt(f1), Math.pow(f1, 0.9) * appear);
      ctx.lineWidth = lw * (0.45 + 0.55 * f1);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0, a1 + 0.01); ctx.stroke();
    }
    const hx = cx + Math.cos(head) * rx, hy = cy + Math.sin(head) * ry;
    ctx.fillStyle = rgba(GRN, 0.25 * appear); ctx.beginPath(); ctx.arc(hx, hy, lw * 1.9, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(WHITE, appear); ctx.beginPath(); ctx.arc(hx, hy, lw * 0.75, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(GRN, appear); ctx.lineWidth = Math.max(1, lw * 0.3); ctx.stroke();
  }

  /** Progress arc from 12 o'clock, coloured red → yellow → green as it fills. */
  private progressArc(cx: number, cy: number, rx: number, ry: number, p: number, s: number, appear: number) {
    const ctx = this.ctx, lw = Math.max(1.8, s * 0.03);
    if (p <= 0.002) return;
    const a0 = -Math.PI / 2, span = TAU * p, n = Math.max(6, Math.ceil(60 * p));
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n;
      ctx.strokeStyle = rgba(brandAt((f0 + f1) / 2 * p), appear); ctx.lineWidth = lw;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, a0 + span * f0, a0 + span * f1 + 0.01); ctx.stroke();
    }
    const hx = cx + Math.cos(a0 + span) * rx, hy = cy + Math.sin(a0 + span) * ry, hc = brandAt(p);
    ctx.fillStyle = rgba(hc, 0.25 * appear); ctx.beginPath(); ctx.arc(hx, hy, lw * 1.8, 0, TAU); ctx.fill();
    ctx.fillStyle = rgba(WHITE, appear); ctx.beginPath(); ctx.arc(hx, hy, lw * 0.7, 0, TAU); ctx.fill();
    ctx.strokeStyle = rgba(hc, appear); ctx.lineWidth = Math.max(1, lw * 0.3); ctx.stroke();
  }

  /** Tick dial with a highlight chasing the other way. */
  private dial(cx: number, cy: number, rx: number, ry: number, t: number, s: number, appear: number, track: RGB, dark: boolean) {
    const ctx = this.ctx, n = 60, len = s * 0.022, chase = mod(-t / (PERIOD * 2), 1) * n;
    ctx.lineWidth = Math.max(1, s * 0.008); ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU - Math.PI / 2;
      const d = mod(i - chase, n), lit = this.reduced ? 0 : Math.max(0, 1 - d / 14);
      const x0 = cx + Math.cos(a) * rx, y0 = cy + Math.sin(a) * ry;
      const nx = Math.cos(a) * ry, ny = Math.sin(a) * rx, nl = Math.hypot(nx, ny) || 1;
      const L = len * (i % 5 === 0 ? 1.6 : 1);
      const col = lit > 0 ? mix(track, brandAt(1 - lit * 0.999), 0.85) : track;
      ctx.strokeStyle = rgba(col, ((dark ? 0.16 : 0.12) + (dark ? 0.7 : 0.75) * lit) * appear);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (nx / nl) * L, y0 + (ny / nl) * L); ctx.stroke();
    }
  }
}

export const LOADER_CONTENT_WIDTH = CONTENT_W;
