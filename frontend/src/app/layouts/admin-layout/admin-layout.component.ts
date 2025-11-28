import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';

/**
 * Layout principal do Admin Dashboard
 * Inspirado no Metronic 8 Theme
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbComponent
  ],
  template: `
    <div class="admin-layout"
         [class.sidebar-collapsed]="sidebarService.isCollapsed()"
         [class.sidebar-mobile-open]="sidebarService.isMobileOpen()">

      <!-- Overlay para mobile -->
      <div class="sidebar-overlay" (click)="sidebarService.closeMobile()"></div>

      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main Content Wrapper -->
      <div class="admin-wrapper">
        <!-- Header -->
        <app-header />

        <!-- Content Area -->
        <main class="admin-content">
          <!-- Breadcrumbs -->
          <app-breadcrumb />

          <!-- Page Content -->
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AdminLayoutComponent {
  sidebarService = inject(SidebarService);

  /**
   * Fecha sidebar mobile ao pressionar ESC
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.sidebarService.isMobileOpen()) {
      this.sidebarService.closeMobile();
    }
  }

  /**
   * Fecha sidebar mobile ao redimensionar para desktop
   */
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 991.98 && this.sidebarService.isMobileOpen()) {
      this.sidebarService.closeMobile();
    }
  }
}
