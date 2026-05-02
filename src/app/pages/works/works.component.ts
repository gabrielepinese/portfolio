import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ItemListComponent } from "../../shared/ui/item-list/item-list.component";
import { LIST_ITEMS, CompanyList } from "../../core/models/company-list";

@Component({
  selector: "app-works",
  imports: [ItemListComponent],
  templateUrl: "./works.component.html",
  styleUrl: "./works.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorksComponent {
  readonly companyList: CompanyList[] = LIST_ITEMS;
}
