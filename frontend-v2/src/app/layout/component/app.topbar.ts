import { Component, effect } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/services/auth.service';
import { TenantService } from '../../core/services/tenant.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppConfigurator,
        MenuModule,
        SelectModule,
        FormsModule,
        ButtonModule
    ],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/app">
                    <span class="text-primary font-bold text-2xl">LINVE</span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <!-- Organization Selector -->
                @if (orgOptions.length > 1) {
                    <p-select
                        [options]="orgOptions"
                        [ngModel]="currentOrgId"
                        (ngModelChange)="onOrganizationChange($event)"
                        optionLabel="label"
                        optionValue="value"
                        [style]="{ minWidth: '180px' }"
                        class="hidden lg:flex"
                    />
                }

                <!-- Theme Toggle, Colors & User Menu -->
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [class]="layoutService.isDarkTheme() ? 'pi pi-moon' : 'pi pi-sun'"></i>
                    </button>
                    <div class="relative">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>
                    <button type="button" class="layout-topbar-action" (click)="userMenu.toggle($event)">
                        <i class="pi pi-user"></i>
                    </button>
                </div>
                <p-menu #userMenu [popup]="true" [model]="userMenuItems"></p-menu>
            </div>
        </div>
    `
})
export class AppTopbar {
    userMenuItems: MenuItem[] = [];

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private tenantService: TenantService,
        private router: Router
    ) {
        // Rebuild menu when user or organization changes
        effect(() => {
            // Subscribe to reactive signals
            const user = this.authService.user();
            const orgId = this.tenantService.currentOrganizationId();
            const orgName = this.tenantService.currentOrganizationName();
            const role = this.tenantService.currentRole();

            // Rebuild menu with current data
            this.userMenuItems = this.buildUserMenu(user, orgName || '', role || '');
        });
    }

    get currentOrgId() {
        return this.tenantService.currentOrganizationId();
    }

    get orgOptions() {
        return this.authService.organizations().map(m => ({
            label: m.organization.nome,
            value: m.organization.id
        }));
    }

    private buildUserMenu(user: any, orgName: string, role: string): MenuItem[] {
        return [
            {
                label: user?.nome || 'Usuário',
                icon: 'pi pi-user',
                disabled: true
            },
            {
                label: user?.email || '',
                icon: 'pi pi-envelope',
                disabled: true
            },
            {
                label: orgName || '',
                icon: 'pi pi-building',
                disabled: true
            },
            {
                separator: true
            },
            {
                label: 'Minha Conta',
                icon: 'pi pi-cog',
                command: () => {
                    this.router.navigate(['/app/account']);
                }
            },
            {
                separator: true
            },
            {
                label: 'Sair',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.logout();
                }
            }
        ];
    }

    onOrganizationChange(orgId: number): void {
        this.tenantService.setOrganization(orgId);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    logout() {
        this.authService.logout();
    }
}
