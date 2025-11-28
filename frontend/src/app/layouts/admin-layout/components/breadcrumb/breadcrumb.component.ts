import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BreadcrumbService } from '../../services/breadcrumb.service';

/**
 * Componente de breadcrumbs automáticos
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="admin-breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        <!-- Home -->
        <li class="breadcrumb-item">
          <a routerLink="/dashboard" class="breadcrumb-link home-link" title="Dashboard">
            <i class="fa-solid fa-house"></i>
          </a>
        </li>

        <!-- Dynamic breadcrumbs -->
        @for (item of breadcrumbs(); track item.label; let isLast = $last) {
          <li class="breadcrumb-item" [class.active]="isLast">
            @if (isLast) {
              <span class="breadcrumb-current">{{ item.label }}</span>
            } @else {
              <a [routerLink]="item.route" class="breadcrumb-link">
                {{ item.label }}
              </a>
            }
          </li>
        }
      </ol>

      <!-- Page title (opcional) -->
      @if (pageTitle()) {
        <h1 class="page-title">{{ pageTitle() }}</h1>
      }
    </nav>
  `,
  styles: [`
    .admin-breadcrumb {
      margin-bottom: 20px;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 13px;

      &:not(:first-child)::before {
        content: '/';
        margin-right: 8px;
        color: var(--text-muted);
      }
    }

    .breadcrumb-link {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary-color);
      }
    }

    .home-link {
      font-size: 14px;
    }

    .breadcrumb-current {
      color: var(--text-color);
      font-weight: 500;
    }

    .page-title {
      margin: 10px 0 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }
  `]
})
export class BreadcrumbComponent {
  private breadcrumbService = inject(BreadcrumbService);

  breadcrumbs = this.breadcrumbService.breadcrumbs;
  pageTitle = this.breadcrumbService.pageTitle;
}
