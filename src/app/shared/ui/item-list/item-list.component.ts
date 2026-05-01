import { Component, input } from "@angular/core";

@Component({
  selector: "app-item-list",
  imports: [],
  templateUrl: "./item-list.component.html",
  styleUrl: "./item-list.component.scss",
})
export class ItemListComponent {
  link = input.required<string>();
  from = input.required<string>();
  to = input.required<string>();
  company = input.required<string>();
  title = input.required<string>();
  desc = input.required<string>();
  chips = input.required<string[]>();

  goto(url: string) {
    window.open(url);
  }
}
