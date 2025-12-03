import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "home.component.html",
  styleUrls: ["home.component.css"],
})
export class HomeComponent {
  /** Links rápidos para demos de componentes */
  links = [
    { label: "Formulários", path: "/formularios" },
    { label: "Icones", path: "/icon" },
    { label: "Inputs", path: "/input" },
    { label: "Select", path: "/select" },
    { label: "Checkbox", path: "/checkbox" },
    { label: "Radio", path: "/radio" },
    { label: "Switch", path: "/switch" },
  ];
}
