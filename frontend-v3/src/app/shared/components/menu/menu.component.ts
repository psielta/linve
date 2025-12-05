import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router, RouterModule } from "@angular/router";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { MenuItem } from "./menu-item.model";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit, OnDestroy {
  itemAtivo: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Define o item ativo baseado na rota atual ao inicializar
    this.setActiveItemFromRoute(this.router.url);

    // Escuta mudanças de rota para atualizar o item ativo
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.setActiveItemFromRoute(event.url);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  menuItems: MenuItem[] = [
    { id: "dashboard", name: "Dashboard", icon: "fas fa-home", url: "/app" },
    { id: "clientes", name: "Clientes", icon: "fas fa-users", url: "/app/clientes" },
    { id: "culinarias", name: "Culinárias", icon: "fas fa-utensils", url: "/app/culinarias" },
    { id: "categorias", name: "Categorias", icon: "fas fa-tags", url: "/app/categorias" },
    { id: "adicionais", name: "Adicionais", icon: "fas fa-plus-circle", url: "/app/adicionais" },
    { id: "produtos", name: "Produtos", icon: "fas fa-box", url: "/app/produtos" },
  ];

  toggleFolder(id: string) {
    this.menuItems.forEach((item) => {
      if (item.children) {
        item.expanded = item.id === id ? !item.expanded : false;
      }
    });
  }

  // Método para definir item ativo
  setActiveItem(id: string) {
    this.itemAtivo = id;
  }

  // Método para definir item ativo baseado na rota
  setActiveItemFromRoute(url: string) {
    // Remove parâmetros de query da URL
    const cleanUrl = url.split("?")[0];

    // Mapeia URLs para IDs dos itens do menu
    const routeToIdMap: { [key: string]: string } = {
      "/app": "dashboard",
      "/app/clientes": "clientes",
      "/app/produtos": "produtos",
      "/app/categorias": "categorias",
      "/app/culinarias": "culinarias",
      "/app/adicionais": "adicionais",
    };

    const activeId = routeToIdMap[cleanUrl];
    if (activeId) {
      this.itemAtivo = activeId;
      return;
    }

    if (cleanUrl.startsWith("/app/categorias")) {
      this.itemAtivo = "categorias";
      return;
    }

    if (cleanUrl.startsWith("/app/produtos")) {
      this.itemAtivo = "produtos";
      return;
    }

    if (cleanUrl.startsWith("/app/adicionais")) {
      this.itemAtivo = "adicionais";
      return;
    }

    if (cleanUrl.startsWith("/app/clientes")) {
      this.itemAtivo = "clientes";
      return;
    }

    if (cleanUrl.startsWith("/app/categorias")) {
      this.itemAtivo = "categorias";
      return;
    }

    // Se não encontrar uma correspondência exata, define como null
    this.itemAtivo = null;
  }
}
