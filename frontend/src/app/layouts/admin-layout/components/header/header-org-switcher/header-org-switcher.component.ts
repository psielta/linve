import { Component, signal, computed, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';

/**
 * Seletor de organização no header
 */
@Component({
  selector: 'app-header-org-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="header-org-switcher-wrapper">
      <button
        class="org-switcher-btn"
        [class.active]="isOpen()"
        (click)="toggle()"
        title="Trocar organização">
        <div class="org-avatar">
          {{ currentOrgInitials() }}
        </div>
        <span class="org-name d-none d-md-inline">{{ currentOrgName() }}</span>
        <i class="fa-solid fa-chevron-down org-arrow"></i>
      </button>

      <div class="header-dropdown org-dropdown" [class.show]="isOpen()">
        <div class="dropdown-header">
          <h6>Suas Organizações</h6>
        </div>

        <div class="dropdown-body">
          @for (membership of memberships(); track membership.organization.id) {
            <button
              class="org-item"
              [class.active]="membership.organization.id === currentOrgId()"
              (click)="selectOrg(membership.organization.id)">
              <div class="org-item-avatar">
                {{ getOrgInitials(membership.organization.nome) }}
              </div>
              <div class="org-item-info">
                <span class="org-item-name">{{ membership.organization.nome }}</span>
                <span class="org-item-role badge badge-light-{{ getRoleBadgeColor(membership.role) }}">
                  {{ getRoleLabel(membership.role) }}
                </span>
              </div>
              @if (membership.organization.id === currentOrgId()) {
                <i class="fa-solid fa-check org-item-check"></i>
              }
            </button>
          }

          @if (memberships().length === 0) {
            <div class="empty-orgs">
              <i class="fa-solid fa-building"></i>
              <p>Nenhuma organização</p>
            </div>
          }
        </div>

        <div class="dropdown-footer">
          <a href="#" (click)="createNewOrg($event)">
            <i class="fa-solid fa-plus me-2"></i>
            Criar nova organização
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header-org-switcher-wrapper {
      position: relative;
    }

    .org-switcher-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color);
      }

      &.active {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
      }
    }

    .org-avatar {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
    }

    .org-name {
      font-size: 13px;
      font-weight: 500;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .org-arrow {
      font-size: 10px;
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .org-switcher-btn.active .org-arrow {
      transform: rotate(180deg);
    }

    .org-dropdown {
      width: 280px;
    }

    .org-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 15px;
      background: none;
      border: none;
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--bg-hover);
      }

      &.active {
        background: rgba(var(--primary-rgb), 0.08);
      }
    }

    .org-item-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--bg-secondary);
      color: var(--text-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .org-item.active .org-item-avatar {
      background: linear-gradient(135deg, var(--primary), var(--primary-hover));
      color: white;
    }

    .org-item-info {
      flex: 1;
      min-width: 0;
      text-align: left;
    }

    .org-item-name {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .org-item-role {
      font-size: 10px;
      padding: 2px 6px;
    }

    .org-item-check {
      color: var(--primary-color);
      font-size: 14px;
    }

    .empty-orgs {
      padding: 30px 20px;
      text-align: center;
      color: var(--text-muted);

      i {
        font-size: 2rem;
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
export class HeaderOrgSwitcherComponent {
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);

  isOpen = signal(false);

  // Dados da organização atual
  memberships = this.authService.memberships;

  currentOrgId = computed(() => {
    return this.authService.organizationId;
  });

  currentOrgName = computed(() => {
    return this.authService.organizationName || 'Selecionar Org';
  });

  currentOrgInitials = computed(() => {
    return this.getOrgInitials(this.currentOrgName());
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

  selectOrg(orgId: number): void {
    this.authService.switchOrganization(orgId);
    this.close();
  }

  createNewOrg(event: Event): void {
    event.preventDefault();
    // TODO: Implementar criação de organização
    console.log('Criar nova organização');
    this.close();
  }

  getOrgInitials(name: string | null): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      OWNER: 'Proprietário',
      ADMIN: 'Admin',
      MEMBER: 'Membro'
    };
    return labels[role] || role;
  }

  getRoleBadgeColor(role: string): string {
    const colors: Record<string, string> = {
      OWNER: 'primary',
      ADMIN: 'warning',
      MEMBER: 'info'
    };
    return colors[role] || 'secondary';
  }
}
