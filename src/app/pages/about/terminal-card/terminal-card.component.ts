import { ChangeDetectionStrategy, Component } from "@angular/core";

interface ProfileEntry {
  prop: string;
  value: string;
}

@Component({
  selector: "app-terminal-card",
  imports: [],
  templateUrl: "./terminal-card.component.html",
  styleUrl: "./terminal-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalCardComponent {
  readonly filename = "profile.ts";

  readonly entries: ProfileEntry[] = [
    { prop: "name", value: '"Gabriele Pinese"' },
    { prop: "role", value: '"Frontend Developer"' },
    { prop: "passion", value: '"Building Robust Systems"' },
    { prop: "location", value: '"Milan, Italy"' },
    { prop: "status", value: '"Employed full-time"' },
  ];
}
