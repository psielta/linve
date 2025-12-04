import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { MediaUrlPipe } from '../../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-organization-switcher',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './organization-switcher.component.html',
  styleUrl: './organization-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationSwitcherComponent {
  private authService = inject(AuthService);
  private tenantService = inject(TenantService);
  private elementRef = inject(ElementRef);

  organizations = this.authService.organizations;
  currentOrg = this.tenantService.currentOrganization;
  currentOrgName = this.tenantService.currentOrganizationName;

  isDropdownOpen = false;

  private readonly avatarColors = [
    '#1351B4', // Azul
    '#168821', // Verde
    '#D4570A', // Laranja
    '#9C27B0', // Roxo
    '#00796B', // Teal
    '#C2185B', // Rosa
    '#5D4037', // Marrom
    '#455A64', // Cinza azulado
  ];

  getAvatarBgColor(orgId: number | undefined): string {
    if (!orgId) return this.avatarColors[0];
    return this.avatarColors[orgId % this.avatarColors.length];
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'OWNER': return 'Proprietário';
      case 'ADMIN': return 'Administrador';
      case 'MEMBER': return 'Membro';
      default: return role;
    }
  }

  /** Mostrar se tiver pelo menos 1 organização */
  get showSwitcher(): boolean {
    return this.organizations().length >= 1;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOrganization(orgId: number): void {
    this.tenantService.setOrganization(orgId);
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
