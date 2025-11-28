import { Component, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';

/**
 * Menu do usuário no header
 */
@Component({
  selector: 'app-header-user-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="header-user-menu-wrapper">
      <button
        class="user-menu-btn"
        [class.active]="isOpen()"
        (click)="toggle()"
        title="Minha conta">
        <div class="user-avatar">
          {{ userInitials() }}
        </div>
      </button>

      <div class="header-dropdown user-dropdown" [class.show]="isOpen()">
        <!-- User Info -->
        <div class="user-info-section">
          <div class="user-avatar-lg">
            {{ userInitials() }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ userName() }}</span>
            <span class="user-email">{{ userEmail() }}</span>
            <span class="user-role badge badge-light-{{ roleBadgeColor() }}">
              {{ roleLabel() }}
            </span>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <!-- Menu Items -->
        <div class="dropdown-body">
          <a class="user-menu-item" routerLink="/profile" (click)="close()">
            <i class="fa-solid fa-user"></i>
            <span>Meu Perfil</span>
          </a>
          <a class="user-menu-item" routerLink="/settings/account" (click)="close()">
            <i class="fa-solid fa-gear"></i>
            <span>Configurações</span>
          </a>
          <a class="user-menu-item" routerLink="/billing" (click)="close()">
            <i class="fa-solid fa-credit-card"></i>
            <span>Faturamento</span>
          </a>

          <div class="dropdown-divider"></div>

          <a class="user-menu-item" routerLink="/help" (click)="close()">
            <i class="fa-solid fa-circle-question"></i>
            <span>Central de Ajuda</span>
          </a>
          <a class="user-menu-item" href="mailto:suporte@linve.com.br" (click)="close()">
            <i class="fa-solid fa-envelope"></i>
            <span>Contato</span>
          </a>
        </div>

        <!-- Logout -->
        <div class="dropdown-footer">
          <button class="logout-btn" (click)="logout()">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Sair da conta</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-user-menu-wrapper {
      position: relative;
    }

    .user-menu-btn {
      display: flex;
      align-items: center;
      padding: 0;
      background: none;
      border: 2px solid transparent;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--primary-color);
      }

      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
      }
    }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-dropdown {
      width: 280px;
      right: 0;
      left: auto;
    }

    .user-info-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px;
    }

    .user-avatar-lg {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }

    .user-role {
      font-size: 10px;
      padding: 2px 8px;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 5px 0;
    }

    .user-menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 15px;
      color: var(--text-color);
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-hover);
        color: var(--primary-color);
      }

      i {
        width: 18px;
        text-align: center;
        color: var(--text-muted);
        transition: color 0.2s ease;
      }

      &:hover i {
        color: var(--primary-color);
      }

      span {
        font-size: 13px;
      }
    }

    .dropdown-footer {
      padding: 10px 12px;
      border-top: 1px solid var(--border-color);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      background: rgba(var(--danger-rgb), 0.08);
      border: 1px solid rgba(var(--danger-rgb), 0.15);
      border-radius: 8px;
      color: var(--danger);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 13px;
      font-weight: 500;

      &:hover {
        background: rgba(var(--danger-rgb), 0.15);
        border-color: rgba(var(--danger-rgb), 0.25);
      }

      i {
        font-size: 14px;
      }
    }
  `]
})
export class HeaderUserMenuComponent {
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);

  isOpen = signal(false);

  // Dados do usuário
  userName = computed(() => this.authService.currentUser?.nome || 'Usuário');
  userEmail = computed(() => this.authService.currentUser?.email || '');
  userInitials = computed(() => this.authService.getUserInitials());

  currentRole = this.authService.currentRole;

  roleLabel = computed(() => {
    const role = this.currentRole();
    const labels: Record<string, string> = {
      OWNER: 'Proprietário',
      ADMIN: 'Administrador',
      MEMBER: 'Membro'
    };
    return labels[role || ''] || 'Membro';
  });

  roleBadgeColor = computed(() => {
    const role = this.currentRole();
    const colors: Record<string, string> = {
      OWNER: 'primary',
      ADMIN: 'warning',
      MEMBER: 'info'
    };
    return colors[role || ''] || 'secondary';
  });

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

  logout(): void {
    this.close();
    this.authService.logout();
  }
}
