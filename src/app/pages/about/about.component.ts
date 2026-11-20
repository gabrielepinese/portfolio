import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOCUMENT, NgOptimizedImage } from "@angular/common";
import { injectIsMediumBreakpoint } from "../../shared/utils/breakpoint";
import { MagneticButtonDirective } from "../../shared/directives/magnetic-button.directive";
import { RevealDirective } from "../../shared/directives/reveal.directive";
import { MotionService } from "../../shared/services/motion.service";
import { injectTitleTypewriter } from "../../shared/utils/typewriter";
import { scrollBelowNavbar } from "../../shared/utils/scroll";
import { SketchpadComponent } from "./sketchpad/sketchpad.component";
import { IllustrationComponent } from "./illustration/illustration.component";

/** Typed title; a page-coloured "." is typed after it (like "Work." / "Contact me."). */
const TITLE = "About me";
const SUBTITLE =
  "What excites me most about software engineering is following a problem end-to-end — from the interface down to the data behind it — and building systems people can rely on.";

interface StackItem {
  src: string;
  label: string;
}

/** One syntax-coloured token of the hero editor. */
interface Token {
  k: "kw" | "var" | "prop" | "str" | "op" | "cm" | "type";
  t: string;
}

@Component({
  selector: "app-about",
  imports: [NgOptimizedImage, MagneticButtonDirective, RevealDirective, SketchpadComponent, IllustrationComponent],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionService);

  readonly isMedium = injectIsMediumBreakpoint();

  // ── typewriter title (same feel as the Home / Contact / Work headlines) ──
  private readonly hero = injectTitleTypewriter(TITLE, 100);
  readonly title = this.hero.title;
  readonly typing = this.hero.typing;
  readonly caret = this.hero.caret;
  /** Title written: the rest of the hero (subtitle, editor, cue) starts. */
  readonly done = this.hero.done;

  readonly subtitle = SUBTITLE;
  readonly subtitleWords = SUBTITLE.split(" ");

  /**
   * Hero editor: a `profile.ts` written line by line (each line fades in at `--t`, see
   * SCSS). Decorative: the sections below say the same in plain words.
   */
  readonly code: { indent?: boolean; tokens: Token[] }[] = [
    { tokens: [{ k: "cm", t: "// who's behind the code" }] },
    {
      tokens: [
        { k: "kw", t: "export const " },
        { k: "var", t: "me" },
        { k: "op", t: " = {" },
      ],
    },
    { indent: true, tokens: [{ k: "prop", t: "name" }, { k: "op", t: ": " }, { k: "str", t: '"Gabriele Pinese"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "role" }, { k: "op", t: ": " }, { k: "str", t: '"Software Engineer"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "based" }, { k: "op", t: ": " }, { k: "str", t: '"Milan, Italy"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "studied" }, { k: "op", t: ": " }, { k: "str", t: '"University of Milan"' }, { k: "op", t: "," }] },
    {
      indent: true,
      tokens: [
        { k: "prop", t: "cares" },
        { k: "op", t: ": [" },
        { k: "str", t: '"correctness"' },
        { k: "op", t: ", " },
        { k: "str", t: '"reliability"' },
        { k: "op", t: "]," },
      ],
    },
    { indent: true, tokens: [{ k: "prop", t: "next" }, { k: "op", t: ": " }, { k: "str", t: '"digital payments"' }, { k: "op", t: "," }] },
    { indent: true, tokens: [{ k: "prop", t: "offline" }, { k: "op", t: ": " }, { k: "str", t: '"drawing ✎"' }, { k: "op", t: "," }] },
    {
      tokens: [
        { k: "op", t: "} " },
        { k: "kw", t: "satisfies " },
        { k: "type", t: "Human" },
        { k: "op", t: ";" },
      ],
    },
  ];
  /** Seconds (after the title) at which the first code line prints, and the gap between lines. */
  readonly codeStart = 0.6;
  readonly codeStep = 0.2;

  /** Local SVG / image per tool (no icon-font CDN: ~8 kB total instead of a 146 kB CSS + font). */
  readonly STACK: StackItem[] = [
    { src: "assets/icon/stack/angular-original.svg", label: "Angular" },
    { src: "assets/icon/stack/typescript-original.svg", label: "TypeScript" },
    { src: "assets/icon/stack/react-original.svg", label: "React" },
    { src: "assets/icon/java.svg", label: "Java" },
    { src: "assets/icon/kotlin.svg", label: "Kotlin" },
    { src: "assets/icon/stack/csharp-original.svg", label: "C#" },
    { src: "assets/icon/stack/tailwindcss-original.svg", label: "Tailwind" },
    { src: "assets/icon/stack/git-original.svg", label: "Git" },
    { src: "assets/icon/stack/figma-original.svg", label: "Figma" },
    { src: "assets/icon/zed.webp", label: "Zed" },
  ];

  /** "Open README" cue: smooth scroll to the story section, below the fixed navbar. */
  jumpTo(target: HTMLElement): void {
    scrollBelowNavbar(target, { instant: this.motion.paused() });
  }

  downloadCV() {
    const link = this.document.createElement("a");
    link.href = "assets/pdf/Gabriele_Pinese_CV.pdf";
    link.download = "Gabriele_Pinese_CV.pdf";
    this.document.body.appendChild(link);
    link.click();
    this.document.body.removeChild(link);
  }
}
