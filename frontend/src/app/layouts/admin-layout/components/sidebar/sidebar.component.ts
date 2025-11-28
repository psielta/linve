import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar.service';
import { MenuService } from '../../services/menu.service';
import { MenuItemComponent } from './menu-item/menu-item.component';

/**
 * Sidebar colapsável estilo Metronic
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, MenuItemComponent],
  template: `
    <aside class="admin-sidebar" [class.collapsed]="sidebarService.isCollapsed()">
      <!-- Logo -->
      <div class="sidebar-logo">
        <a routerLink="/dashboard">
          <i class="fa-solid fa-layer-group logo-icon"></i>
          <span class="logo-text">Linve</span>
        </a>
      </div>

      <!-- Menu -->
      <nav class="sidebar-menu">
        <ul class="menu-nav">
          @for (item of menuService.filteredItems(); track item.id) {
            @if (item.separator) {
              <li class="menu-separator">
                <span class="separator-text">{{ item.label }}</span>
              </li>
            } @else {
              <app-menu-item
                [item]="item"
                [depth]="0"
                [isCollapsed]="sidebarService.isCollapsed()" />
            }
          }
        </ul>
      </nav>

      <!-- Footer com toggle -->
      <div class="sidebar-footer">
        <button
          class="toggle-btn"
          (click)="sidebarService.toggle()"
          [title]="sidebarService.isCollapsed() ? 'Expandir menu' : 'Recolher menu'">
          <i class="fa-solid"
             [class.fa-angles-right]="sidebarService.isCollapsed()"
             [class.fa-angles-left]="!sidebarService.isCollapsed()"></i>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class SidebarComponent {
  sidebarService = inject(SidebarService);
  menuService = inject(MenuService);
  private router = inject(Router);

  constructor() {
    // Fecha sidebar mobile ao navegar
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidebarService.closeMobile();
      });
  }
}
