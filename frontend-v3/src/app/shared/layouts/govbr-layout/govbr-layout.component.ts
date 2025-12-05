import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BrBreadcrumb } from "@govbr-ds/webcomponents-angular/standalone";
import { FooterComponent } from "../../components/footer/footer.component";
import { HeaderComponent } from "../../components/header/header.component";
import { MenuComponent } from "../../components/menu/menu.component";

interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: "app-govbr-layout",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    BrBreadcrumb,
  ],
  templateUrl: "./govbr-layout.component.html",
  styleUrls: ["./govbr-layout.component.scss"],
})
export class GovbrLayoutComponent {
  isMenuVisible = true;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: "Início", url: "/app", active: true },
  ];

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }
}
