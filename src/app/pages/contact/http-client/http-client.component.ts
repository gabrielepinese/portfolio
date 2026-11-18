import {
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

const EMAIL = "gabrielepinese97@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/gabriele-pinese/";

type State = "idle" | "sending" | "done" | "error";

/**
 * Contact "playground": an IntelliJ HTTP Client file (`contact.http`).
 * The JSON body is a real form. "Send request" (or Ctrl+Enter) runs a short request
 * animation, then either a 200 OK — opening the visitor's mail client with the message
 * prefilled — or a 400 if the message is empty (field flagged, focus moved back to it).
 * Screen readers get plain-sentence announcements instead of the JSON panel.
 */
@Component({
  selector: "app-http-client",
  templateUrl: "./http-client.component.html",
  styleUrl: "./http-client.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpClientComponent {
  private readonly document = inject(DOCUMENT);
  private readonly motion = inject(MotionService);
  private readonly msgField = viewChild.required<ElementRef<HTMLTextAreaElement>>("msg");

  readonly linkedin = LINKEDIN;
  /** Editor line numbers taken by the message textarea (one per visible text row). */
  readonly msgLines = [9, 10, 11, 12];
  readonly name = signal("");
  readonly message = signal("");
  readonly state = signal<State>("idle");
  readonly copied = signal(false);
  /** Fake latency shown in the response, for flavour. */
  readonly latency = signal(0);
  private readonly copyFailed = signal(false);

  /** Text for the polite live region. */
  readonly announcement = computed(() => {
    if (this.copyFailed()) return `Couldn't copy automatically. The address is ${EMAIL}.`;
    if (this.copied()) return "Email address copied to the clipboard.";
    switch (this.state()) {
      case "sending":
        return "Sending…";
      case "done":
        return "Your mail client should open with the message ready. If it didn't, you can copy my email address or use LinkedIn.";
      case "error":
        return "Message is required. Write a message before sending.";
      default:
        return "";
    }
  });

  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearTimeout));
  }

  send(event?: Event): void {
    event?.preventDefault();
    if (this.state() === "sending") return;

    const valid = this.message().trim().length > 0;
    this.state.set("sending");
    this.latency.set(Math.round(38 + Math.random() * 40));

    this.later(() => {
      if (valid) {
        this.state.set("done");
        this.openMailClient();
      } else {
        this.state.set("error");
        this.msgField().nativeElement.focus();
      }
    }, this.motion.paused() ? 0 : 800);
  }

  onMessage(value: string): void {
    this.message.set(value);
    // typing fixes the error: clear it as soon as there's some text
    if (this.state() === "error" && value.trim()) this.state.set("idle");
  }

  /** Ctrl/Cmd + Enter sends, like running a request in the IDE. */
  onKey(e: KeyboardEvent): void {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) this.send(e);
  }

  copyEmail(): void {
    this.copyFailed.set(false);
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => {
        this.copied.set(true);
        this.later(() => this.copied.set(false), 2500);
      })
      .catch(() => this.copyFailed.set(true));
  }

  private openMailClient(): void {
    const name = this.name().trim();
    const subject = name ? `Portfolio — ${name}` : "Portfolio request";
    const body = this.message().trim() + (name ? `\n\n— ${name}` : "");
    this.document.location.href =
      `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  private later(fn: () => void, ms: number): void {
    this.timers.push(setTimeout(fn, ms));
  }
}
