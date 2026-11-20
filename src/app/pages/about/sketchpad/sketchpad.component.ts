import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { MotionService } from "../../../shared/services/motion.service";

type Pt = [number, number];

interface Stroke {
  color: string;
  pts: Pt[];
}

/** viewBox size: pointer coordinates are mapped into this space. */
const W = 400;
const H = 300;
const STROKE_WIDTH = 4;
/** Points closer than this (viewBox units) are dropped: smaller paths, smoother lines. */
const MIN_STEP = 2.5;
/** Characters of `d` shown per line in the code pane before it's cut with "…". */
const D_PREVIEW = 26;

/**
 * About "playground": `sketch.svg`. Whatever the visitor draws on the left is written as
 * SVG markup on the right, live — the drawing *is* the code. "Draw for me" plays the
 * site's cookie as a doodle (also the keyboard / screen-reader way in), "Export" saves
 * the drawing as a real .svg file.
 */
@Component({
  selector: "app-sketchpad",
  templateUrl: "./sketchpad.component.html",
  styleUrl: "./sketchpad.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SketchpadComponent {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionService);

  readonly W = W;
  readonly H = H;
  readonly strokeWidth = STROKE_WIDTH;

  readonly inks = [
    { name: "ink", value: "#2c3040" },
    { name: "violet", value: "#6567d4" },
    { name: "coral", value: "#e8606b" },
    { name: "mint", value: "#3fa37a" },
  ];
  readonly ink = signal(this.inks[0].value);

  /** Committed strokes + the one under the pointer (or being auto-drawn), last. */
  readonly strokes = signal<Stroke[]>([]);
  readonly drawing = signal(false);
  readonly autoplaying = signal(false);
  readonly announcement = signal("");

  readonly paths = computed(() => this.strokes().map((s) => ({ color: s.color, d: toD(s.pts) })));

  /** Code pane: one entry per `<path>` line, `d` shortened for reading. */
  readonly codeLines = computed(() =>
    this.paths().map((p) => ({
      color: p.color,
      d: p.d.length > D_PREVIEW ? p.d.slice(0, D_PREVIEW) + "…" : p.d,
    })),
  );

  readonly size = computed(() => {
    const bytes = this.svgSource().length;
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`;
  });

  private readonly svgSource = computed(() => {
    const body = this.paths()
      .map((p) => `  <path stroke="${p.color}" d="${p.d}"/>`)
      .join("\n");
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" fill="none" ` +
      `stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round">\n` +
      (body ? body + "\n" : "") +
      `</svg>\n`
    );
  });

  private rafId = 0;
  private pointerId: number | null = null;

  private readonly codeScroll = viewChild.required<ElementRef<HTMLElement>>("codeScroll");

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.rafId));
    // keep the newest <path> line in view while lines are added
    afterRenderEffect(() => {
      const n = this.codeLines().length;
      const el = this.codeScroll().nativeElement;
      if (n) el.scrollTop = el.scrollHeight;
    });
  }

  // ── freehand drawing ──
  onDown(e: PointerEvent, svg: Element): void {
    if (e.button !== 0 || this.pointerId !== null) return;
    this.stopAutoplay();
    this.pointerId = e.pointerId;
    svg.setPointerCapture(e.pointerId);
    this.drawing.set(true);
    this.strokes.update((s) => [...s, { color: this.ink(), pts: [this.toPt(e, svg)] }]);
    e.preventDefault();
  }

  onMove(e: PointerEvent, svg: Element): void {
    if (e.pointerId !== this.pointerId) return;
    // coalesced events: smoother lines on fast moves (where supported)
    const events = e.getCoalescedEvents?.() ?? [e];
    this.strokes.update((all) => {
      const last = all[all.length - 1];
      const pts = [...last.pts];
      for (const ev of events.length ? events : [e]) {
        const p = this.toPt(ev, svg);
        const q = pts[pts.length - 1];
        if (Math.hypot(p[0] - q[0], p[1] - q[1]) >= MIN_STEP) pts.push(p);
      }
      return [...all.slice(0, -1), { ...last, pts }];
    });
  }

  onUp(e: PointerEvent): void {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.drawing.set(false);
    this.announce();
  }

  private toPt(e: PointerEvent, svg: Element): Pt {
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    return [clamp(Math.round(x), 0, W), clamp(Math.round(y), 0, H)];
  }

  // ── toolbar ──
  undo(): void {
    this.stopAutoplay();
    this.strokes.update((s) => s.slice(0, -1));
    this.announce();
  }

  clear(): void {
    this.stopAutoplay();
    this.strokes.set([]);
    this.announcement.set("Sketch cleared.");
  }

  /** Plays the site's cookie as a doodle, stroke by stroke (instant with motion paused). */
  drawForMe(): void {
    this.stopAutoplay();
    const plan = cookieDoodle();
    const colors = [this.inks[0].value, ...plan.slice(1).map(() => this.inks[1].value)];
    this.strokes.set([]);

    if (this.motion.paused()) {
      this.strokes.set(plan.map((pts, i) => ({ color: colors[i], pts })));
      this.announce("Cookie drawn.");
      return;
    }

    this.autoplaying.set(true);
    let si = 0;
    let pi = 0;
    const step = () => {
      if (si >= plan.length) {
        this.autoplaying.set(false);
        this.announce("Cookie drawn.");
        return;
      }
      pi = Math.min(pi + 3, plan[si].length);
      const partial = { color: colors[si], pts: plan[si].slice(0, pi) };
      this.strokes.update((all) => (pi <= 3 ? [...all, partial] : [...all.slice(0, -1), partial]));
      if (pi >= plan[si].length) {
        si++;
        pi = 0;
      }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  private stopAutoplay(): void {
    if (!this.autoplaying()) return;
    cancelAnimationFrame(this.rafId);
    this.autoplaying.set(false);
  }

  /** Saves the drawing as a real, standalone .svg file. */
  exportSvg(): void {
    const blob = new Blob([this.svgSource()], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = this.document.createElement("a");
    a.href = url;
    a.download = "sketch.svg";
    this.document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.announcement.set("sketch.svg downloaded.");
  }

  private announce(prefix = ""): void {
    const n = this.strokes().length;
    const count = n === 0 ? "Empty sketch." : `${n} ${n === 1 ? "path" : "paths"} in the SVG.`;
    this.announcement.set(prefix ? `${prefix} ${count}` : count);
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Points → path data, smoothed with quadratic curves through the midpoints. */
function toD(pts: Pt[]): string {
  if (pts.length === 0) return "";
  const [x0, y0] = pts[0];
  if (pts.length === 1) return `M${x0} ${y0}h0`; // a dot: zero-length segment, round cap
  if (pts.length === 2) return `M${x0} ${y0}L${pts[1][0]} ${pts[1][1]}`;
  let d = `M${x0} ${y0}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const mx = Math.round((x + pts[i + 1][0]) / 2);
    const my = Math.round((y + pts[i + 1][1]) / 2);
    d += `Q${x} ${y} ${mx} ${my}`;
  }
  const [xl, yl] = pts[pts.length - 1];
  return d + `L${xl} ${yl}`;
}

/**
 * The navbar cookie as hand-drawn strokes: a wobbly disc with a bite out of the top-right,
 * then the chips. Points are in viewBox space.
 */
function cookieDoodle(): Pt[][] {
  const cx = 200;
  const cy = 150;
  const R = 105;
  const deg = Math.PI / 180;
  const at = (x: number, y: number, r: number, a: number): Pt => [
    Math.round(x + r * Math.cos(a)),
    Math.round(y + r * Math.sin(a)),
  ];

  // bite: a circle centred on the rim, up-right
  const biteA = -45 * deg;
  const bx = cx + R * Math.cos(biteA);
  const by = cy + R * Math.sin(biteA);
  const br = 42;
  const half = 2 * Math.asin(br / (2 * R)); // rim angle the bite eats on each side

  const outline: Pt[] = [];
  // rim, clockwise from the bite's lower edge all the way round to its upper edge
  for (let a = biteA + half; a <= biteA + 2 * Math.PI - half; a += 5 * deg) {
    const wobble = Math.sin(a * 5) * 2.5;
    outline.push(at(cx, cy, R + wobble, a));
  }
  // the bite edge: back along the small circle, on the side facing the centre
  // (counter-clockwise, through ≈ 135°: the side facing the cookie's centre)
  let from = Math.atan2(outline[outline.length - 1][1] - by, outline[outline.length - 1][0] - bx);
  const to = Math.atan2(outline[0][1] - by, outline[0][0] - bx);
  while (from < to) from += 2 * Math.PI;
  for (let a = from; a >= to; a -= 8 * deg) outline.push(at(bx, by, br, a));
  outline.push(outline[0]);

  const chip = (x: number, y: number, r: number): Pt[] => {
    const pts: Pt[] = [];
    for (let a = 0; a <= 2 * Math.PI + 0.01; a += 30 * deg) pts.push(at(x, y, r, a));
    return pts;
  };

  return [
    outline,
    chip(150, 125, 11),
    chip(215, 185, 12),
    chip(155, 190, 9),
    chip(205, 132, 8),
    chip(250, 160, 9),
  ];
}
