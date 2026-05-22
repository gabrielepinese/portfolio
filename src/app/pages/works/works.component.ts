import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { ContentService } from "../../core/services/content.service";
import { isPlatformBrowser } from "@angular/common";
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
export class WorksComponent implements AfterViewInit {
  readonly c = inject(ContentService).c;
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  readonly companyList: CompanyList[] = LIST_ITEMS;
  readonly projectList: Project[] = PROJECT_ITEMS;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const fragment = this.route.snapshot.fragment;
    if (fragment) {
      setTimeout(() => {
        document
          .getElementById(fragment)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }
}
