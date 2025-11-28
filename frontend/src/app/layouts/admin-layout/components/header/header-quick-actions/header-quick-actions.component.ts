import { Component, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuickAction } from '../../../../../core/models/notification.model';

/**
 * Dropdown de ações rápidas no header
 */
@Component({
  selector: 'app-header-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-quick-actions-wrapper">
      <button
        class="header-btn"
        [class.active]="isOpen()"
        (click)="toggle()"
        title="Ações rápidas">
        <i class="fa-solid fa-th-large"></i>
      </button>

      <div class="header-dropdown quick-actions-dropdown" [class.show]="isOpen()">
        <div class="dropdown-header">
          <h6>Ações Rápidas</h6>
        </div>

        <div class="dropdown-body">
          <div class="quick-actions-grid">
            @for (action of actions(); track action.id) {
              @if (action.route) {
                <a
                  class="quick-action-item"
                  [routerLink]="action.route"
                  (click)="close()">
                  <div class="quick-action-icon" [class]="'bg-light-' + action.color">
                    <i [class]="action.icon"></i>
                  </div>
                  <span class="quick-action-label">{{ action.label }}</span>
                </a>
              } @else {
                <button
                  class="quick-action-item"
                  (click)="executeAction(action)">
                  <div class="quick-action-icon" [class]="'bg-light-' + action.color">
                    <i [class]="action.icon"></i>
                  </div>
                  <span class="quick-action-label">{{ action.label }}</span>
                </button>
              }
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-quick-actions-wrapper {
      position: relative;
    }

    .quick-actions-dropdown {
      width: 280px;
    }
  `]
})
export class HeaderQuickActionsComponent {
  private elementRef = inject(ElementRef);

  isOpen = signal(false);

  // Ações rápidas disponíveis
  actions = signal<QuickAction[]>([
    {
      id: 'new-task',
      label: 'Nova Tarefa',
      icon: 'fa-solid fa-plus',
      color: 'primary',
      route: '/todos'
    },
    {
      id: 'new-delivery',
      label: 'Nova Entrega',
      icon: 'fa-solid fa-truck',
      color: 'success',
      route: '/deliveries/new'
    },
    {
      id: 'new-client',
      label: 'Novo Cliente',
      icon: 'fa-solid fa-user-plus',
      color: 'info',
      route: '/clients/new'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: 'fa-solid fa-chart-bar',
      color: 'warning',
      route: '/reports'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'fa-solid fa-cog',
      color: 'secondary',
      route: '/settings'
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: 'fa-solid fa-question-circle',
      color: 'dark',
      route: '/help'
    }
  ]);

  /**
   * Fecha ao clicar fora
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  executeAction(action: QuickAction): void {
    if (action.action) {
      action.action();
    }
    this.close();
  }
}
