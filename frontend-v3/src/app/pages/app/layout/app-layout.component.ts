import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrButton } from '@govbr-ds/webcomponents-angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BrButton],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  sidebarOpen = signal(true);

  menuItems: MenuItem[] = [
    { icon: 'fas fa-home', label: 'Dashboard', route: '/app' },
    { icon: 'fas fa-list', label: 'Tarefas', route: '/app/todos' },
    { icon: 'fas fa-utensils', label: 'Culinárias', route: '/app/culinarias' },
    { icon: 'fas fa-tags', label: 'Categorias', route: '/app/categorias' },
    { icon: 'fas fa-box', label: 'Produtos', route: '/app/produtos' },
    { icon: 'fas fa-plus-circle', label: 'Adicionais', route: '/app/adicionais' },
    { icon: 'fas fa-users', label: 'Clientes', route: '/app/clientes' },
    { icon: 'fas fa-user-cog', label: 'Minha Conta', route: '/app/account' }
  ];

  constructor(
    public authService: AuthService,
    public tenantService: TenantService
  ) {}

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
