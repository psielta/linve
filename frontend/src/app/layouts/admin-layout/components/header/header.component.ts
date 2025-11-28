import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { HeaderSearchComponent } from './header-search/header-search.component';
import { HeaderNotificationsComponent } from './header-notifications/header-notifications.component';
import { HeaderQuickActionsComponent } from './header-quick-actions/header-quick-actions.component';
import { HeaderOrgSwitcherComponent } from './header-org-switcher/header-org-switcher.component';
import { HeaderUserMenuComponent } from './header-user-menu/header-user-menu.component';

/**
 * Header do Admin Dashboard
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    HeaderSearchComponent,
    HeaderNotificationsComponent,
    HeaderQuickActionsComponent,
    HeaderOrgSwitcherComponent,
    HeaderUserMenuComponent
  ],
  template: `
    <header class="admin-header">
      <!-- Left: Mobile toggle -->
      <div class="header-left">
        <button
          class="header-btn d-lg-none"
          (click)="sidebarService.toggleMobile()"
          title="Menu">
          <i class="fa-solid fa-bars"></i>
        </button>

        <!-- Search -->
        <app-header-search class="d-none d-lg-block" />
      </div>

      <!-- Right: Actions -->
      <div class="header-right">
        <!-- Quick Actions -->
        <app-header-quick-actions />

        <!-- Org Switcher -->
        <app-header-org-switcher />

        <!-- Notifications -->
        <app-header-notifications />

        <!-- Theme Toggle -->
        <button
          class="header-btn"
          (click)="themeService.cycle()"
          [title]="themeService.getLabel()">
          <i class="fa-solid" [ngClass]="themeService.getIcon()"></i>
        </button>

        <!-- User Menu -->
        <app-header-user-menu />
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class HeaderComponent {
  sidebarService = inject(SidebarService);
  themeService = inject(ThemeService);
}
