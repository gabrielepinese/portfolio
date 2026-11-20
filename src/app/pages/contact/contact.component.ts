import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MotionService } from '../../shared/services/motion.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { HttpClientComponent } from './http-client/http-client.component';
import { injectTitleTypewriter } from '../../shared/utils/typewriter';
import { scrollBelowNavbar } from '../../shared/utils/scroll';

/** Typed title; a page-coloured "." is typed after it (like "About me." / "Work."). */
const TITLE = 'Contact me';
const SUBTITLE =
  "Got a project, an idea, or just curious? Reach out — I'm always happy to connect, especially if you work in payments or fintech.";

@Component({
  selector: 'app-contact',
  imports: [RevealDirective, HttpClientComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly motion = inject(MotionService);

  // ── typewriter title (same feel as the Home headline) ──
  private readonly hero = injectTitleTypewriter(TITLE, 95);
  readonly title = this.hero.title;
  readonly typing = this.hero.typing;
  readonly caret = this.hero.caret;
  /** Title written: the rest of the hero (subtitle, chat, cue) starts. */
  readonly done = this.hero.done;

  readonly subtitle = SUBTITLE;
  readonly subtitleWords = SUBTITLE.split(' ');

  /**
   * Hero chat, seen from the visitor's side, played once. `at` = second the typing dots
   * appear; the bubble replaces them 0.7 s later. `seen` = when the "Seen" receipt shows
   * under the visitor's last message. Times count from the end of the typed title; the
   * whole hero settles ≈ 5 s after load (WCAG 2.2.2: no pause control needed).
   */
  readonly chat = [
    { text: 'Hi Gabriele 👋', mine: true, at: 0.4 },
    {
      text: "Got a minute? I have an idea I'd love to build.",
      mine: true,
      at: 1.0,
    },
    { text: 'Always. Tell me everything', mine: false, at: 2.0 },
  ];
  readonly seenAt = 1.8;

  /** "New message" cue: smooth scroll to the text + form section, below the fixed navbar. */
  jumpToForm(target: HTMLElement): void {
    scrollBelowNavbar(target, { instant: this.motion.paused() });
  }
}
