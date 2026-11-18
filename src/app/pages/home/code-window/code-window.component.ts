import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from "@angular/core";
import { MotionService } from "../../../shared/services/motion.service";

type TokenType = "kw" | "var" | "prop" | "str" | "op" | "fn" | "cm";
type Token = [TokenType, string];

const CODE: Token[][] = [
  [["kw", "const "], ["var", "gabriele"], ["op", " = {"]],
  [["op", "  "], ["prop", "role"], ["op", ": "], ["str", '"Software Engineer"'], ["op", ","]],
  [["op", "  "], ["prop", "company"], ["op", ": "], ["str", '"Lunalabs"'], ["op", ","]],
  [["op", "  "], ["prop", "based"], ["op", ": "], ["str", '"Milan, IT"'], ["op", ","]],
  [["op", "  "], ["prop", "stack"], ["op", ": ["], ["str", '"Angular"'], ["op", ", "], ["str", '"TS"'], ["op", ", "], ["str", '"Node"'], ["op", ", "], ["str", '"SQL"'], ["op", "],"]],
  [["op", "  "], ["prop", "focus"], ["op", ": "], ["str", '"digital payments"'], ["op", ","]],
  [["op", "};"]],
  [],
  [["var", "gabriele"], ["op", "."], ["fn", "ship"], ["op", "();"], ["cm", " // end-to-end"]],
];

const OUTPUT = [
  "$ npm run ship",
  "✔ ui        compiled",
  "✔ api       200 OK",
  "✔ database  migrated",
  "→ deployed to production",
];

interface TokenView {
  cls: TokenType;
  shown: string;
  hidden: string;
  caret: boolean;
}

/** Fake IDE window that types a code snippet (with syntax colours) once scrolled into view. */
@Component({
  selector: "app-code-window",
  templateUrl: "./code-window.component.html",
  styleUrl: "./code-window.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "aria-hidden": "true" },
})
export class CodeWindowComponent {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;

  private readonly total = CODE.flat().reduce((n, [, t]) => n + t.length, 0);
  private readonly typed = signal(0);
  readonly outputShown = signal(0);
  readonly typing = computed(() => this.typed() > 0 && this.typed() < this.total);
  readonly output = OUTPUT;
  readonly files = ["gabriele.ts", "payments.ts"];

  readonly lines = computed<TokenView[][]>(() => {
    const typed = this.typed();
    let offset = 0;
    let caretPlaced = false;
    return CODE.map((line) =>
      line.map(([cls, text]) => {
        const start = offset;
        offset += text.length;
        const visible = Math.max(0, Math.min(text.length, typed - start));
        const caret = !caretPlaced && typed <= offset;
        if (caret) caretPlaced = true;
        return { cls, shown: text.slice(0, visible), hidden: text.slice(visible), caret };
      }),
    );
  });

  private readonly motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    let timer: ReturnType<typeof setTimeout>;

    afterNextRender(() => {
      const lineEnds = new Set<number>();
      CODE.reduce((acc, line) => {
        const end = acc + line.reduce((n, [, t]) => n + t.length, 0);
        lineEnds.add(end);
        return end;
      }, 0);

      // "Pause animations": skip straight to the finished state
      const complete = () => {
        clearTimeout(timer);
        this.typed.set(this.total);
        this.outputShown.set(OUTPUT.length);
      };

      const showOutput = () => {
        if (this.motion.paused()) return complete();
        if (this.outputShown() >= OUTPUT.length) return;
        this.outputShown.update((n) => n + 1);
        timer = setTimeout(showOutput, 380);
      };

      const step = () => {
        if (this.motion.paused()) return complete();
        const next = this.typed() + 1;
        this.typed.set(next);
        if (next >= this.total) {
          timer = setTimeout(showOutput, 500);
          return;
        }
        const delay = lineEnds.has(next) ? 220 : 24 + Math.random() * 40;
        timer = setTimeout(step, delay);
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            io.disconnect();
            timer = setTimeout(step, 400);
          }
        },
        { threshold: 0.35 },
      );
      io.observe(this.host);

      destroyRef.onDestroy(() => {
        io.disconnect();
        clearTimeout(timer);
      });
    });
  }
}
