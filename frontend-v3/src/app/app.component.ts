import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BrBreadcrumb } from "@govbr-ds/webcomponents-angular/standalone";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { HeaderComponent } from "./shared/components/header/header.component";
import { MenuComponent } from "./shared/components/menu/menu.component";

interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    MenuComponent,
    FooterComponent,
    BrBreadcrumb,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  isMenuVisible = true;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: "Página anterior 01", url: "javascript:void(0)" },
    { label: "Página anterior 02", url: "javascript:void(0)" },
    { label: "Página anterior 03", url: "javascript:void(0)" },
    { label: "Página anterior 04", url: "javascript:void(0)" },
    { label: "Página atual", url: "javascript:void(0)", active: true },
  ];

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }
}
