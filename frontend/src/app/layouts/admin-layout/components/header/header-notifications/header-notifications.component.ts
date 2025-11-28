import { Component, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Notification } from '../../../../../core/models/notification.model';

/**
 * Dropdown de notificações no header
 */
@Component({
  selector: 'app-header-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-notifications-wrapper">
      <button
        class="header-btn"
        [class.active]="isOpen()"
        (click)="toggle()"
        title="Notificações">
        <i class="fa-solid fa-bell"></i>
        @if (unreadCount() > 0) {
          <span class="notification-badge">{{ unreadCount() }}</span>
        }
      </button>

      <div class="header-dropdown" [class.show]="isOpen()">
        <div class="dropdown-header">
          <h6>Notificações</h6>
          @if (unreadCount() > 0) {
            <span class="badge badge-light-primary">{{ unreadCount() }} novas</span>
          }
        </div>

        <div class="dropdown-body">
          @if (notifications().length > 0) {
            @for (notification of notifications(); track notification.id) {
              <div
                class="notification-item"
                [class.unread]="!notification.read"
                (click)="markAsRead(notification)">
                <div class="notification-icon" [class]="'bg-light-' + notification.type">
                  <i [class]="getIcon(notification)"></i>
                </div>
                <div class="notification-content">
                  <p class="notification-title">{{ notification.title }}</p>
                  <p class="notification-text">{{ notification.message }}</p>
                  <span class="notification-time">{{ getTimeAgo(notification.timestamp) }}</span>
                </div>
              </div>
            }
          } @else {
            <div class="empty-notifications">
              <i class="fa-regular fa-bell-slash"></i>
              <p>Sem notificações</p>
            </div>
          }
        </div>

        <div class="dropdown-footer">
          <a routerLink="/notifications" (click)="close()">Ver todas as notificações</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-notifications-wrapper {
      position: relative;
    }

    .empty-notifications {
      padding: 40px 20px;
      text-align: center;
      color: var(--text-muted);

      i {
        font-size: 2.5rem;
        margin-bottom: 10px;
        display: block;
      }

      p {
        margin: 0;
        font-size: 13px;
      }
    }
  `]
})
export class HeaderNotificationsComponent {
  private elementRef = inject(ElementRef);

  isOpen = signal(false);

  // Mock de notificações (substituir por service real)
  notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Nova tarefa atribuída',
      message: 'Você foi atribuído à tarefa "Implementar dashboard"',
      type: 'info',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
      read: false
    },
    {
      id: '2',
      title: 'Tarefa concluída',
      message: 'A tarefa "Criar componentes" foi marcada como concluída',
      type: 'success',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
      read: false
    },
    {
      id: '3',
      title: 'Prazo próximo',
      message: 'A tarefa "Revisar código" vence amanhã',
      type: 'warning',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      read: true
    }
  ]);

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

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

  markAsRead(notification: Notification): void {
    this.notifications.update(list =>
      list.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  }

  getIcon(notification: Notification): string {
    if (notification.icon) return notification.icon;

    const icons: Record<string, string> = {
      info: 'fa-solid fa-info',
      success: 'fa-solid fa-check',
      warning: 'fa-solid fa-exclamation',
      danger: 'fa-solid fa-times'
    };
    return icons[notification.type] || 'fa-solid fa-bell';
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Agora mesmo';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} dias atrás`;

    return date.toLocaleDateString('pt-BR');
  }
}
