import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  viewChild,
} from "@angular/core";
import { MotionService } from "../../../shared/services/motion.service";

type Shape = "circle" | "square" | "triangle" | "cross";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** resting drift velocity the particle eases back to after being pushed */
  dx: number;
  dy: number;
  /** 0.3 (far) → 1 (near): drives size, opacity, parallax and push strength */
  depth: number;
  rot: number;
  vrot: number;
  baseVrot: number;
  size: number;
  label?: string;
  shape?: Shape;
  color: string;
  /** 0 → 1, smoothed proximity to the cursor */
  glow: number;
}

interface Ring {
  x: number;
  y: number;
  r: number;
  life: number;
}

const TOKENS = [
  "{ }", "</>", "=>", "( )", "[ ]", ";", "&&", "!==", "++", "fn", "const", "λ",
  "::", "/* */", "0x1F", "?.", "|>", "async", "**", "#", "let", "{}", "//", "await",
  "<T>", "===", "||", "...", "return", "import", "$", "@", "%", "true", "null", "if",
];
const SHAPES: Shape[] = ["circle", "square", "triangle", "cross"];
const COLORS = ["#6b350b", "#6b350b", "#f1a661", "#e38b29"];
const ACCENT = "227, 139, 41";
const GLOW_COLOR = "#e38b29";

const PUSH_RADIUS = 150;
const GLOW_RADIUS = 210;
const PARALLAX = 46;

/**
 * Full-bleed canvas of floating programming tokens and outline shapes.
 * Particles drift upward, react to the cursor (parallax by depth, push-away,
 * glow + connecting lines) and burst outward on click.
 */
@Component({
  selector: "app-code-field",
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      pointer-events: none;
      z-index: 0;
      mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%);
      -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 70%, transparent 100%);
    }
    :host(.contained) {
      position: relative;
      inset: auto;
      pointer-events: auto;
      touch-action: none;
      mask-image: none;
      -webkit-mask-image: none;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "aria-hidden": "true", "[class.contained]": "contained()" },
})
export class CodeFieldComponent {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly motion = inject(MotionService);

  /** Element the particles bounce off (e.g. the hero board), so they never fly under the text. */
  readonly obstacle = input<HTMLElement | null>(null);
  /** Toy-box mode: particles stay inside the element, bounce off its walls, no parallax. */
  readonly contained = input(false);

  constructor() {
    afterNextRender(() => this.start());
  }

  private start(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const contained = this.contained();
    const parallax = contained ? 0 : PARALLAX;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const rings: Ring[] = [];

    // cursor state (canvas coords) + smoothed parallax (-1 → 1)
    let mx = -9999;
    let my = -9999;
    let active = false;
    let tx = 0;
    let ty = 0;
    let px = 0;
    let py = 0;

    const startedAt = performance.now();
    let frame = 0;
    let visible = true;
    let paused = this.motion.paused();

    const spawn = (x?: number, y?: number): Particle => {
      const depth = 0.3 + Math.random() * 0.7;
      const isShape = Math.random() < 0.28;
      return {
        x: x ?? Math.random() * w,
        y: y ?? Math.random() * h,
        vx: 0,
        vy: 0,
        dx: (Math.random() - 0.5) * (contained ? 0.8 : 0.35) * depth,
        dy: contained
          ? (Math.random() - 0.5) * 0.8 * depth
          : -(0.08 + Math.random() * 0.3) * depth,
        depth,
        rot: (Math.random() - 0.5) * 0.8,
        vrot: 0,
        baseVrot: (Math.random() - 0.5) * 0.004,
        size: contained ? 11 + depth * 16 : 11 + depth * 24,
        label: isShape ? undefined : TOKENS[Math.floor(Math.random() * TOKENS.length)],
        shape: isShape ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : undefined,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        glow: 0,
      };
    };

    const resize = () => {
      const rect = this.host.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = contained
        ? Math.max(12, Math.min(30, Math.round((w * h) / 6000)))
        : Math.max(22, Math.min(75, Math.round((w * h) / 20000)));
      while (particles.length < target) particles.push(spawn());
      if (particles.length > target) particles = particles.slice(0, target);
    };

    const drawShape = (shape: Shape, s: number) => {
      ctx.beginPath();
      switch (shape) {
        case "circle":
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          break;
        case "square":
          ctx.rect(-s / 2, -s / 2, s, s);
          break;
        case "triangle":
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 2, s / 2);
          ctx.lineTo(-s / 2, s / 2);
          ctx.closePath();
          break;
        case "cross":
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(0, s / 2);
          ctx.moveTo(-s / 2, 0);
          ctx.lineTo(s / 2, 0);
          break;
      }
      ctx.stroke();
    };

    const render = (now: number) => {
      frame = 0;
      // paused: draw a single still frame at full opacity
      const intro = paused ? 1 : Math.min(1, (now - startedAt) / 1400);

      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;

      ctx.clearRect(0, 0, w, h);

      // obstacle rect in canvas coordinates
      let ob: { l: number; t: number; r: number; b: number } | null = null;
      const obEl = this.obstacle();
      if (obEl) {
        const c = canvas.getBoundingClientRect();
        const o = obEl.getBoundingClientRect();
        if (o.width > 0) ob = { l: o.left - c.left, t: o.top - c.top, r: o.right - c.left, b: o.bottom - c.top };
      }

      // soft spotlight following the cursor
      if (active) {
        const g = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
        g.addColorStop(0, "rgba(241, 166, 97, 0.28)");
        g.addColorStop(1, "rgba(241, 166, 97, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // click shockwaves
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.r += 7;
        ring.life -= 0.022;
        if (ring.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ACCENT}, ${ring.life * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const p of particles) {
        const sx = p.x + px * p.depth * parallax;
        const sy = p.y + py * p.depth * parallax;

        let glowTarget = 0;
        if (active) {
          const ddx = sx - mx;
          const ddy = sy - my;
          const d = Math.hypot(ddx, ddy) || 1;
          if (d < PUSH_RADIUS) {
            const f = (1 - d / PUSH_RADIUS) * 0.9 * p.depth;
            p.vx += (ddx / d) * f;
            p.vy += (ddy / d) * f;
          }
          if (d < GLOW_RADIUS) glowTarget = 1 - d / GLOW_RADIUS;
        }
        p.glow += (glowTarget - p.glow) * 0.12;

        // ease back to the resting drift
        p.vx += (p.dx - p.vx) * 0.035;
        p.vy += (p.dy - p.vy) * 0.035;
        p.x += p.vx;
        p.y += p.vy;

        // bounce off the board: push out through the closest edge and reflect velocity
        if (ob) {
          const pad = 10 + p.size * 0.6;
          const qx = p.x + px * p.depth * parallax;
          const qy = p.y + py * p.depth * parallax;
          if (qx > ob.l - pad && qx < ob.r + pad && qy > ob.t - pad && qy < ob.b + pad) {
            const dl = qx - (ob.l - pad);
            const dr = ob.r + pad - qx;
            const dt = qy - (ob.t - pad);
            const db = ob.b + pad - qy;
            const min = Math.min(dl, dr, dt, db);
            if (min === dl) {
              p.x -= dl;
              p.vx = -Math.abs(p.vx) * 0.8 - 0.3;
            } else if (min === dr) {
              p.x += dr;
              p.vx = Math.abs(p.vx) * 0.8 + 0.3;
            } else if (min === dt) {
              p.y -= dt;
              p.vy = -Math.abs(p.vy) * 0.8 - 0.3;
            } else {
              p.y += db;
              p.vy = Math.abs(p.vy) * 0.8 + 0.3;
            }
            p.vrot += (Math.random() - 0.5) * 0.02;
          }
        }
        p.vrot += (p.baseVrot - p.vrot) * 0.02;
        p.rot += p.vrot + p.vx * 0.004;

        if (contained) {
          // bounce off the box walls
          const r = p.size * 0.6;
          if (p.x < r) {
            p.x = r;
            p.vx = Math.abs(p.vx);
            p.dx = Math.abs(p.dx);
          } else if (p.x > w - r) {
            p.x = w - r;
            p.vx = -Math.abs(p.vx);
            p.dx = -Math.abs(p.dx);
          }
          if (p.y < r) {
            p.y = r;
            p.vy = Math.abs(p.vy);
            p.dy = Math.abs(p.dy);
          } else if (p.y > h - r) {
            p.y = h - r;
            p.vy = -Math.abs(p.vy);
            p.dy = -Math.abs(p.dy);
          }
        }

        // otherwise wrap around the edges
        if (!contained) {
          const m = 80;
          if (p.y < -m) Object.assign(p, spawn(Math.random() * w, h + m / 2));
          else if (p.y > h + m) p.y = -m / 2;
          if (p.x < -m) p.x = w + m / 2;
          else if (p.x > w + m) p.x = -m / 2;
        }

        // final on-screen position after movement/collision
        const fx = p.x + px * p.depth * parallax;
        const fy = p.y + py * p.depth * parallax;

        // line from cursor to nearby particles
        if (p.glow > 0.12) {
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(fx, fy);
          ctx.strokeStyle = `rgba(${ACCENT}, ${p.glow * 0.35 * intro})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        const alpha = Math.min(1, 0.13 + p.depth * 0.28 + p.glow * 0.6) * intro;
        const scale = 1 + p.glow * 0.45;

        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(p.rot);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        const color = p.glow > 0.35 ? GLOW_COLOR : p.color;
        if (p.label) {
          ctx.fillStyle = color;
          ctx.font = `700 ${p.size}px "JetBrains Mono", "Courier New", monospace`;
          ctx.fillText(p.label, 0, 0);
        } else if (p.shape) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.6 + p.depth;
          drawShape(p.shape, p.size * 1.1);
        }
        ctx.restore();
      }

      if (visible && !paused) frame = requestAnimationFrame(render);
    };

    const loop = () => {
      if (!frame && visible) frame = requestAnimationFrame(render);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      active = !paused && mx >= 0 && my >= 0 && mx <= rect.width && my <= rect.height;
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onLeave = () => {
      active = false;
      tx = 0;
      ty = 0;
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") onLeave();
    };

    const onDown = (e: PointerEvent) => {
      if (paused) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      rings.push({ x, y, r: 0, life: 1 });
      for (const p of particles) {
        const sx = p.x + px * p.depth * parallax;
        const sy = p.y + py * p.depth * parallax;
        const d = Math.hypot(sx - x, sy - y) || 1;
        if (d < 340) {
          const f = (1 - d / 340) * 14 * p.depth;
          p.vx += ((sx - x) / d) * f;
          p.vy += ((sy - y) / d) * f;
          p.vrot += (Math.random() - 0.5) * 0.05;
        }
      }
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      loop(); // resizing clears the canvas: redraw (needed when paused)
    });
    ro.observe(this.host);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      loop();
    });
    io.observe(this.host);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    // "Pause animations" (WCAG 2.2.2): freeze in place, resume from where it stopped
    effect(
      () => {
        paused = this.motion.paused();
        if (paused) {
          onLeave();
          rings.length = 0;
        }
        loop();
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    });
  }
}
