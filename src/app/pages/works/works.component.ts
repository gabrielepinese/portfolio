import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ItemListComponent } from "../../shared/ui/item-list/item-list.component";
import { LIST_ITEMS, CompanyList } from "../../core/models/company-list";

@Component({
  selector: "app-works",
  imports: [CommonModule, ItemListComponent],
  templateUrl: "./works.component.html",
  styleUrl: "./works.component.scss",
})
export class WorksComponent {
  companyList: CompanyList[] = LIST_ITEMS;
}
