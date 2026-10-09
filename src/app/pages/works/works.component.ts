import { afterNextRender, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ItemListComponent } from "../../shared/ui/item-list/item-list.component";
import { LIST_ITEMS, CompanyList } from "../../core/models/company-list";
import { PROJECT_ITEMS, Project } from "../../core/models/project-list";

@Component({
  selector: "app-works",
  imports: [ItemListComponent],
  templateUrl: "./works.component.html",
  styleUrl: "./works.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);

  readonly companyList: CompanyList[] = LIST_ITEMS;
  readonly projectList: Project[] = PROJECT_ITEMS;

  constructor() {
    afterNextRender(() => {
      const fragment = this.route.snapshot.fragment;
      if (!fragment) return;
      setTimeout(() => {
        this.document.getElementById(fragment)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  }
}
